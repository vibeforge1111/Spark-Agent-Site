# Bug Hunter Proof — PR for stale spark-cli commit ref update (r15 → r16)

## Fix: update pinned spark-cli commit ref from `7ab32b23` (May 24) to `09c1688d` (May 28 master HEAD)

### Before

```bash
# install.sh
SPARK_CLI_RELEASE_NAME="${SPARK_CLI_RELEASE_NAME:-spark-cli-public-installer-2026-05-24-r15}"
SPARK_DEFAULT_CLI_REF="7ab32b23003726dcea8a414c8e9395bf13f45e12"
```

```powershell
# install.ps1
[string]$Ref = "7ab32b23003726dcea8a414c8e9395bf13f45e12",
```

Commit `7ab32b23` is from May 24 2026. The spark-cli master HEAD at time of fix is `09c1688d` (May 28 2026). Security-relevant commits merged after the old pin include:

- `79ff0f74` — "install: guard missing option values"
- `ac6abe91` — "security: harden approval classifier gaps"

Every first-run install from the site received a build missing these fixes with no warning.

### After

```bash
SPARK_CLI_RELEASE_NAME="${SPARK_CLI_RELEASE_NAME:-spark-cli-public-installer-2026-05-28-r16}"
SPARK_DEFAULT_CLI_REF="09c1688d98b4466b2dd338deb4cfedcb832e2da6"
```

```powershell
[string]$Ref = "09c1688d98b4466b2dd338deb4cfedcb832e2da6",
```

### Cascading changes (required for internal consistency)

Because `install.sh` and `install.ps1` changed content, their SHA256 checksums changed. All consistency files were updated atomically:

| File | What changed |
|---|---|
| `install/checksums.txt` | New SHA256 for both installer files |
| `install/checksums.json` | New SHA256 + updated date |
| `install/commands.json` | New SHA256, new ref, new release name, new date |
| `install/release-manifest.json` | New commit, new release name, new date |
| `scripts/check-security-release-surface.mjs` | Updated constants; old ref + release name added to `staleTokens` |
| 7 doc files | Old hash and release name replaced |

### Evidence

| Field | Value |
|---|---|
| Old commit | `7ab32b23003726dcea8a414c8e9395bf13f45e12` (May 24 2026) |
| New commit | `09c1688d98b4466b2dd338deb4cfedcb832e2da6` (May 28 2026, master HEAD) |
| Old release | `spark-cli-public-installer-2026-05-24-r15` |
| New release | `spark-cli-public-installer-2026-05-28-r16` |
| Files changed | 14 |
| Stale refs remaining | 0 |
| Packet validation | `pass` — 0 errors, 0 warnings |
| Side effects | Install behaviour is identical except users now receive the current master build |
