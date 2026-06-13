"use client";

import { useState, useRef } from "react";

type Result = {
  id: number;
  content: string;
  createdAt: string;
  distance: number;
};

const SUGGESTIONS = [
  "spicy Indian food",
  "sweet dessert",
  "vegetarian breakfast",
  "programming tutorial",
  "South Indian crepe",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSearch(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch(
        `http://localhost:3000/documents/search?q=${encodeURIComponent(query.trim())}`
      );
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data: Result[] = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function matchStyle(distance: number): { color: string; label: string } {
    if (distance < 0.35) return { color: "var(--match-high)", label: "strong" };
    if (distance < 0.55) return { color: "var(--match-mid)", label: "good" };
    return { color: "var(--match-low)", label: "weak" };
  }

  const handleSuggestion = (s: string) => {
    setQuery(s);
    inputRef.current?.focus();
  };

  return (
    <div className="relative min-h-screen z-10">
      <div className="max-w-2xl mx-auto px-5 pt-16 pb-24">

        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <p
            className="text-xs tracking-[0.2em] uppercase mb-3"
            style={{ color: "var(--accent)", fontFamily: "var(--font-geist-mono)" }}
          >
            Vector similarity
          </p>
          <h1
            className="text-5xl leading-tight mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}
          >
            Semantic Search
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Find documents by meaning — not just matching words.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-5 animate-fade-in" style={{ animationDelay: "60ms" }}>
          <div className="relative flex items-center">
            {/* Search icon */}
            <svg
              className="absolute left-4 pointer-events-none"
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{ color: "var(--text-muted)" }}
            >
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you're looking for…"
              className="search-input w-full rounded-xl py-3 pl-11 pr-28 text-sm outline-none transition-all duration-200"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            />

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-30"
              style={{
                background: "var(--accent)",
                color: "#0c0b0a",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <svg
                    width="12" height="12" viewBox="0 0 12 12"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  >
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="12 8" fill="none" />
                  </svg>
                  Wait
                </span>
              ) : "Search"}
            </button>
          </div>
        </form>

        {/* Suggestion chips */}
        <div
          className="flex gap-2 flex-wrap mb-10 animate-fade-in"
          style={{ animationDelay: "120ms" }}
        >
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="text-xs px-3 py-1 rounded-full transition-all duration-150"
              style={{
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Result count */}
        {!loading && searched && results.length > 0 && (
          <p
            className="text-xs mb-4 animate-fade-in"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-geist-mono)" }}
          >
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm mb-4 animate-fade-in"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
          >
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && searched && results.length === 0 && !error && (
          <div
            className="text-center py-16 animate-fade-in"
            style={{ color: "var(--text-muted)" }}
          >
            <svg className="mx-auto mb-4 opacity-30" width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="17" cy="17" r="12" stroke="currentColor" strokeWidth="2" />
              <path d="M26 26L36 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 17h10M17 12v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="text-sm">No documents matched &ldquo;{query}&rdquo;</p>
          </div>
        )}

        {/* Results */}
        <div className="space-y-2">
          {results.map((item, i) => {
            const similarity = Math.round((1 - item.distance) * 100);
            const { color, label } = matchStyle(item.distance);
            return (
              <div
                key={item.id}
                className="result-card rounded-xl overflow-hidden animate-slide-up"
                style={{
                  animationDelay: `${i * 60}ms`,
                  border: "1px solid var(--border-subtle)",
                  background: "var(--surface)",
                }}
              >
                <div className="flex items-stretch">
                  {/* Colored left strip */}
                  <div
                    className="w-0.5 shrink-0 rounded-l-xl"
                    style={{ background: color }}
                  />

                  <div className="flex items-start gap-4 px-5 py-4 flex-1 min-w-0">
                    {/* Score */}
                    <div className="shrink-0 pt-0.5 text-right" style={{ minWidth: "3rem" }}>
                      <p
                        className="text-xl font-semibold leading-none"
                        style={{ color, fontFamily: "var(--font-geist-mono)" }}
                      >
                        {similarity}
                        <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>%</span>
                      </p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)", fontFamily: "var(--font-geist-mono)" }}>
                        {label}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="w-px self-stretch" style={{ background: "var(--border)" }} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                        {item.content}
                      </p>
                      <p
                        className="text-xs mt-2"
                        style={{ color: "var(--text-muted)", fontFamily: "var(--font-geist-mono)" }}
                      >
                        #{item.id} · {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
