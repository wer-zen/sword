package metadata

// ResolveIcon returns the first non-empty icon URL found for any of keys,
// trying resolvers in order: local appstream, distro feed, flathub feed.
// It returns "" when nothing resolves, leaving the frontend to render a
// placeholder.
func ResolveIcon(resolvers []AppStreamResolver, keys ...string) string {
	for _, k := range keys {
		if k == "" {
			continue
		}
		for _, r := range resolvers {
			if rec := r.Lookup(k); rec != nil && rec.IconURL != "" {
				return rec.IconURL
			}
		}
	}
	return ""
}
