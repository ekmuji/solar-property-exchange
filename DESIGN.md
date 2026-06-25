# SPX Design System

**Subject framing**: this isn't a real-estate brochure site — it's a control
room for an energy asset. Every screen should feel like you're reading
instruments off a piece of physical infrastructure, not browsing listings.

## Palette

| Token | Hex | Use |
|---|---|---|
| `bg` | `#15171A` | App background — industrial graphite, not pure black |
| `surface` / `surface2` | `#1C1F23` / `#242830` | Panels, cards, inputs |
| `solar` | `#F2A93B` | Solar generation, primary actions, money the sun made |
| `grid` | `#3FBFAE` | Grid electricity, "buy" side of the order book, EV solar mix |
| `auction` | `#E2574C` | Time pressure — live auctions, "sell" side, countdowns |

Avoided on purpose: cream-and-serif "editorial" (wrong register for a
trading/metering product) and pure-black-plus-neon "AI demo" (overused,
says nothing about energy or property specifically).

## Type

- **Display** — Space Grotesk. Geometric, slightly industrial, reads well at
  large sizes for headings without tipping into "startup landing page" serif
  cliché.
- **Body** — Inter.
- **Data** — IBM Plex Mono, used via the `.meter` utility class for *every*
  quantitative value (kWh, £/kWh, share %, countdowns). This is the
  signature move: numbers across the whole product look like they're coming
  off a physical meter, tying the property, energy, trading, and EV surfaces
  together into one visual language.

## Signature components

- `.meter` — tabular-nums monospace treatment for all figures.
- `StatusPill` — every status enum (unit, charger, auction) renders through
  one shared component with a color-coded dot, so a user only has to learn
  the color system once.
- `CountdownTimer` — live-ticking, used identically for auction close and
  (future) lease expiry.
