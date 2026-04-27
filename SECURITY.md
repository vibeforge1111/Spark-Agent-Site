# Security

`agent.sparkswarm.ai` is a production installer surface. Treat every change to installer scripts, checksums, headers, and deploy configuration as security-sensitive.

## Supported Posture

- The site is static.
- Only `GET` and `HEAD` requests are allowed.
- Installer scripts and checksum manifests are served without cache.
- Security headers are set in `nginx.conf`, including CSP, HSTS, `nosniff`, and frame denial.
- Installer provenance is documented in `install/attestations.md`.
- Installer release inputs are pinned in `install/release-manifest.json`.
- GitHub Actions validates installer syntax, checksum manifests, trust-boundary strings, container build, and attestation generation.
- Security contact metadata is published at `/.well-known/security.txt`.

## Secrets

This repo should not contain runtime secrets.

Never commit:

- `.env`, `.env.*`
- provider API keys
- Telegram bot tokens
- Cloudflare credentials
- private deployment credentials
- generated user state from `~/.spark`

If any token or private key appears in a commit, chat, log, screenshot, or issue, rotate it before continuing.

## Installer Change Rules

Installer changes must keep these invariants:

- no remote-script piping in documentation
- no installer-managed runtime setup through remote-script piping
- managed runtime downloads must be version-pinned and checksum-verified
- default `spark-cli` source must resolve to an immutable commit SHA
- canonical `spark-cli` source enforced by default
- development source override requires an explicit flag/env
- script bytes match `install/checksums.txt`
- `install/checksums.json` and `install/commands.json` match `install/checksums.txt`
- UI/docs display the current hashes
- attestation verification instructions remain valid

## Required Verification

Before merging installer or deploy changes:

```bash
bash -n install.sh
pwsh -NoProfile -Command '$tokens = $null; $errors = $null; [System.Management.Automation.Language.Parser]::ParseFile((Resolve-Path "./install.ps1"), [ref] $tokens, [ref] $errors) | Out-Null; if ($errors.Count) { $errors | ForEach-Object { Write-Error $_ }; exit 1 }'
docker build -t spark-agent-site-hardening .
```

After deploy:

```bash
spark verify --installers --hosted-installers
```

## Report A Concern

For private reports, use `/.well-known/security.txt` or contact the repository owner directly. Do not file public issues containing installer bypasses, leaked tokens, private keys, or exploit-ready details.
