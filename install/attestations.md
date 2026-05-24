# Spark Installer Attestations

Spark Agent installer files are attested by GitHub Actions after they pass the install hardening workflow.

The attestation binds the downloaded file digest to this repository and workflow using GitHub Artifact Attestations backed by Sigstore.

Spark also publishes separate Cosign keyless blob signatures as GitHub Release assets. See:

```text
https://agent.sparkswarm.ai/install/signatures.md
```

## Release Manifest

The pinned installer inputs are published at:

```text
https://agent.sparkswarm.ai/install/release-manifest.json
```

The manifest includes the immutable Spark CLI commit, managed Node version, managed Python version, pinned uv version, uv asset hashes, and the installer network allowlist.

## Verify macOS, Linux, or WSL

```bash
curl -fsSL https://agent.sparkswarm.ai/install.sh -o ./install.sh
expected='7795e9914af7a46e7b50c546425f39eacfefe234edf3d52032e06ce07da9897c'
actual=$(if command -v sha256sum >/dev/null 2>&1; then sha256sum ./install.sh | awk '{print $1}'; elif command -v shasum >/dev/null 2>&1; then shasum -a 256 ./install.sh | awk '{print $1}'; else echo 'Missing sha256sum or shasum'; exit 1; fi)
test "$actual" = "$expected" || { echo 'spark installer checksum mismatch'; exit 1; }
gh attestation verify ./install.sh --repo vibeforge1111/Spark-Agent-Site --signer-workflow vibeforge1111/Spark-Agent-Site/.github/workflows/install-hardening.yml --source-ref refs/heads/main
less ./install.sh
bash ./install.sh --dry-run
```

## Verify Windows PowerShell

```powershell
iwr https://agent.sparkswarm.ai/install.ps1 -OutFile .\install.ps1
if ((Get-FileHash .\install.ps1 -Algorithm SHA256).Hash.ToLowerInvariant() -ne '616901c5ab23bd88f44464ddd5801e76c6c4bf73ea80283a521ac1338613b315') { throw 'install.ps1 checksum mismatch' }
gh attestation verify .\install.ps1 --repo vibeforge1111/Spark-Agent-Site --signer-workflow vibeforge1111/Spark-Agent-Site/.github/workflows/install-hardening.yml --source-ref refs/heads/main
Get-Content .\install.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1 -DryRun
```

## Paranoid Mode

For maximum transparency:

1. Download the installer without running it.
2. Verify `install/checksums.txt`.
3. Verify GitHub Artifact Attestations.
4. Verify the Sigstore signature bundle from the latest GitHub Release.
5. Read the installer script.
6. Run dry-run only.
7. Run the installer after the plan looks correct.

## Required Tool

Install GitHub CLI before provenance verification:

```bash
gh --version
```

See https://cli.github.com/ if `gh` is not installed.

## Trust Boundary

Passing verification means the installer bytes match the scripts attested by the `vibeforge1111/Spark-Agent-Site` GitHub Actions workflow. It does not replace reading the script before execution, protecting your local secrets, or rotating leaked tokens.
