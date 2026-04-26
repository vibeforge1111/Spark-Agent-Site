# Spark Agent Site

Static production site for `agent.sparkswarm.ai`. It serves the Spark Agent installer UI, hosted installer scripts, checksum manifests, and installer attestation instructions.

## Production Role

This repo is a live install surface. It does not run the Spark runtime itself; it publishes the bytes that users and agents download before installing `spark-cli`.

The site serves:

- `/` interactive install page
- `/install.sh` macOS/Linux/WSL installer
- `/install.ps1` Windows PowerShell installer
- `/install/checksums.txt` and `/install/checksums.json`
- `/install/commands.json`
- `/install/attestations.md`
- `/docs` agent-readable install and safety docs

## Trust Boundary

Installer scripts are privileged local execution. A site deploy must preserve:

- HTTPS-only delivery
- HSTS at the edge and in the container config
- no-cache behavior for installer files and checksum manifests
- checksum references in the UI and docs
- GitHub Artifact Attestations for installer bytes
- refusal of non-canonical Spark CLI sources unless explicitly using the development override

Users and agents should download, verify, inspect, then run installers. Do not document or encourage piping remote scripts directly into a shell.

## Local Verification

Validate installer syntax, checksums, trust-boundary strings, container build, and attest workflow expectations:

```bash
docker build -t spark-agent-site-hardening .
```

The GitHub Actions workflow runs the full hardening suite:

```text
.github/workflows/install-hardening.yml
```

Before pushing installer changes, also check the install manifests:

```bash
python - <<'PY'
import hashlib, json, pathlib
root = pathlib.Path(".")
expected = {}
for line in (root / "install/checksums.txt").read_text(encoding="utf-8").splitlines():
    if line.strip():
        digest, relpath = line.split(maxsplit=1)
        expected[relpath] = digest
for relpath, digest in expected.items():
    actual = hashlib.sha256((root / relpath).read_bytes()).hexdigest()
    assert actual == digest, (relpath, actual, digest)
print("checksums ok")
PY
```

## Deploy Checklist

1. Run the install-hardening workflow locally where practical.
2. Push to `main`.
3. Confirm GitHub Actions generated installer attestations.
4. Confirm hosted files match committed checksums.
5. Run hosted installer verification from `spark-cli`:

```bash
spark verify --installers --hosted-installers
```

## Related Docs

- [install/attestations.md](install/attestations.md)
- [docs/AGENTS.md](docs/AGENTS.md)
- [SECURITY.md](SECURITY.md)
