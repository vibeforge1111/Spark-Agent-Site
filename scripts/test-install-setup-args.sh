#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
prefix="${TMPDIR:-/tmp}/spark-install-setup-args-test"
sentinel="${prefix}-metachar-sentinel"

run_dry_run() {
  SPARK_PREFIX="$prefix" bash "$repo_root/install.sh" --dry-run "$@"
}

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local message="$3"

  if ! grep -Fq "$needle" <<< "$haystack"; then
    echo "$message" >&2
    echo "$haystack" >&2
    exit 1
  fi
}

assert_not_contains_regex() {
  local haystack="$1"
  local pattern="$2"
  local message="$3"

  if grep -Eq "$pattern" <<< "$haystack"; then
    echo "$message" >&2
    echo "$haystack" >&2
    exit 1
  fi
}

rm -f "$sentinel"

setup_arg_output="$(run_dry_run --setup-arg "Alice Smith")"
assert_contains \
  "$setup_arg_output" \
  "Alice\\ Smith" \
  "--setup-arg did not preserve a value with spaces as one argument"

quoted_like_output="$(run_dry_run --setup-arg 'quoted "value" stays data')"
assert_contains \
  "$quoted_like_output" \
  'quoted\ \"value\"\ stays\ data' \
  "--setup-arg did not preserve quoted-like characters as data"

empty_arg_log="$(mktemp)"
if run_dry_run --setup-arg "" >"$empty_arg_log" 2>&1; then
  echo "--setup-arg accepted an empty value unexpectedly" >&2
  cat "$empty_arg_log" >&2
  rm -f "$empty_arg_log"
  exit 1
fi
empty_arg_output="$(cat "$empty_arg_log")"
rm -f "$empty_arg_log"
assert_contains \
  "$empty_arg_output" \
  "Missing value for --setup-arg." \
  "--setup-arg empty value was not rejected with the documented safe error"

glob_output="$(SPARK_SETUP_ARGS='*' run_dry_run)"
assert_contains \
  "$glob_output" \
  "\\*" \
  "SPARK_SETUP_ARGS '*' was not preserved literally"

assert_not_contains_regex \
  "$glob_output" \
  '(^|[[:space:]])(app\.js|Dockerfile|docs|install\.sh)([[:space:]]|$)' \
  "Dry-run output leaked repository filenames from glob expansion"

metachar_output="$(
  SPARK_SETUP_ARGS=$'value with spaces\nquoted "value"\nsemi;touch '"$sentinel"$'\n$(touch '"$sentinel"$')\n`touch '"$sentinel"$'`\n*' \
    run_dry_run
)"

assert_contains \
  "$metachar_output" \
  "value\\ with\\ spaces" \
  "SPARK_SETUP_ARGS did not preserve spaces safely"

assert_contains \
  "$metachar_output" \
  'quoted\ \"value\"' \
  "SPARK_SETUP_ARGS did not preserve quoted-like characters as literal data"

assert_contains \
  "$metachar_output" \
  "semi\\;touch" \
  "SPARK_SETUP_ARGS did not preserve semicolon-like input literally"

assert_contains \
  "$metachar_output" \
  "\\\$\\(touch" \
  "SPARK_SETUP_ARGS did not preserve command-substitution-like input literally"

assert_contains \
  "$metachar_output" \
  "\\\`touch" \
  "SPARK_SETUP_ARGS did not preserve backtick-like input literally"

assert_contains \
  "$metachar_output" \
  "\\*" \
  "SPARK_SETUP_ARGS wildcard-like input was not preserved literally"

if [ -e "$sentinel" ]; then
  echo "Unsafe shell metacharacter-like input created a sentinel file" >&2
  exit 1
fi

assert_not_contains_regex \
  "$metachar_output" \
  '(^|[[:space:]])(app\.js|Dockerfile|docs|install\.sh)([[:space:]]|$)' \
  "Metacharacter dry-run output leaked repository filenames from glob expansion"

echo "install setup arg parsing tests passed"
