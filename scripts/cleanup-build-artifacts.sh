#!/usr/bin/env bash
set -euo pipefail

EXECUTE=false
TARGETS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --execute)
      EXECUTE=true
      shift
      ;;
    --dir)
      if [[ -n "${2:-}" ]]; then
        TARGETS+=("$2")
        shift 2
      else
        echo "--dir flag requires a value" >&2
        exit 1
      fi
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ROOT_DIR=$( realpath "$SCRIPT_DIR/.." )
cd "$ROOT_DIR"

DEFAULT_TARGETS=(
  ".next"
  "dist"
  "out"
  "coverage"
  "tmp"
  "temp"
  "apps/admin-portal/.next"
  "apps/farmer-portal/.next"
  "apps/certificate-portal/.next"
  "apps/frontend/.next"
  "apps/backend/build"
)

mapfile -t UNIQUE_TARGETS < <(printf "%s\n" "${DEFAULT_TARGETS[@]}" "${TARGETS[@]}" | awk '!seen[$0]++')

if [[ "$EXECUTE" == false ]]; then
  echo "Dry run only. Pass --execute to delete the directories."
  echo
fi

for target in "${UNIQUE_TARGETS[@]}"; do
  if [[ -z "$target" ]]; then
    continue
  fi

  if [[ ! -e "$target" ]]; then
    echo "[skip] $target (not found)"
    continue
  fi

  if [[ "$EXECUTE" == false ]]; then
    echo "[plan] would remove $target"
    continue
  fi

  rm -rf "$target"
  echo "[done] removed $target"

done

if [[ "$EXECUTE" == false ]]; then
  echo
  echo "Nothing was deleted. Review the directories above, then re-run with --execute."
fi
