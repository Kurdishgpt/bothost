# Discord Bot Hosting Panel - Design Guidelines

## Design Approach
**Selected Approach:** Design System (Utility-Focused Dashboard)

**Primary References:** Railway Dashboard, Vercel Dashboard, Linear App
- Railway's clean card-based bot management
- Vercel's status indicators and deployment controls
- Linear's typography hierarchy and modern aesthetic

**Rationale:** This is a utility-first application where clarity, efficiency, and real-time monitoring are paramount. Users need quick access to bot controls and status at a glance.

## Core Design Elements

### Typography
- **Primary Font:** Inter (Google Fonts) - modern, highly legible for UI
- **Monospace Font:** JetBrains Mono - for bot tokens, logs, and technical data
- **Hierarchy:**
  - Page titles: text-2xl md:text-3xl, font-semibold
  - Section headings: text-lg font-semibold
  - Bot names/cards: text-base font-medium
  - Body/labels: text-sm font-normal
  - Metadata/timestamps: text-xs text-gray-500

### Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- Consistent padding: p-4 for cards, p-6 for sections, p-8 for main containers
- Gap spacing: gap-4 for card grids, gap-2 for form elements
- Vertical rhythm: space-y-6 for main sections, space-y-4 within components

**Container Strategy:**
- Dashboard wrapper: max-w-7xl mx-auto px-4 md:px-6
- Sidebar (if used): fixed w-64 
- Content area: Full width with internal max-width constraints

### Component Library

**Navigation**
- Top bar with logo, user profile dropdown, "Add Bot" CTA button
- Simple horizontal navigation (Dashboard, Bots, Settings, Docs)
- Mobile: Hamburger menu with slide-out panel

**Bot Management Cards**
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
- Each card includes:
  - Bot name (truncated with tooltip if needed)
  - Status indicator (dot + text: Online/Offline/Starting/Error)
  - Uptime counter
  - Action buttons: Start/Stop/Restart, View Logs, Settings
  - Quick stats: Memory usage, last restart time
- Card structure: Rounded corners (rounded-lg), subtle border, hover state elevation

**Status Indicators**
- Use colored dots (w-2 h-2 rounded-full) + text labels
- Online: Green pulse animation
- Offline: Gray static
- Starting: Yellow pulse
- Error: Red static
- Position: Top-left or inline with bot name

**Forms (Add/Edit Bot)**
- Modal or dedicated page layout
- Fields: Bot name, Discord token (password input), description (textarea)
- Labels above inputs with text-sm font-medium
- Input styling: Consistent border, focus ring, rounded corners
- Submit button: Primary CTA style, full-width on mobile
- Token field: Copy button, show/hide toggle

**Logs Viewer**
- Terminal-style container with dark background (not fully black, subtle gray)
- Monospace font, text-sm
- Auto-scroll toggle
- Line numbers (optional)
- Search/filter controls
- Contained in modal or expandable card section

**Dashboard Overview**
- Summary stats cards at top: Total bots, Active bots, Total uptime
- Recent activity feed
- Quick actions panel

**Empty States**
- "No bots yet" with illustration placeholder and prominent "Add Your First Bot" button
- Center-aligned, generous spacing

**Buttons & CTAs**
- Primary: Solid background, medium weight text
- Secondary: Border style, transparent background
- Destructive: Red accent for stop/delete actions
- Icon + text combination for actions
- Sizes: Regular (px-4 py-2), Large (px-6 py-3) for primary CTAs

**Icons**
- Library: Heroicons (CDN)
- Usage: 16px for inline icons, 20px for buttons, 24px for headers
- Common needs: Play, Stop, Refresh, Settings, Logs, Plus, Trash

### Animations
Use sparingly, only for feedback:
- Status dot pulse for "Online" and "Starting" states (subtle)
- Button hover states (native)
- Card hover elevation (translate-y-[-2px])
- Loading spinners for async actions
- No complex scroll animations or transitions

## Images
**Hero Section:** None required - this is a dashboard application
**Illustrations:** Consider simple empty state illustrations (bot mascot, server icons) as subtle SVG placeholders

## Layout Structure

**Dashboard Page:**
1. Top navigation bar (fixed, h-16)
2. Stats overview section (3-4 stat cards in grid)
3. Bot grid (responsive columns)
4. Empty state (if no bots)

**Add Bot Modal/Page:**
- Center modal (max-w-md) or dedicated page
- Form with clear hierarchy
- Help text for Discord token setup

**Individual Bot View:**
- Two-column layout: Controls/info (left), Logs viewer (right)
- Mobile: Stacked sections

## Key Design Principles
1. **Clarity over decoration** - Every element serves a purpose
2. **Instant feedback** - Status changes are immediately visible
3. **Predictable patterns** - Consistent card layouts and button placements
4. **Scan-able information** - Use visual hierarchy for quick decision-making
5. **Progressive disclosure** - Show essentials, hide complexity in dropdowns/modals