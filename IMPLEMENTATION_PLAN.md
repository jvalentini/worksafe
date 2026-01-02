# WorkSafe — Fuzzy + Adjacency Rewriting (Offline) Implementation Plan

## Goals (constraints locked-in)

- **100% offline**: no network calls; runs in-browser.
- **English-only**.
- **Works for short + long text**: Slack-sized messages and full emails.
- **Detect + rewrite**:
  - explicit profanity + insults (already)
  - **direct attacks**, **frustration**, **passive-aggressive language**, and (optionally) **sarcasm**
- **Rewrite entire clauses/sentences** (not just individual word swaps).
- **Preserve meaning**: keep the claim, soften the delivery.
- **Output UX**: show original text + replacement modifications (fewer, larger replacements are acceptable).
- **No user customization knobs** for now (but design so it’s addable later).

Related: `ROADMAP.md`

---

## Decisions (locked in)

- **Clause boundaries**: default to rewriting at the sentence level (split on `. ! ? \n`).
- **Overlap policy**: clause-level rewrites win (they replace the whole span and override smaller replacements inside the span).
- **Quoted email threads**: do not rewrite lines that are part of quoted threads (lines starting with `>`).
- **Code blocks**: ignore everything inside triple-backtick fences, **except** lines that are code comments denoted by a leading `#` (those lines remain eligible for rewriting).
- **Protected tokens**: never modify URLs, `@handles`, or `#channels`.
- **Multi-sentence attacks**: if multiple consecutive sentences are attack/frustration-heavy, collapse into one softer sentence/paragraph.
- **Sarcasm**: opt-in only (default off).
- **Identity-based slurs**: rewrite them (remove identity targeting while preserving the claim’s intent).

---

## High-level architecture (target)

### Today
- Profanity: `obscenity` (good normalization, good recall)
- Insults: exact lookup
- Phrases: exact regex

### Target (sequential layers)

0. **Zone splitting** (quoted threads, code fences, protected tokens)
1. **Normalization + tokenization (shared)**
2. **Deterministic exact matches** (profanity/insults/known phrases)
3. **Clause/sentence rewrite templates** (exact, deterministic)
4. **Adjacency/windowed rules** (token proximity scoring)
5. **Optional**: phonetic/limited fuzzy token matching for edge cases
6. **Optional**: sarcasm heuristics (opt-in)

All detectors output **candidate spans** with:
- `startIndex`, `endIndex` into the original string
- `original` substring
- `replacement` string
- `type` and `confidence` metadata (internal)

Then we:
- sort candidates by position/priority
- drop overlaps deterministically
- apply replacements once (current `transformText` model)

---

## Milestone 0 — Evaluation corpus + success criteria (prerequisite)

**Why first**: fuzziness + adjacency is mostly about avoiding false positives.

### Deliverables
- A small but representative test corpus (unit tests) covering:
  - profanity obfuscation (spacing/punctuation/duplicates/leetspeak/confusables)
  - direct attacks (2nd-person attacks, including identity-targeting slurs)
  - frustration statements (non-targeted negativity)
  - passive-aggressive templates
  - quoted email threads (lines starting with `>` must not be rewritten)
  - code fences (```…``` ignored) and `#` comment lines inside fences (eligible)
  - protected tokens: URLs, `@handles`, `#channels` must not be modified
  - sarcasm examples (kept behind opt-in)
- Success criteria (initial):
  - no regressions on existing tests
  - minimal false positives on “business text” samples

### Implementation notes
- Add cases to existing unit tests under `src/lib/*.test.ts`.
- Track “must not rewrite” scenarios early:
  - quoted threads (`>`)
  - fenced code blocks (```…```), except `#` comment lines inside
  - inline code (`` `...` ``)
  - URLs, `@handles`, `#channels`

---

## Milestone 1 — Shared normalization + token model (foundation)

**Prereq**: Milestone 0 corpus exists.

### Goal
Create a shared normalization/tokenization layer that supports fuzzy adjacency while preserving original offsets.

### Deliverables
- `splitIntoZones(text)` identifies **excluded** regions and **eligible** regions:
  - excluded: quoted thread lines (`>`), fenced code blocks (```…```)
  - exception: `#` comment lines inside fenced blocks are eligible
- `tokenize(text)` returns an array of tokens:
  - `raw`, `normalized`, `startIndex`, `endIndex`, `kind`
  - `kind` includes protected tokens: `url`, `mention`, `channel`, `code`, `quote`, `word`, `whitespace`, `punctuation`
- `normalizeToken(raw)` applies:
  - lowercase
  - strip zero-width
  - collapse duplicates (bounded)
  - leetspeak/confusables mapping (reuse `obscenity` transformers if feasible; otherwise implement a small subset)
  - remove punctuation for *matching* only (do not alter indices)

### Guardrails
- Never emit detections whose span intersects excluded zones (quoted threads, fenced code), except eligible `#` comment lines inside code fences.
- Never modify protected tokens (URLs, `@handles`, `#channels`):
  - adjacency rules must treat them as barriers/anchors
  - clause rewrites must preserve them verbatim
- Keep normalization conservative for non-profanity words to avoid “assess”→“ass” style issues.
- Maintain a whitelist mechanism for known false positives.

---

## Milestone 2 — Sentence/clause segmentation + rewrite templates (simple, deterministic)

**Prereq**: Milestone 1 token model exists.

### Goal
Introduce clause/sentence rewrite capability with a small set of templates.

### Approach (start simple)
1. Segment input into sentences (heuristic):
   - split on `. ! ? \n` boundaries
   - keep delimiters
   - do not cross excluded zones (quoted threads, fenced code)
2. Within each sentence, detect a few high-confidence patterns (exact tokens, no fuzzy yet):
   - direct attack: `you/your` + insult/competence term in the same sentence
   - frustration: `this/that/it` + `is/was` + negative descriptor
3. If multiple consecutive sentences match (e.g., attack + frustration), collapse into a single softer sentence/paragraph.
4. Replace the *minimal* span that preserves meaning:
   - default: rewrite the whole sentence group (simplest + safest)
   - must preserve protected tokens (URLs, `@handles`, `#channels`) verbatim

### Templates (examples)
- Direct attack → behavior-focused concern:
  - “You are X” → “I’m concerned about X and would like to align on next steps.”
- Frustration → solution-oriented:
  - “This is unacceptable” → “This is concerning; I’d like to work through options to address it.”

### Output behavior
- Clause rewrites become single large `Detection` spans.
- They override smaller detections inside the rewritten span.

---

## Milestone 3 — Adjacency/windowed detection (core feature)

**Prereq**: Milestone 2 exists and passes corpus.

### Goal
Detect negative intent using proximity, not exact phrases.

### Deliverables
- Sliding window rule engine operating on tokens inside a sentence/clause:
  - window size (default: 6 tokens)
  - skip stopwords optionally
  - distance-weighted scoring
- Rule sets (incremental):
  1. **Direct attack** (high precision)
     - 2nd-person target + insult/competence term within window
  2. **Frustration** (medium precision)
     - “this/that/it” + copula + negative adjective within window
  3. **Passive-aggressive** (start from existing phrase lists + adjacency cues)

### Confidence + thresholds
- Each rule yields a confidence score.
- Only fire clause rewrite above a threshold; otherwise fall back to word/phrase replacements.

---

## Milestone 4 — Limited fuzzy matching (only where it helps)

**Prereq**: Milestone 3 stable with low false positives.

### Goal
Increase recall for obfuscated insults/attacks that normalization doesn’t catch.

### Options (do in order)
1. **Phonetic matching** for a curated set of high-impact insults/profanities.
2. **Very constrained edit-distance** matching:
   - only for tokens of similar length
   - only against a small curated list
   - never match inside longer safe words

### Guardrails
- Fuzzy matches should never directly trigger clause rewrite unless combined with target + negativity context.

---

## Milestone 5 — Sarcasm heuristics (opt-in)

**Prereq**: Milestone 4 done.

### Goal
Handle sarcasm with conservative heuristics and explicit opt-in.

### Deliverables
- A user-facing toggle (default off) stored locally.
- Heuristic cues (phrase list + punctuation patterns), conservative scoring.

### Guardrails
- Avoid rewriting praise/neutral statements that are not clearly sarcastic.
- Sarcasm rules should bias toward “suggested rewrite” unless confidence is high (or keep off entirely until proven).

---

## Milestone 6 — Integration + performance + regression controls

**Prereq**: Milestones 1–5.

### Deliverables
- Ensure detection remains fast enough for real-time typing/voice transcripts.
- Add micro-bench-ish tests or at least a performance note:
  - expected complexity: O(n) tokenization + O(n) window scanning per rule set
- Expand unit tests to cover:
  - overlap precedence
  - punctuation and casing preservation
  - “do not rewrite” zones (code/quotes/URLs)

---

## Non-goals (for this effort)

- Multilingual detection.
- User-editable dictionaries or sensitivity UI.
- Embedding models / on-device ML (too heavy for now).
- Network-based inference.

---

## Implementation order recap (strict prerequisites)

1. Milestone 0: corpus + success criteria
2. Milestone 1: normalization + tokens
3. Milestone 2: clause rewrites (exact patterns + multi-sentence collapsing)
4. Milestone 3: adjacency/windowed rules
5. Milestone 4: limited fuzzy matching
6. Milestone 5: sarcasm opt-in
7. Milestone 6: perf + regression hardening
