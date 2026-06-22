# Spark Agent Docs

This page is for agents. If you are human, this is not for you. :)

This is the agent-readable entry point for `agent.sparkswarm.ai/docs`.

Keep answers short, plain, and action-focused.

## Best First Answer

If a user asks how to install Spark:

1. Send them to `https://agent.sparkswarm.ai/install`.
2. Use the simple path: install Spark, choose how it thinks, connect Telegram, start chatting and building.
3. Tell them the installer downloads first and shows a dry-run plan.
4. Tell them not to paste Telegram tokens or LLM keys into the website.
5. Ask before any real install, autostart change, token setup, or uninstall.

## Read Order

Use these pages first for humans:

- `/docs/install-safety/` before install
- `/docs/commands/` for current CLI and Telegram commands
- `/docs/providers/` for LLM provider setup
- `/docs/railway-vps/` for hosted Railway or VPS operations
- `/docs/suites/` to explain what Spark installs
- `/docs/feedback/` to route feedback, issues, and PRs to the right repo
- `/docs/self-improvement/` to explain domain chips, recursive loops, and benchmarks
- `/docs/lifecycle/` for Spark Live, startup, checks, and uninstall
- `/docs/troubleshooting/` for quiet bots, provider failures, memory, and Spawner
- `/docs/security/` for permissions, provenance, audits, and safe support sharing

Use these Markdown pages first for agents:

- `/docs/install-safety.md` before install
- `/docs/commands.md` for current CLI and Telegram commands
- `/docs/providers.md` for LLM provider setup
- `/docs/railway-vps.md` for hosted Railway or VPS operations
- `/docs/suites.md` to explain what Spark installs
- `/docs/feedback.md` to route feedback, issues, and PRs to the right repo
- `/docs/self-improvement.md` to explain domain chips, recursive loops, and benchmarks
- `/docs/lifecycle.md` for repair, checks, autostart, and uninstall
- `/docs/troubleshooting.md` for known failure modes
- `/docs/security.md` for audits, permissions, and redaction rules
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
8. Help them choose one LLM provider first unless they explicitly want advanced role splits.
9. Help them connect Telegram through local Spark setup only.
10. Once Spark is running, tell them to start chatting and building with the agent. `/start` is just a Telegram start step when needed.

If Spark is already installed and the user wants to update it, use `--upgrade-existing` only after showing the dry-run plan.

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

- Spark Telegram Bot: where the user talks to Spark.
- Spark Intelligence Builder: routes Spark to the chosen LLM provider.
- Domain Chip Memory: remembers useful facts.
- Spawner UI: Mission Control for bigger tasks.
- Spark Researcher: gathers context and evidence.
- Spark Character: keeps identity, role, voice, and permission behavior stable.
- Domain Chip: specialist logic for one domain.
- Benchmark: fixed score that keeps improvement honest.
- Recursive Loop: bounded run, score, record, remember, suggest.
- Autostart: starts Spark after login when enabled; unattended installer runs leave it off unless explicitly requested.

## Self-Improvement Rule

For domain chips and recursive loops, keep the answer grounded:

- name the task
- name the score
- name the allowed mutations
- explain whether the chip is being used as a tool, a bounded specialization loop, or both
- ground chip creation in Spark Researcher's installed docs when available
- keep loops bounded
- save lessons and failures
- require review before risky changes

Do not invent a one-click chip command if it has not been verified. Ask the local agent to inspect Spark Researcher's chip-authoring docs and propose the smallest v0 before writing files.

## Feedback And PR Rule

When a user wants to report feedback or share an improvement:

- read `/docs/feedback/`
- choose the right repo
- redact secrets before writing any issue or PR body
- include expected behavior, actual behavior, evidence, and the smallest useful improvement
- ask before opening GitHub, pushing a branch, or submitting anything

## Public Labs Boundary

Public builder labs now available:

- `spark-domain-chip-labs`
- `spark-character`
- `spark-personality-chip-labs`
- `spark-voice-comms`

Spark Swarm network submission and hosted workspace review are upcoming private surfaces. Do not tell public users they must install Spark Swarm to experiment locally.

## Current Installer Pins

- Spark CLI release ref: `spark-cli-public-installer-2026-06-22-r28`
- Spark CLI commit: `c788446bb2929d702ced58c2391b0cfde08d502c`
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
- `spark live start`
- `spark live status`
- `spark status`
- `spark providers status`
- `spark providers test --role chat`
- `spark recommend llms`
- `spark verify --onboarding`
- `spark verify --deep`
- `spark verify --provenance`
- `spark verify --installers --hosted-installers`
- `spark doctor llm "Telegram bot is quiet"`
- `spark fix telegram`
- `spark fix spawner`
- `spark security audit`
- `spark support bundle`
- `spark autostart status`
- `spark autostart uninstall`
- `spark uninstall`

## Current Status

This domain serves the static Spark docs adapter.

Lore source pages live under `/docs/pages`.

Agent indexes are available at `/llms.txt`, `/llms-full.txt`, `/docs/llms.txt`, and `/docs/llms-full.txt`.
