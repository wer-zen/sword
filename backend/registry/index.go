// Package registry holds the in-memory application index built from all
// enumerable sources.
package registry

import (
	"context"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/sahilm/fuzzy"

	"sword/backend/metadata"
	"sword/backend/models"
	"sword/backend/sources"
)

// AppIndex is the in-memory, deduplicated catalog. It is safe for concurrent
// use and is rebuilt periodically in the background.
type AppIndex struct {
	mu      sync.RWMutex
	entries map[string]*models.AppEntry
	ordered []*models.AppEntry

	buildMu sync.Mutex // serializes concurrent Build calls
	srcs      []sources.Source
	resolvers []metadata.AppStreamResolver
}

// NewAppIndex returns an empty index. Pass only enumerable sources (pacman,
// flatpak); the AUR cannot be listed and is queried live by the search layer.
func NewAppIndex(srcs []sources.Source, resolvers []metadata.AppStreamResolver) *AppIndex {
	return &AppIndex{
		entries:   map[string]*models.AppEntry{},
		srcs:      srcs,
		resolvers: resolvers,
	}
}

// Build queries every source, enriches packages with AppStream ids, merges
// duplicates and atomically swaps in the new index. A failing source is
// logged and skipped.
func (ix *AppIndex) Build(ctx context.Context) {
	ix.buildMu.Lock()
	defer ix.buildMu.Unlock()

	var all []models.SourcePackage
	for _, s := range ix.srcs {
		pkgs, err := s.Search(ctx, "")
		if err != nil {
			log.Printf("registry: build %s: %v", s.Name(), err)
			continue
		}
		all = append(all, pkgs...)
	}

	// Enrich pacman-style packages with an AppStream id so they dedup against
	// their flatpak counterparts.
	for i := range all {
		if all[i].AppStreamID == "" {
			if rec := metadata.Resolve(ix.resolvers, all[i].ID); rec != nil {
				all[i].AppStreamID = rec.ID
			}
		}
	}

	groups := map[string][]models.SourcePackage{}
	for _, p := range all {
		k := DedupKey(p)
		groups[k] = append(groups[k], p)
	}

	entries := map[string]*models.AppEntry{}
	ordered := make([]*models.AppEntry, 0, len(groups))
	for _, g := range groups {
		e := Merge(g, ix.resolvers)
		if e == nil {
			continue
		}
		entries[e.ID] = e
		ordered = append(ordered, e)
	}

	ix.mu.Lock()
	ix.entries = entries
	ix.ordered = ordered
	ix.mu.Unlock()
	log.Printf("registry: index built, %d entries", len(ordered))
}

// StartAutoRebuild rebuilds the index every interval until ctx is cancelled.
func (ix *AppIndex) StartAutoRebuild(ctx context.Context, interval time.Duration) {
	go func() {
		t := time.NewTicker(interval)
		defer t.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-t.C:
				ix.Build(ctx)
			}
		}
	}()
}

type nameSource struct{ list []*models.AppEntry }

func (n nameSource) String(i int) string { return n.list[i].Name }
func (n nameSource) Len() int            { return len(n.list) }

// Search returns index entries whose name fuzzy-matches query, ordered by
// match quality. An empty query returns nil.
func (ix *AppIndex) Search(query string) []models.IndexEntry {
	query = strings.TrimSpace(query)
	if query == "" {
		return nil
	}
	ix.mu.RLock()
	list := ix.ordered
	ix.mu.RUnlock()

	matches := fuzzy.FindFrom(query, nameSource{list})
	out := make([]models.IndexEntry, 0, len(matches))
	for _, m := range matches {
		out = append(out, models.IndexEntry{App: *list[m.Index], Score: m.Score})
	}
	return out
}

// Get returns a copy of the entry with the given canonical id.
func (ix *AppIndex) Get(id string) (*models.AppEntry, error) {
	ix.mu.RLock()
	defer ix.mu.RUnlock()
	e, ok := ix.entries[strings.ToLower(id)]
	if !ok {
		return nil, fmt.Errorf("app not found: %s", id)
	}
	cp := *e
	return &cp, nil
}
