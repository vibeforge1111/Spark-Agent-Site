# Spark Installer Attestations

Spark Agent installer files are attested by GitHub Actions after they pass the install hardening workflow.

The attestation binds the downloaded file digest to this repository and workflow using GitHub Artifact Attestations backed by Sigstore.

## Verify macOS, Linux, or WSL

```bash
curl -fsSL https://agent.sparkswarm.ai/install.sh -o ./install.sh
expected='1ed17ec6f2961d7968c13cdf1d2394f1c9016c364da2e2f4303c3ef677221744'
actual=$(if command -v sha256sum >/dev/null 2>&1; then sha256sum ./install.sh | awk '{print $1}'; elif command -v shasum >/dev/null 2>&1; then shasum -a 256 ./install.sh | awk '{print $1}'; else echo 'Missing sha256sum or shasum'; exit 1; fi)
test "$actual" = "$expected" || { echo 'spark installer checksum mismatch'; exit 1; }
gh attestation verify ./install.sh --repo vibeforge1111/Spark-Agent-Site --signer-workflow vibeforge1111/Spark-Agent-Site/.github/workflows/install-hardening.yml --source-ref refs/heads/main
less ./install.sh
bash ./install.sh --dry-run
```

## Verify Windows PowerShell

```powershell
iwr https://agent.sparkswarm.ai/install.ps1 -OutFile .\install.ps1
if ((Get-FileHash .\install.ps1 -Algorithm SHA256).Hash.ToLowerInvariant() -ne '33bc9156b8e14996bec492f3ede272183ac57b99756bf47304b295ddae8b665c') { throw 'install.ps1 checksum mismatch' }
gh attestation verify .\install.ps1 --repo vibeforge1111/Spark-Agent-Site --signer-workflow vibeforge1111/Spark-Agent-Site/.github/workflows/install-hardening.yml --source-ref refs/heads/main
Get-Content .\install.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1 -DryRun
```

## Required Tool

Install GitHub CLI before provenance verification:

```bash
gh --version
```

See https://cli.github.com/ if `gh` is not installed.

## Trust Boundary

Passing verification means the installer bytes match the scripts attested by the `vibeforge1111/Spark-Agent-Site` GitHub Actions workflow. It does not replace reading the script before execution, protecting your local secrets, or rotating leaked tokens.
