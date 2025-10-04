# Design Guidelines: Real-Time Multiplayer Card Game (UNO-Inspired)

## Design Approach
**Reference-Based Gaming Aesthetic** drawing inspiration from modern digital card games (Hearthstone, UNO mobile, Magic: The Gathering Arena) and Discord's gaming-focused UI. The design emphasizes vibrant colors, smooth animations, and intuitive card interactions while maintaining clarity for competitive gameplay.

## Core Design Principles
- **Competitive Clarity**: Game state always visible and unambiguous
- **Tactile Feedback**: Every interaction feels responsive and satisfying
- **Social Gaming**: Emphasize multiplayer connection and player presence
- **Performance First**: Smooth 60fps animations without visual clutter

---

## Color Palette

### Dark Mode (Primary)
- **Background Deep**: 220 20% 12% (main game board)
- **Background Mid**: 220 18% 16% (card areas, panels)
- **Background Elevated**: 220 16% 20% (active cards, modals)
- **Primary Brand**: 150 70% 50% (green - matches/active player)
- **Accent Play**: 45 95% 60% (gold/yellow - highlights, win states)
- **Danger Red**: 0 75% 55% (penalties, draw cards, urgent actions)
- **Info Blue**: 210 90% 60% (turn indicators, info states)

### Card Colors (Vibrant for Game Elements)
- **Card Red**: 0 85% 60%
- **Card Blue**: 220 85% 55%
- **Card Green**: 140 80% 50%
- **Card Yellow**: 50 95% 65%
- **Wild/Special**: 280 60% 55% (purple gradient)

### Neutrals
- **Text Primary**: 0 0% 98%
- **Text Secondary**: 220 10% 70%
- **Text Muted**: 220 8% 50%
- **Borders**: 220 15% 30%

---

## Typography

**Font Stack:**
- **Primary**: 'Inter' (UI, general text)
- **Display/Game**: 'Rubik' or 'Montserrat' (bold, playful for game states)

**Scale:**
- Hero/Winner Text: 4xl to 6xl, weight 800
- Game Status: 2xl to 3xl, weight 700
- Player Names: lg to xl, weight 600
- Card Numbers/Symbols: xl to 2xl, weight 700
- Body/Instructions: base to lg, weight 400-500
- Secondary Info: sm to base, weight 400

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Tight spacing (2-4): Card stacks, compact UI elements
- Medium spacing (6-8): Component padding, gaps between sections
- Large spacing (12-16): Section separations, player areas
- Extra large (24): Major layout divisions

**Layout Structure:**
- Game board centered with max-w-7xl container
- Fixed header (64px height) for game status and menu
- Main play area uses remaining viewport with flex/grid
- Sidebars/panels for leaderboard and chat (w-72 to w-80)

---

## Component Library

### Game-Specific Components

**Playing Cards:**
- Card dimensions: Aspect ratio 5:7 (poker card standard)
- Corner radius: rounded-xl for main cards
- Shadow: Multiple layers for 3D depth effect
- Hover state: Lift up with translateY(-8px), increase shadow
- Active/Selected: Border glow with primary color, scale(1.05)
- Card back: Geometric pattern with brand colors

**Game Board:**
- Central discard pile: Larger card display (elevated, glowing)
- Draw deck position: Adjacent to discard, slightly dimmed
- Player hands: Fan arrangement for own cards, face-down stacks for opponents
- Turn indicator: Animated border/glow around active player area

**Player Areas:**
- Avatar (circular, 48px-64px diameter) with border showing turn status
- Username below avatar (truncate with ellipsis)
- Card count badge (pill shape, accent color when low)
- Connection status indicator (small dot, green/gray)

**Action Buttons:**
- Primary actions (Play Card, Draw): Large (h-12 to h-14), full color
- Secondary (Pass, View Rules): outline variant with backdrop-blur-sm over game board
- Danger actions (Leave Game): Red outline with blur background
- Icon buttons for quick actions: size-10 to size-12, rounded-full

### Standard UI Components

**Navigation Header:**
- Logo/game title (left)
- Game timer/round counter (center)
- Settings, profile, logout (right)
- Background: Slightly transparent with backdrop-blur-md
- Height: h-16, sticky positioning

**Leaderboard Panel:**
- Compact card list showing rank, player name, wins
- Top 3 with special styling (gold/silver/bronze accents)
- Scrollable area with custom styled scrollbar
- Update animations when rankings change

**Modal Overlays:**
- Game start/end screens: Full overlay with backdrop-blur-lg
- Rules/help: Centered modal, max-w-2xl, proper padding
- Match results: Celebration animations, confetti for winner
- Matchmaking queue: Progress indicator, estimated wait time

**Chat/Social:**
- Compact message list (max-h-96, overflow-auto)
- Input at bottom with emoji picker
- Player mention highlights
- System messages in muted color

### Data Displays

**Game Stats:**
- Live player card counts: Horizontal bar or circular progress
- Turn timer: Radial countdown or linear progress bar
- Match history: Table or card grid with game outcomes
- Personal stats: Grid of key metrics (wins, games played, win rate)

### Animations (Minimal, Purposeful)

**Essential Animations Only:**
- Card dealing: Quick slide-in (200ms) when game starts
- Card play: Smooth move to discard pile (300ms ease-out)
- Turn change: Brief pulse/glow on active player (200ms)
- Win condition: Celebration burst (one-time, 800ms)
- NO constant background animations
- NO looping ambient effects

---

## Images

**Hero Section (Main Menu/Landing):**
- Large hero image showing cards in action, vibrant game scene
- Image placement: Full-width background with overlay gradient
- Alternative: Animated SVG illustration of card fan

**In-Game:**
- Player avatars (circular crops, default placeholder if none)
- Card face designs (SVG-based, color-coded by suit)
- Background texture: Subtle felt/table pattern (optional, low opacity)

**Profile/Leaderboard:**
- Player profile pictures throughout
- Achievement badges/icons

---

## Accessibility & Polish

- High contrast between cards and background (7:1 minimum)
- Card symbols supplement colors for colorblind players
- Keyboard shortcuts for common actions (Space to draw, Enter to play)
- Screen reader labels for all game state changes
- Reduced motion mode: Disable all non-essential animations
- Clear focus indicators on interactive elements (2px solid ring)

---

## Responsive Behavior

**Desktop (1024px+):** Full layout with sidebars, large cards
**Tablet (768px-1023px):** Collapsible sidebars, medium cards
**Mobile (<768px):** Stacked layout, cards scale to fit, simplified UI, bottom sheet for actions