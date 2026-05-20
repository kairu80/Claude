# Claude Workspace Instructions

## Orientation (always do this first)

1. Read `STRUCTURE.md` to understand the folder layout and active projects.
2. Before working on any app or workflow, read the `README.md` inside its folder.
3. Never ask the user to re-explain a project — the README is the source of truth.

## Skill Usage (proactive — no prompting needed)

| When | Skill to use |
|------|-------------|
| After making any UI or visual change | `/run` — launch the app and visually verify the change |
| Before marking any task complete | `/verify` — confirm the fix works end-to-end |
| After writing new code | `/simplify` — review for reuse, quality, and unnecessary complexity |
| Before pushing changes | `/security-review` — check for vulnerabilities in changed code |

## Folder Conventions

- Apps live in `apps/<AppName>/` — one folder per app, PascalCase name.
- Workflows live in `workflows/<WorkflowName>/` — one folder per workflow.
- Every project folder must have a `README.md`.
- Standalone HTML exports stay inside their app folder.

## Token Efficiency

- Read `STRUCTURE.md` + the relevant project `README.md` at the start of each session.
- Do not ask the user for context that is already in a README.
- Prefer editing existing files over creating new ones.
- No comments unless the WHY is non-obvious.
