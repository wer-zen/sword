import { AppEntry } from "../types/app";
import { backendSearch } from "../ipc/backend";

export type SearchResult = AppEntry;

export type SearchResponse = {
  results: SearchResult[];
  total: number;
  query: string;
};

// searchApps runs a two-phase search against the Go backend. onPartial fires
// for the fast local phase; the returned promise resolves with the final,
// AUR-merged results.
export async function searchApps(
  query: string,
  opts: {
    signal?: AbortSignal;
    onPartial?: (res: SearchResponse) => void;
  } = {}
): Promise<SearchResponse> {
  const results = await backendSearch(
    query,
    (_phase, partial) => {
      opts.onPartial?.({ results: partial, total: partial.length, query });
    },
    opts.signal
  );
  return { results, total: results.length, query };
}
