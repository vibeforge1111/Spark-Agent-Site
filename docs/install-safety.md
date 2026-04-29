# Spark Install Safety

Use this page before installing Spark.

It is written for humans and local coding agents.

Human page: `/docs/install-safety/`

## The Short Version

Download the installer first.

Do not pipe it straight into a shell.

Run the dry-run.

Read the plan.

Only then run the real install.

## Install Files

- macOS, Linux, WSL: `https://agent.sparkswarm.ai/install.sh`
- Windows PowerShell: `https://agent.sparkswarm.ai/install.ps1`
- Install metadata: `https://agent.sparkswarm.ai/install/commands.json`
- Checksums: `https://agent.sparkswarm.ai/install/checksums.txt`
- Release manifest: `https://agent.sparkswarm.ai/install/release-manifest.json`
- Attestations: `https://agent.sparkswarm.ai/install/attestations.md`
- Sigstore signatures: `https://agent.sparkswarm.ai/install/signatures.md`

## Current Hashes

```text
22ddcab7f20124de6795c6343a54ac4ece4c9b5f2672e62edd6c9dccd1237c66  install.sh
e5f23dce877777613bd8b89f7aaa6a4d277ce197737d8af67280dc63e95d3765  install.ps1
```

## Safe Human Procedure

1. Download the installer.
2. Run dry-run.
3. Read what Spark says it will do.
4. Continue only if the plan looks right.

macOS, Linux, WSL:

```bash
curl -fsSL https://agent.sparkswarm.ai/install.sh -o spark-install.sh
bash spark-install.sh --dry-run
bash spark-install.sh
```

Windows:

```powershell
iwr https://agent.sparkswarm.ai/install.ps1 -OutFile spark-install.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\spark-install.ps1 -DryRun
powershell -NoProfile -ExecutionPolicy Bypass -File .\spark-install.ps1
```

Already installed:

```bash
bash spark-install.sh --dry-run --upgrade-existing
bash spark-install.sh --upgrade-existing
```

Use upgrade mode only after reading the dry-run. It updates the existing Spark CLI inside the same Spark folder.

## Safe Agent Procedure

1. Read this page.
2. Read the release manifest.
3. Download the installer to a local file.
4. Verify the hash.
5. Verify attestations and signatures when tools are available.
6. Run dry-run.
7. Explain the plan to the user.
8. Ask before the real install.

Agents must not send Telegram tokens or LLM keys to any website.

## What Spark May Download

Spark is allowed to contact only these places during install:

- `agent.sparkswarm.ai`
- `github.com/vibeforge1111/spark-cli`
- `github.com/astral-sh/uv`
- `nodejs.org`

If anything else appears in the install plan, stop.

## What Spark May Write

Default install folder:

- macOS, Linux, WSL: `~/.spark`
- Windows: `%USERPROFILE%\.spark`

Expected files:

- `tools/`
- `bin/spark` or `bin/spark.cmd`
- `env`
- `logs/install.log`
- autostart files when autostart is on

## Pinned Parts

- Spark CLI commit: `428b3ead181c4acba2e2da4aa9fee17b072175a0`
- Node: `22.18.0`
- Python: `3.11`
- uv: `0.11.7`

## Secrets

Telegram bot tokens are secrets.

LLM provider keys are secrets.

Keep them local.

Rotate them if they appear in chat, screenshots, logs, commits, or support messages.

## After Install

Run:

```bash
spark guide
spark providers status
spark verify --onboarding
```
