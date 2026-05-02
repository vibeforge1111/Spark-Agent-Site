# Spark Install Safety

Use this page before installing Spark. It is written for humans and local coding assistants such as Codex, Claude Code, and similar terminal-capable agents.

Human page: `/docs/install-safety/`

## The Short Version

Download the installer first. Run the dry-run. Read the plan. Only then run the real install.

If you are non-technical, ask your coding assistant to open this page, run the dry-run, and explain what Spark wants to download, write, and start.

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
d400566e00ee8f9a5547f6d2763b34892ad92dfb0fb79e8f7387b49b9ac7d14a  install.sh
f58e5bf059da1163f19aafbfc72019627727cb766e13152d418fbf51f02580c6  install.ps1
```

## Safe Procedure

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

Windows PowerShell:

```powershell
iwr https://agent.sparkswarm.ai/install.ps1 -OutFile spark-install.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\spark-install.ps1 -DryRun
powershell -NoProfile -ExecutionPolicy Bypass -File .\spark-install.ps1
```

Existing install preview:

```bash
bash spark-install.sh --dry-run --upgrade-existing
```

Windows existing install preview:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\spark-install.ps1 -DryRun -UpgradeExisting
```

Use upgrade mode only after reading the dry-run. It updates the existing Spark CLI inside the same Spark folder.

## Safe Coding Assistant Procedure

1. Read this page and the release manifest.
2. Download the installer to a local file.
3. Verify the hash.
4. Verify attestations and signatures when tools are available.
5. Run dry-run.
6. Explain the plan to the user in plain language.
7. Ask before the real install.

The dry-run should make it clear which files, repos, versions, startup entries, and commands are involved.

## What Spark May Touch

Spark should only contact expected places during install:

- `agent.sparkswarm.ai`
- `github.com/vibeforge1111/spark-cli`
- `github.com/astral-sh/uv`
- `nodejs.org`

If anything unexpected appears in the install plan, stop and ask the user before continuing.

Default install folder:

- macOS, Linux, WSL: `~/.spark`
- Windows: `%USERPROFILE%\.spark`

Expected files:

- `tools/`
- `bin/spark` or `bin/spark.cmd`
- `env`
- `logs/install.log`
- autostart files when autostart is on

## Access Levels After Install

Spark asks for an access level after the Telegram bot is connected.

- Level 1, Chat only: Spark can talk with the user but does not build or inspect outside chat.
- Level 2, Build when asked: Spark can start build work only when the user explicitly asks.
- Level 3, Research + build: recommended default. Spark can inspect public links, docs, and repos when asked, and can use Mission Control for builds.
- Level 4, Full access: advanced local use. Spark can use broader operating-system tools with guardrails and user approval for sensitive actions.

Users can change this later in Telegram with `/access 1`, `/access 2`, `/access 3`, or `/access 4`.

## Pinned Parts

- Spark CLI commit: `f04a65c5048d1c241da6ff4d6ede3e042aaaaee2`
- Node: `22.18.0`
- Python: `3.11`
- uv: `0.11.7`

## After Install

Run:

```bash
spark guide
spark providers status
spark verify --onboarding
```
