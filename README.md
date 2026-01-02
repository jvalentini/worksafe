# WorkSafe

Transform profanity and unprofessional language into workplace-appropriate communication.

## What It Does

WorkSafe takes your raw, unfiltered thoughts and converts them into professional text suitable for emails, Slack messages, or any workplace communication. Speak freely or paste your angry draft, and get a polished, professional version ready to send.

**Example:**
- Input: *"This is bullshit. Why can't you idiots figure this out? I'm sick of explaining the same damn thing."*
- Output: *"This is unexpected. Would it be possible to work through the details? I'd like to address explaining the same darn thing."*

With AI mode enabled:
- Output: *"I find this situation concerning. I'd appreciate if we could collaborate on finding a solution. I've noticed we've discussed this topic several times, and I'd like to ensure we're aligned going forward."*

## Features

- **Voice Input** - Speak naturally using your microphone (Web Speech API)
- **Text Input** - Paste or type text directly
- **Dictionary Mode** - Instant, local-only text transformation
- **AI Mode** - Context-aware rewriting via OpenAI (optional, requires API key)
- **Sarcasm Detection** - Detect and rewrite sarcastic language patterns (dictionary mode only)
- **Fuzzy Matching** - Catch variations of profanity and insults with intelligent matching
- **Multiple Output Formats** - Plain text and email-ready formatting
- **Compact Settings Panel** - Right sidebar on desktop, collapsible drawer on mobile
- **Privacy-Focused** - Dictionary mode runs entirely in your browser

### What Gets Filtered

| Category | Examples |
|----------|----------|
| Profanity | f*ck, sh*t, damn, hell |
| Insults | idiot, stupid, moron, incompetent |
| Aggressive phrases | "You always...", "Why can't you...", "This is ridiculous" |
| Passive-aggressive | "Per my last email", "As I already mentioned", "Friendly reminder" |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime
- Chrome, Edge, or another Chromium-based browser (for voice input)

### Installation

```bash
git clone <repo-url>
cd worksafe
bun install
```

### Development

```bash
bun run dev
```

Open http://localhost:3000 in your browser.

### Production Build

```bash
bun run build
bun run preview
```

## Usage

### Voice Mode

1. Click the microphone button
2. Speak naturally (profanity and all)
3. Click again to stop
4. View transformed output in real-time

### Text Mode

1. Switch to the "Text" tab
2. Paste or type your text
3. Click "Transform" (or press Ctrl+Enter)
4. Copy the result

### AI Mode (Optional)

For smarter, context-aware rewrites:

1. Open "API Settings"
2. Enter your OpenAI API key
3. Toggle "AI Rewrite" on
4. Transform text as usual

AI mode uses `gpt-4o-mini` for fast, cost-effective rewrites.

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **Build**: Bun bundler (HTML entrypoint)
- **Linting**: Biome + Oxlint
- **Profanity Detection**: [obscenity](https://github.com/jo3-l/obscenity)
- **Speech**: Web Speech API
- **AI**: OpenAI API (optional)

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Bun dev server |
| `bun run build` | Build static assets to `dist/` |
| `bun run preview` | Serve `dist/` locally |
| `bun run lint` | Run Biome and Oxlint |
| `bun run lint:fix` | Auto-fix lint issues |
| `bun run typecheck` | TypeScript type checking |
| `bun run test` | Run unit tests |

## Privacy

- **Dictionary mode**: All processing happens locally in your browser. No data is sent anywhere.
- **AI mode**: Text is sent to OpenAI's API for processing. Your API key is stored in localStorage.

## Browser Support

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Text transformation | ✅ | ✅ | ✅ | ✅ |
| Voice input | ✅ | ✅ | ❌ | ❌ |

Voice input requires the Web Speech API, which is only available in Chromium-based browsers.

## License

MIT
