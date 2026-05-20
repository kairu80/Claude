# Claude Workspace Structure

This is the central workspace for all Claude-assisted projects. Read this file first to orient, then read the README.md inside each project folder for details.

## Folder Layout

```
Claude/
├── apps/                    # Self-contained web apps and tools
│   └── <AppName>/           # One folder per app (named clearly)
│       └── README.md        # App purpose, stack, how to run/export
│
├── workflows/               # Automation scripts and multi-step processes
│   └── <WorkflowName>/      # One folder per workflow
│       └── README.md        # What the workflow does and how to trigger it
│
└── STRUCTURE.md             # This file — always read first
```

## Active Projects

### Apps
| Folder | Description | Stack |
|--------|-------------|-------|
| `apps/ChoreQuest` | Gamified chore tracker for kids with rewards, birthday banners, and weekly calendar | React, Vite, Tailwind |
| `apps/FinancialCommandCenter` | Personal finance dashboard | TBD |

### Workflows
| Folder | Description |
|--------|-------------|
| *(none yet)* | Add workflow folders here as they are created |

## Conventions

- **Naming**: Use PascalCase for app and workflow folder names (`ChoreQuest`, not `chore-quest`).
- **README required**: Every project folder must have a `README.md` explaining purpose, stack, and run/export instructions.
- **Standalone exports**: Apps that export a single HTML file should keep that file inside their folder (e.g., `ChoreQuest.html`).
- **No cross-project dependencies**: Each app/workflow must be self-contained.

## Recommended Skills (auto-active)

Claude will proactively use these skills when working on projects in this workspace:

- **`run`** — launches the app in a dev server to visually verify changes
- **`verify`** — confirms a fix or feature works before marking complete
- **`simplify`** — reviews changed code for quality and removes unnecessary complexity
- **`security-review`** — flags vulnerabilities in changed code before push
