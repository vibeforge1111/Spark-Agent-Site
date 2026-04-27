# Spark Installer Sigstore Signatures

Spark publishes GitHub Artifact Attestations and a separate Sigstore keyless signing release for installer files.

The signing workflow uses GitHub Actions OIDC and Cosign keyless blob signing. No long-lived Spark signing private key is stored in this repository.

## Latest Signing Release

Download the latest production signing bundle from:

```text
https://github.com/vibeforge1111/Spark-Agent-Site/releases/latest
```

The release contains installer files, metadata files, `signed-release.json`, and `*.sigstore.json` signature bundles.

## Expected Identity

```text
https://github.com/vibeforge1111/Spark-Agent-Site/.github/workflows/release-signing.yml@refs/heads/main
```

Expected OIDC issuer:

```text
https://token.actions.githubusercontent.com
```

## Verify macOS, Linux, or WSL

```bash
curl -fsSL https://agent.sparkswarm.ai/install.sh -o ./install.sh
gh release download --repo vibeforge1111/Spark-Agent-Site --pattern install.sh.sigstore.json --pattern signed-release.json --dir ./spark-signatures
cosign verify-blob ./install.sh \
  --bundle ./spark-signatures/install.sh.sigstore.json \
  --certificate-identity "https://github.com/vibeforge1111/Spark-Agent-Site/.github/workflows/release-signing.yml@refs/heads/main" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com"
```

## Verify Windows PowerShell

```powershell
iwr https://agent.sparkswarm.ai/install.ps1 -OutFile .\install.ps1
gh release download --repo vibeforge1111/Spark-Agent-Site --pattern install.ps1.sigstore.json --pattern signed-release.json --dir .\spark-signatures
cosign verify-blob .\install.ps1 `
  --bundle .\spark-signatures\install.ps1.sigstore.json `
  --certificate-identity "https://github.com/vibeforge1111/Spark-Agent-Site/.github/workflows/release-signing.yml@refs/heads/main" `
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com"
```

## Trust Boundary

Passing Sigstore verification means the downloaded bytes match a blob signed by the Spark release-signing workflow on `main`. It should be used alongside SHA-256 checksums, GitHub Artifact Attestations, script inspection, and dry-run.
