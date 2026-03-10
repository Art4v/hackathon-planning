# CLAUDE.md — Project Conventions

## README Maintenance (IMPORTANT)

### When a new top-level folder is created
Always update `README.md` by adding a new `###` subsection under `## What's Inside` using this format:

```markdown
### `folder-name/` — Short Title
One sentence describing what this folder is for.

- **`key-file.ext`** — what it does
- Key technology or approach used

Skills practiced: comma-separated list of skills learned.
```

Place the new entry after the last existing `###` folder entry, before `## Contributors`.

### When a contributor joins the project
Add a new row to the Contributors table in `README.md` under `## Contributors`:

```markdown
| Name | Role |
|------|------|
| Existing Person | Their role |
| New Person      | Their role |
```

## General Conventions
- Keep `README.md` up to date — it is the single source of truth for what the repo contains
- Each folder should ideally have its own `README.md` with setup/run instructions
- Never commit `.env` files — use `.env.example` as a template instead
