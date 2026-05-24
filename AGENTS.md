<!-- AGENTS.md — guidance for AI coding agents about Supabase & MCP -->
# AGENTS — Supabase & MCP guidance

Purpose: concise, repo-specific instructions to help AI agents work with Supabase in this project and with the Supabase MCP server.

- **Supabase skill files:** The detailed, authoritative guidance is in the skill files. Link to these rather than duplicating:
  - [.agents/skills/supabase/SKILL.md](.agents/skills/supabase/SKILL.md)
  - [.agents/skills/supabase-postgres-best-practices/SKILL.md](.agents/skills/supabase-postgres-best-practices/SKILL.md)

- **Where to look in this repo:**
  - `supabase/` — project Supabase config, migrations, functions, and seeds.
  - `scratch/` — helper scripts and migration runners: `run_migration*.mjs`, `seed_feed.mjs`.
  - `.mcp.json` (if present) — MCP server configuration.

- **Quick MCP rules (repo-specific):**
  - Prefer using the repository skill (`.agents/skills/supabase`) for Supabase conventions and safety checks.
  - Use MCP helpers to inspect remote projects where available: `mcp_supabase_list_tables`, `mcp_supabase_get_advisors`, `mcp_supabase_execute_sql`. When in doubt, consult the skill before running destructive commands.
  - Avoid applying migrations directly via remote `apply_migration` unless the change is final and you have run advisors locally first.

- **Local CLI vs MCP:**
  - Use the Supabase CLI (`supabase`) for local development workflows (migrations, local emulation). Use MCP tools for remote project queries and read-only diagnostics when you cannot run the CLI locally.

- **Security & RLS:** Always follow the checklist in the Supabase skill before changing auth, RLS, views, or storage. Link: [.agents/skills/supabase/SKILL.md](.agents/skills/supabase/SKILL.md)

- **When to escalate / ask the user:**
  - Missing `.mcp.json` or unclear MCP credentials.
  - Any operation that would require creating or deleting remote resources (ask for confirmation).

If you want, I can also create a short `.github/copilot-instructions.md` variant for GitHub Copilot specifically, or split this into smaller instruction sets per area (migrations, auth, edge-functions). Which would you prefer?
