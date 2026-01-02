# WorkSafe Vue Redesign - Office Space Theme

## Project Summary

Converted the WorkSafe profanity filter app from **Svelte 5** to **Vue 3** with a complete visual redesign inspired by the movie *Office Space* (1999).

---

## Design Concept: "TPS Report Compliance System"

**Core Aesthetic:** 1990s corporate office environment with greenbar computer paper, dot matrix printing, CRT monitors, and soul-crushing beige equipment.

**Key Quote Integration:**
> "Yeah, I'm going to need you to use professional language. That would be great." — Bill Lumbergh

This quote appears prominently in the header on a yellow post-it note background.

---

## Visual Design System

### Color Palette

**Greenbar Paper (Background):**
- `#f8f6f0` - Paper white
- `#e8f5e9` - Paper green (alternating stripes)
- `#faf8f3` - Paper cream
- Uses repeating linear gradient for authentic greenbar effect

**Swingline Red (Milton's Stapler):**
- `#8b0000` - Dark
- `#b22222` - Medium (primary)
- `#dc143c` - Bright
- Used for primary actions, active states, danger

**Post-it Notes:**
- Yellow: `#fff740`
- Pink: `#ff7eb9`
- Blue: `#7afcff`
- Green: `#7fff7f`
- Orange: `#ff9a3c`

**Flair Pins (Chotchkie's):**
- Red, Blue, Green, Yellow, Purple, Orange
- Circular badges with gradient backgrounds
- Used in header to add personality

**Dot Matrix Ink:**
- `#1a1a1a` - Black text
- `#4a4a4a` - Faded
- `#6a6a6a` - Light

**CRT Monitor Green:**
- `#00ff41` - Bright terminal green
- Used for voice input waveform display

### Typography

**VT323** - Dot matrix printer font
- Main display text
- Terminal interfaces
- Status indicators
- Size: 1.125rem base

**Courier Prime** - Typewriter font
- Headers
- Form labels
- Professional output text

**Special Elite** - Handwritten typewriter
- Post-it notes
- Stamps
- Casual/informal elements

**IBM Plex Mono** - Technical monospace
- System labels
- Technical details

### Background Effects

1. **Perforated Edges:**
   - Fixed position overlays on left/right
   - Circular holes using radial gradients
   - Spacing: 48px vertical rhythm
   - Semi-transparent beige with dashed border

2. **Dot Matrix Print Effect:**
   - Repeating horizontal lines overlay
   - 2px spacing
   - Very subtle (1% opacity)
   - Creates authentic printer paper texture

3. **Greenbar Stripes:**
   - 24px white, 24px green, repeating
   - Fixed attachment for parallax effect
   - Matches actual computer paper from the 90s

---

## Component Architecture

### TPSHeader.vue
**Purpose:** Main branding and navigation

**Elements:**
- Perforation strip at top (repeating holes pattern)
- Logo area with red Swingline badge (📎 paperclip emoji)
- WORKSAFE™ title in Courier Prime
- Rubber stamps: "APPROVED" (green) and "INTERNAL USE ONLY" (blue)
- Memo bar with DATE, TO, FROM, RE fields
- Flair pin strip (6 circular badges with emojis)
- Lumbergh quote section on yellow post-it background

**Animations:**
- Stamps "slam" in on page load (scale + rotate)
- Flair pins rotate slightly on hover

### PostItNote.vue
**Purpose:** Section dividers and labels

**Props:**
- `color`: 'yellow' | 'pink' | 'blue' | 'green' | 'orange'
- `rotate`: number (degrees, defaults to random -2 to +2)

**Styling:**
- Gradient backgrounds for depth
- Drop shadow for 3D effect
- Curled corner (CSS triangle trick)
- Top shadow bar for adhesive strip
- Random rotation for realistic placement

### FlairBadge.vue
**Purpose:** Decorative pins (Chotchkie's restaurant reference)

**Props:**
- `emoji`: string (⭐, ☕, 📋, etc.)
- `color`: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange'
- `title`: tooltip text

**Styling:**
- Circular, 36px diameter
- Gradient background based on color
- Inset highlight for 3D pin effect
- Scale + rotate on hover
- White emoji with text shadow

### VoiceInput.vue
**Purpose:** Voice recording interface

**Design Elements:**
- Panel header with "FORM 01" terminal-style label
- CRT monitor bezel (dark gray with beveled edges)
- Animated waveform canvas (green oscilloscope style)
  - Idle: flat line
  - Recording: sine wave animation
  - CRT scanlines overlay
- Vintage record button (keyboard key style)
- Red LED indicator (pulsing when recording)
- Status display (black terminal with green text)
- Live transcript box

**Technical:**
- Canvas-based waveform using `requestAnimationFrame`
- Web Speech API integration
- CRT glow and reflection effects

### TextInput.vue
**Purpose:** Manual text entry

**Design Elements:**
- Panel header with "FORM 02" label and "*REQUIRED" badge
- Large textarea styled as greenbar paper
- Red margin line (like notebook paper)
- Vintage keyboard-style submit button
  - 3D pressed effect (translate + shadow)
  - Red gradient for primary action
  - Spinner animation when processing
- Keyboard shortcut badge (CTRL+ENTER)
- Field note with pencil emoji

### OutputPanel.vue
**Purpose:** Display transformed professional text

**Design Elements:**
- Panel header with "FORM 03" and "TPS COMPLIANT" stamp
- Tab interface for Plain Text / Email Format
  - Inactive: gray gradient
  - Active: white paper background
- Document paper with pink margin line
- Large green "COPY TO CLIPBOARD" button (keyboard key style)
- Modification log section
  - Shows original → replacement
  - Strikethrough for removed text
  - Bold green for replacements
- Compliance notice when no changes needed (green badge)

### SettingsPanel.vue
**Purpose:** Configuration controls

**Design Elements:**
- Toggle switch for AI mode (mechanical slider)
  - Off: gray, "○ LOCAL"
  - On: green, "◉ ONLINE"
- Collapsible API configuration (⚙️ icon)
- Vintage text input for API key
- Gray keyboard button for save
- Status indicator (green checkmark)

### App.vue
**Purpose:** Main layout orchestration

**Structure:**
```
TPSHeader
  ↓
Post-it: "INPUT"
  ↓
Input Tabs (Voice/Text)
  ↓
VoiceInput / TextInput (toggle visibility)
  ↓
SettingsPanel
  ↓
Post-it: "OUTPUT"
  ↓
OutputPanel
  ↓
Footer (terminal-style with coffee stain)
```

**Layout:**
- Max-width: 900px
- Centered content
- 50px left/right padding for perforation edges
- Footer spans full width (negative margins)

---

## Key Visual Elements

### 1. Vintage Computer Buttons
All buttons use this pattern:
- Gradient background (180deg, light → dark)
- 2-3px solid border (darker shade)
- `box-shadow: 0 Npx 0 {color}` for 3D depth
- `position: relative` + `top` offset
- On `:active`, move down and remove shadow

### 2. TPS Stamps
- 3px solid border matching text color
- Uppercase, bold, letter-spacing
- `transform: rotate(-5deg)` for hand-stamped look
- `opacity: 0.85` for ink texture
- Slam animation on load (scale from 1.8 → 1)

### 3. Paper Textures
- Main document backgrounds: `#fefef9` (off-white)
- `box-shadow: inset 0 0 30px rgba(0,0,0,0.03)` for subtle aging
- Pink/red margin lines using `::before` pseudo-element
- Dashed borders for forms

### 4. Terminal/CRT Styling
- Black background (`#1a1a1a`)
- Green text (`#00ff41`)
- Horizontal scanline overlay
- Beveled bezel with inset shadows
- Reflection gradient on "screen"

### 5. Form Fields
- Greenbar paper background
- 2px solid dark border
- Inset shadow for depth
- VT323 font
- Large text (1.1-1.15rem)

---

## Animation Details

**Stamp Slam (`@keyframes stamp-slam`):**
```css
0%: scale(2), opacity: 0
60%: scale(0.9), opacity: 1  /* Overshoot */
100%: scale(1), opacity: 0.85
```

**Flair Pin Hover:**
```css
transform: scale(1.15) rotate(8deg)
transition: 0.15s ease
```

**Recording Pulse (`@keyframes pulse`):**
```css
box-shadow alternates between 20px and 40px blur
Creates breathing LED effect
```

**Cursor Blink:**
```css
Underscore fades in/out every 1s
Classic terminal cursor
```

**Button Press:**
```css
Active state: top += 4px, shadow = 0
Creates mechanical key press
```

---

## Implementation Notes

### State Management
- Vue 3 Composition API with `ref()`
- Exported reactive state from `state.ts`
- Components import and use directly
- `initApp()` called in `App.vue` `onMounted()`

### Build Tools
- Vite 7.3
- Vue 3.5
- TypeScript
- CSS: Scoped styles per component
- No CSS preprocessor (vanilla CSS)

### Fonts
All loaded from Google Fonts:
```
VT323
IBM Plex Mono
Special Elite
Courier Prime
```

### Responsive Behavior
- Perforation edges scale down to 25px on mobile
- Header stacks vertically
- Footer content centers
- Tab buttons remain full-width
- Max-width reduces gracefully

---

## Office Space References

1. **TPS Reports** - Fictional reports from the movie, used as stamps/badges
2. **Milton's Swingline Stapler** - Red color scheme, paperclip logo
3. **Chotchkie's Flair** - 15 pieces of minimum flair → flair pin badges
4. **Bill Lumbergh Quote** - Passive-aggressive management speak
5. **Greenbar Paper** - Computer printouts from the 90s
6. **Cubicle Gray** - Soul-crushing office equipment colors
7. **Coffee Stains** - Subtle detail on footer
8. **PC LOAD LETTER** - Referenced in flair pin (🖨️ printer)
9. **"Case of the Mondays"** - Referenced in flair pin (💼)

---

## File Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── App.vue              # Main container
│   │   ├── TPSHeader.vue        # Header with Lumbergh quote
│   │   ├── PostItNote.vue       # Section dividers
│   │   ├── FlairBadge.vue       # Decorative pins
│   │   ├── VoiceInput.vue       # CRT monitor interface
│   │   ├── TextInput.vue        # Paper form input
│   │   ├── OutputPanel.vue      # TPS report output
│   │   └── SettingsPanel.vue    # Configuration
│   ├── state.ts                 # Vue reactive state
│   ├── detector.ts              # Profanity detection (unchanged)
│   ├── replacer.ts              # Text transformation (unchanged)
│   └── speech.ts                # Web Speech API (unchanged)
├── styles/
│   └── main.css                 # Global design system
├── main.ts                      # Vue app initialization
└── index.html                   # Entry point
```

---

## Design Philosophy

**Authenticity over parody** - Every detail is researched from actual 90s office equipment:
- Greenbar paper used real 24px stripe rhythm
- VT323 matches actual dot matrix printers
- Post-it note curl is subtle, not exaggerated
- CRT green is the actual phosphor color (#00FF41)

**Functional nostalgia** - The theme enhances usability:
- High contrast for readability
- Clear visual hierarchy
- Tactile button feedback
- Consistent spacing based on line height

**Layered details** - Rewards close inspection:
- Coffee stains on footer
- Perforated edges with holes
- Paper clip decoration
- Scanlines on CRT
- Curled post-it corners

---

This design transforms a utilitarian profanity filter into a **fully immersive Office Space experience** while maintaining modern UX standards.
