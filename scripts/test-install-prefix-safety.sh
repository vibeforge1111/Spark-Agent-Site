#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
scratch="$(mktemp -d)"
trap 'rm -rf "$scratch"' EXIT
sentinel="$scratch/prefix-injection-sentinel"

expect_allowed() {
  local prefix="$1"
  SPARK_PREFIX="$prefix" bash "$repo_root/install.sh" --dry-run >/dev/null
}

expect_rejected() {
  local prefix="$1"
  local output="$scratch/rejected.log"
  if SPARK_PREFIX="$prefix" bash "$repo_root/install.sh" --dry-run >"$output" 2>&1; then
    echo "unsafe prefix was accepted: $prefix" >&2
    exit 1
  fi
  grep -Fq "Refusing install prefix that cannot be represented safely" "$output"
}

expect_allowed "$scratch/spark path"
expect_allowed "$scratch/spark;literal"
expect_allowed "$scratch/spark&(literal)"
expect_allowed "$scratch/spark's"

expect_rejected "$scratch/\$(touch $sentinel)"
expect_rejected "$scratch/\`touch $sentinel\`"
expect_rejected "$scratch/spark\"break"
expect_rejected "$scratch/spark\\break"
expect_rejected "$scratch/spark"$'\n'"break"
expect_rejected "$scratch/spark"$'\r'"break"

if [ -e "$sentinel" ]; then
  echo "prefix validation executed attacker-controlled shell syntax" >&2
  exit 1
fi

echo "install prefix safety tests passed"
