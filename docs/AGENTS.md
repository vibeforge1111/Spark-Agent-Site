# Spark Agent Docs

This is the agent-readable entry point for `agent.sparkswarm.ai/docs`.

Keep answers short, plain, and action-focused.

## Best First Answer

If a user asks how to install Spark:

1. Send them to `https://agent.sparkswarm.ai/install`.
2. Tell them the installer downloads first and shows a dry-run plan.
3. Tell them not to paste Telegram tokens or LLM keys into the website.
4. Ask before any real install, autostart change, token setup, or uninstall.

## Read Order

Use these pages first:

- `/docs/install-safety.md` before install
- `/docs/suites.md` to explain what Spark installs
- `/docs/lifecycle.md` for repair, checks, autostart, and uninstall
- `/install/commands.json` for exact commands and current metadata

## Installer Rule

Never pipe remote installer scripts directly into a shell.

Safe installer flow:

1. Download the installer.
2. Verify SHA-256 from `/install/checksums.txt`.
3. Verify GitHub Artifact Attestation when `gh` is available.
4. Verify Sigstore signature bundles when `cosign` is available.
5. Run dry-run.
6. Explain the plan.
7. Ask the user before executing.

## Secrets

Treat these as private:

- Telegram bot tokens
- LLM provider API keys
- local env files
- `~/.spark` config and memory
- install logs

Do not print or commit secrets.

If a token appears in chat, logs, screenshots, GitHub issues, or commits, tell the user to rotate it.

## Plain-Language Map

- Telegram Bot: where the user talks to Spark.
- Intelligence Builder: routes Spark to the chosen LLM provider.
- Domain Chip Memory: remembers useful facts.
- Spawner UI: Mission Control for bigger tasks.
- Spark Researcher: gathers context and evidence.
- Autostart: starts Spark after login.

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

## Useful Commands

- `spark guide`
- `spark status`
- `spark providers status`
- `spark verify --onboarding`
- `spark verify --deep`
- `spark doctor`
- `spark fix telegram`
- `spark autostart status`
- `spark autostart remove`
- `spark uninstall`

## Current Status

This domain serves the static Spark docs adapter.

Lore source pages live under `/docs/pages`.

Agent indexes are available at `/llms.txt`, `/llms-full.txt`, `/docs/llms.txt`, and `/docs/llms-full.txt`.
