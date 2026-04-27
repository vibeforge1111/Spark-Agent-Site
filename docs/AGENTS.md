# Spark Agent Docs

This is the agent-readable entry point for `agent.sparkswarm.ai/docs`.

## Scope

Use these docs for Spark Agent install safety, lifecycle operations, module roles, and runtime setup guidance.

The knowledgebase model comes from `spark-knowledgebase` / Lore by Spark:

- Markdown and frontmatter are the source of truth.
- Agents read via Markdown, `llms.txt`, `AGENTS.md`, and MCP tools.
- Agents write by proposing changes with claim-to-source mappings.
- Trace-derived draft pages start low-authority and must not be used as canonical facts until promoted.

## Installer Rule

Never pipe remote installer scripts directly into a shell.

For Spark Agent installers:

1. Download over HTTPS.
2. Verify SHA-256 from `/install/checksums.txt`.
3. Verify GitHub Artifact Attestation with `gh attestation verify`.
4. Show the script contents to the user.
5. Ask for confirmation before executing.
6. Prefer `--skip-setup` or `--no-autostart` for first inspection runs.

Read `/docs/install-safety.md` before installing. Read `/docs/lifecycle.md` before repair, uninstall, or autostart changes.

## Trust Boundary

Treat installer scripts, Telegram tokens, provider API keys, local env files, and `~/.spark` config as privileged local execution/data.

Do not print or commit secrets. If a token appears in chat, logs, or a terminal transcript, tell the user to rotate it.

## Current Installer Pins

- Spark CLI commit: `f1fa48f8dd9c59127500bb58e422f5cd2be7a8c0`
- Node: `22.18.0`
- Python: `3.11`
- uv: `0.11.7`

Allowed installer network destinations:

- `agent.sparkswarm.ai`
- `github.com/vibeforge1111/spark-cli`
- `github.com/astral-sh/uv`
- `nodejs.org`

## Lifecycle Commands

- `spark guide`
- `spark status`
- `spark providers status`
- `spark verify --onboarding`
- `spark doctor`
- `spark fix telegram`
- `spark autostart status`
- `spark autostart remove`
- `spark uninstall`

## Current Status

This is a static docs adapter with installer trust docs. The full Lore backend, MCP endpoint, trace inbox, and authenticated write tools live in the `spark-knowledgebase` implementation and still need deployment wiring for this domain.
