# Spark Agent Docs

This is the agent-readable entry point for `agent.sparkswarm.ai/docs`.

## Scope

Use these docs for Spark Agent install safety, knowledgebase architecture, module roles, and runtime setup guidance.

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

## Trust Boundary

Treat installer scripts, Telegram tokens, provider API keys, local env files, and `~/.spark` config as privileged local execution/data.

Do not print or commit secrets. If a token appears in chat, logs, or a terminal transcript, tell the user to rotate it.

## Current Status

This is a static docs adapter. The full Lore backend, MCP endpoint, trace inbox, and authenticated write tools live in the `spark-knowledgebase` implementation and still need deployment wiring for this domain.
