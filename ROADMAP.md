# WorkSafe roadmap

This document tracks future-facing ideas. It is not a commitment.

## Current direction

- **100% offline (dictionary mode)**: No network calls; everything runs in-browser.
- **English-only** (for now).
- **Works for short + long text**: Slack messages and full emails.
- **Goal**: Improve detection and rewriting of negative language beyond explicit swear words.

## Near-term (next)

See also: `IMPLEMENTATION_PLAN.md`

### 1) Shared normalization pipeline (offline)

Unify normalization across profanity, insults, and phrase detection so obfuscated text is catchable without increasing false positives too much.

Candidates:
- Unicode normalization + confusables resolution
- Leetspeak resolution
- Strip/ignore non-alphabetic characters for matching (while preserving original offsets)
- Collapse repeated characters (e.g., `shiiiit` → `shit`)
- Remove zero-width characters

### 2) Token + offset model (enables adjacency rules)

Introduce a tokenizer that returns tokens with `startIndex`/`endIndex` and a `normalized` form (for matching), so we can do windowed/proximity logic without losing accurate replacement spans.

### 3) Adjacency/windowed detection (rule-based)

Add a rule layer that detects “negative intent” using proximity rather than exact phrases.

Examples:
- Direct attack: `you/your` near an insult term within N tokens.
- Frustration: `this/that/it` + copula (`is/was`) near negative descriptor within a clause.
- Passive-aggressive: known templates + adjacency with follow-up markers.
- Sarcasm (heuristic-only): short phrase cues (e.g., "yeah right", "sure", "thanks for nothing") and punctuation cues.

### 4) Clause/sentence rewrite templates (offline)

When adjacency rules trigger, rewrite entire clauses/sentences using templates rather than single-word swaps, while preserving meaning.

## Later (roadmap)

### Customization / governance

- User-editable custom dictionary overrides (local only).
- Sensitivity levels (strict/normal/lenient) with a test corpus.
- Remote-managed dictionaries (optional) with versioning and caching.
- Admin workflow/audit trail (at this point, a DB like Postgres can make sense).

### Smarter semantics (still offline)

- Lightweight sentiment scoring as a gating signal for rewrites.
- Better clause boundary detection and quote/code-block avoidance.

### Online/premium (optional)

- Context-aware rewrite via LLM (already supported) as the “high recall + best rewrite quality” mode.
