---
name: supabase-agent-instructions
description: Short, actionable guidance for AI agents interacting with Supabase in this repo.
---

# Supabase — Agent Quick Instructions

Purpose: provide concise, high-value guidance for agents before performing Supabase or MCP operations in this repository.

- **Primary skill:** Detailed rules live in [.agents/skills/supabase/SKILL.md](.agents/skills/supabase/SKILL.md). Consult that before changes.
- **When to use MCP vs CLI:** Prefer local `supabase` CLI for local dev/migrations; use MCP tools (`mcp_supabase_*`) for remote inspection or when CLI is unavailable.
- **Project identifier:** This repo uses `supabase/config.toml` (`project_id = "cls-comunity"`) and some scratch scripts reference the remote URL `https://mqpmdethfoisgazwuxsa.supabase.co`.
- **Quick commands (discover/verify):**
  - `supabase --version`
  - `supabase migration list --local`
  - `curl -so /dev/null -w "%{http_code}" https://mcp.supabase.com/mcp`
  - `mcp_supabase_list_tables` (via MCP tool)
- **Secrets & keys:** Never commit secrets. If you find keys in `scratch/` (temporary scripts), ask the user to rotate them and remove from the repo. Treat `service_role` keys as sensitive.
- **Migrations workflow (agent-friendly):**
  1. Iterate changes against a local DB using `supabase db push` or `supabase db reset`.
  2. Run advisors: `supabase db advisors` (or `mcp_supabase_get_advisors`).
  3. Generate migration files with `supabase migration new <name>` and `supabase db pull`.
  4. Commit migrations under `supabase/migrations/`.
- **Safety checks before remote changes:**
  - Confirm `.mcp.json` exists and points to `https://mcp.supabase.com/mcp`.
  - Run advisors and review RLS/security checklist in the main skill.
  - For destructive actions, ask the user for confirmation.

If you'd like, I can convert this into `.github/copilot-instructions.md` for Copilot, or create a separate skill file focused on migrations or RLS policies. Which would you prefer?
