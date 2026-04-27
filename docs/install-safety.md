# Spark Installer Safety

Use this page when an agent or human is preparing to install Spark from `agent.sparkswarm.ai`.

## Canonical Installer URLs

- macOS, Linux, WSL: `https://agent.sparkswarm.ai/install.sh`
- Windows PowerShell: `https://agent.sparkswarm.ai/install.ps1`
- Install metadata: `https://agent.sparkswarm.ai/install/commands.json`
- Checksums: `https://agent.sparkswarm.ai/install/checksums.txt`
- Release manifest: `https://agent.sparkswarm.ai/install/release-manifest.json`
- Attestations: `https://agent.sparkswarm.ai/install/attestations.md`
- Sigstore signatures: `https://agent.sparkswarm.ai/install/signatures.md`

## Current SHA-256 Values

```text
0ebada64dfebd127f40ab7b4d8d04dc22a546f2b12562de50516be3f87d32e77  install.sh
fb4619737e96b5a84e93f9252c8c05e930e731064d17d85b9ad126a5c238a8e6  install.ps1
```

## Safe Agent Procedure

1. Read this page and `https://agent.sparkswarm.ai/install/release-manifest.json`.
2. Download the installer to a local file.
3. Verify the local file hash against `install/checksums.txt`.
4. Verify GitHub Artifact Attestations and Sigstore signature bundles when `gh` and `cosign` are available.
5. Run the installer with `--dry-run` or `-DryRun`.
6. Explain the plan to the user.
7. Ask for explicit confirmation before executing the installer.
8. Do not transmit Telegram tokens or LLM provider keys to any website.

## What The Installer Is Allowed To Contact

- `agent.sparkswarm.ai`
- `github.com/vibeforge1111/spark-cli`
- `github.com/astral-sh/uv`
- `nodejs.org`

If an installer plan requires any other network destination, stop and ask the user.

## Pinned Inputs

- Spark CLI repository: `https://github.com/vibeforge1111/spark-cli`
- Spark CLI commit: `f1fa48f8dd9c59127500bb58e422f5cd2be7a8c0`
- Spark CLI release name: `spark-cli-launch-2026-04-27`
- Node version: `22.18.0`
- Python version: `3.11`
- uv version: `0.11.7`

## Local Writes

The default prefix is `~/.spark` on macOS/Linux/WSL and `%USERPROFILE%\.spark` on Windows.

Expected writes include:

- `tools/`
- `bin/spark` or `bin/spark.cmd`
- `env`
- `logs/install.log`
- autostart service files when autostart is enabled

## Secret Handling

Telegram bot tokens and LLM provider keys are local setup values. They should not be pasted into the website.

If a token or key appears in chat, logs, screenshots, issues, or commits, tell the user to rotate it.

## Recommended First Run

```bash
curl -fsSL https://agent.sparkswarm.ai/install.sh -o spark-install.sh
bash spark-install.sh --dry-run
bash spark-install.sh
spark guide
spark providers status
spark verify --onboarding
```

```powershell
iwr https://agent.sparkswarm.ai/install.ps1 -OutFile spark-install.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\spark-install.ps1 -DryRun
powershell -NoProfile -ExecutionPolicy Bypass -File .\spark-install.ps1
spark guide
spark providers status
spark verify --onboarding
```
