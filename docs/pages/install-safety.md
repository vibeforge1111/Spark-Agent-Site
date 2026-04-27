---
title: Spark Install Safety
slug: install-safety
status: published
verified_at: "2026-04-27T00:00:00Z"
verified_by: codex@sparkswarm.ai
authority_level: L3
canonical_for:
  - spark-installer-safety
do_not_infer: false
sources:
  - id: 3a6c16a6-ae2f-4f00-8ccd-4d75857ef410
    url: "https://agent.sparkswarm.ai/install/checksums.txt"
    type: checksum-manifest
    fetched_at: "2026-04-27T00:00:00Z"
  - id: 81c4c7ef-2642-4f42-b8b2-0d86abf4e6f7
    url: "https://agent.sparkswarm.ai/install/release-manifest.json"
    type: release-manifest
    fetched_at: "2026-04-27T00:00:00Z"
---

# Spark Install Safety

Use this page before installing Spark.

It is written for humans and local coding agents.

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
cfe64a9f58b367bc8e582be1761c8e0370ce5f3d7fa8c164ed1ed78f2f51eac2  install.sh
9be5c42a5d2ab846071d4aad307d58e04b2391e17b9098a0b22ea441355d2326  install.ps1
```

## Safe Human Procedure

1. Download the installer.
2. Run dry-run.
3. Read what Spark says it will do.
4. Continue only if the plan looks right.

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

## Secrets

Telegram bot tokens are secrets.

LLM provider keys are secrets.

Keep them local.
