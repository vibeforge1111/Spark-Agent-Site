"""Dry-run smoke test: verify installer files pin the expected spark-cli ref and checksums match.

No installation is performed. This test reads local files only.
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
INSTALL_SH = REPO_ROOT / "install.sh"
INSTALL_PS1 = REPO_ROOT / "install.ps1"
CHECKSUMS_TXT = REPO_ROOT / "install" / "checksums.txt"
CHECKSUMS_JSON = REPO_ROOT / "install" / "checksums.json"

EXPECTED_CLI_REF = "09c1688d98b4466b2dd338deb4cfedcb832e2da6"
STALE_CLI_REF = "7ab32b23003726dcea8a414c8e9395bf13f45e12"


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()


def _parse_checksums_txt() -> dict[str, str]:
    result = {}
    for line in CHECKSUMS_TXT.read_text(encoding="utf-8").splitlines():
        parts = line.split()
        if len(parts) == 2:
            digest, name = parts
            result[name.lstrip("*")] = digest
    return result


def test_install_sh_pins_expected_ref():
    """install.sh must pin the validated spark-cli ref, not the stale May-24 commit."""
    src = INSTALL_SH.read_text(encoding="utf-8")
    assert EXPECTED_CLI_REF in src, f"install.sh must contain ref {EXPECTED_CLI_REF}"


def test_install_ps1_pins_expected_ref():
    """install.ps1 must pin the same validated spark-cli ref."""
    src = INSTALL_PS1.read_text(encoding="utf-8")
    assert EXPECTED_CLI_REF in src, f"install.ps1 must contain ref {EXPECTED_CLI_REF}"


def test_no_stale_ref_in_installers():
    """The stale May-24 ref must not appear in either installer."""
    sh_src = INSTALL_SH.read_text(encoding="utf-8")
    ps1_src = INSTALL_PS1.read_text(encoding="utf-8")
    assert STALE_CLI_REF not in sh_src, "stale ref must be absent from install.sh"
    assert STALE_CLI_REF not in ps1_src, "stale ref must be absent from install.ps1"


def test_install_sh_checksum_matches_checksums_txt():
    """SHA256 of install.sh must match checksums.txt."""
    expected = _parse_checksums_txt().get("install.sh")
    assert expected is not None, "checksums.txt must contain install.sh entry"
    actual = _sha256(INSTALL_SH)
    assert actual == expected, f"install.sh checksum mismatch: {actual} != {expected}"


def test_install_ps1_checksum_matches_checksums_txt():
    """SHA256 of install.ps1 must match checksums.txt."""
    expected = _parse_checksums_txt().get("install.ps1")
    assert expected is not None, "checksums.txt must contain install.ps1 entry"
    actual = _sha256(INSTALL_PS1)
    assert actual == expected, f"install.ps1 checksum mismatch: {actual} != {expected}"


def test_checksums_json_consistent_with_checksums_txt():
    """checksums.json must agree with checksums.txt on both file hashes."""
    txt = _parse_checksums_txt()
    data = json.loads(CHECKSUMS_JSON.read_text(encoding="utf-8"))
    for entry in data.get("files", []):
        name = entry["path"].split("/")[-1]
        if name in txt:
            assert entry["sha256"] == txt[name], (
                f"checksums.json and checksums.txt disagree on {name}: "
                f"{entry['sha256']} vs {txt[name]}"
            )
