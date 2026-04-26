# Spark Installer Attestations

Spark Agent installer files are attested by GitHub Actions after they pass the install hardening workflow.

The attestation binds the downloaded file digest to this repository and workflow using GitHub Artifact Attestations backed by Sigstore.

## Verify macOS, Linux, or WSL

```bash
curl -fsSL https://agent.sparkswarm.ai/install.sh -o ./install.sh
printf '%s  %s\n' '07f616ad8ac15686082c244a105add80c41ac61971f3c69e68a48fe965af1ceb' './install.sh' | sha256sum -c -
gh attestation verify ./install.sh --repo vibeforge1111/Spark-Agent-Site --signer-workflow vibeforge1111/Spark-Agent-Site/.github/workflows/install-hardening.yml --source-ref refs/heads/main
less ./install.sh
```

## Verify Windows PowerShell

```powershell
iwr https://agent.sparkswarm.ai/install.ps1 -OutFile .\install.ps1
if ((Get-FileHash .\install.ps1 -Algorithm SHA256).Hash.ToLowerInvariant() -ne 'c62c2742d2dcd49030936fdbc8425dd628f6ea84c9402b132ca0c74ede4fafb4') { throw 'install.ps1 checksum mismatch' }
gh attestation verify .\install.ps1 --repo vibeforge1111/Spark-Agent-Site --signer-workflow vibeforge1111/Spark-Agent-Site/.github/workflows/install-hardening.yml --source-ref refs/heads/main
Get-Content .\install.ps1
```

## Required Tool

Install GitHub CLI before provenance verification:

```bash
gh --version
```

See https://cli.github.com/ if `gh` is not installed.

## Trust Boundary

Passing verification means the installer bytes match the scripts attested by the `vibeforge1111/Spark-Agent-Site` GitHub Actions workflow. It does not replace reading the script before execution, protecting your local secrets, or rotating leaked tokens.
