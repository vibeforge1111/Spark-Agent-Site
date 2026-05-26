#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
prefix="${TMPDIR:-/tmp}/spark-install-setup-args-test"

run_dry_run() {
  SPARK_PREFIX="$prefix" bash "$repo_root/install.sh" --dry-run "$@"
}

setup_arg_output="$(run_dry_run --setup-arg "Alice Smith")"
if ! grep -Fq "Alice\\ Smith" <<< "$setup_arg_output"; then
  echo "--setup-arg did not preserve Alice Smith as one argument" >&2
  echo "$setup_arg_output" >&2
  exit 1
fi

glob_output="$(SPARK_SETUP_ARGS='*' run_dry_run)"
if ! grep -Fq "\\*" <<< "$glob_output"; then
  echo "SPARK_SETUP_ARGS '*' was not preserved literally" >&2
  echo "$glob_output" >&2
  exit 1
fi

if grep -Eq '(^|[[:space:]])(app\.js|Dockerfile|docs|install\.sh)([[:space:]]|$)' <<< "$glob_output"; then
  echo "Dry-run output leaked repository filenames from glob expansion" >&2
  echo "$glob_output" >&2
  exit 1
fi

echo "install setup arg parsing tests passed"
