# ChoreQuest

Gamified chore tracker for families. Kids earn points and rewards for completing chores; parents manage chore lists and approve rewards.

## Stack

- **React 18** + **TypeScript**
- **Vite** (dev server + build)
- **Tailwind CSS** (styling)
- **Single-file export** via `vite.config.export.ts` + `scripts/finalize-export.mjs`

## Views

| View | Access | Purpose |
|------|--------|---------|
| Home | Open | Kid/parent selector |
| Kid | Kids | See assigned chores, mark complete, claim rewards |
| Parent | Parents | Add/edit chores, manage kids, approve rewards |

## Key Features

- Weekly calendar view for chore scheduling
- Confetti animation on chore completion
- Birthday banner detection
- Reward modal with point redemption
- Persistent state via React Context

## Run (Dev)

```bash
cd apps/ChoreQuest
npm install
npm run dev
```

## Export (Standalone HTML)

```bash
npm run build:export
# Outputs: ChoreQuest.html (self-contained, no server needed)
```

## State

All data lives in React Context (`src/context/AppContext.tsx`). No backend — resets on page refresh unless localStorage is wired up.
