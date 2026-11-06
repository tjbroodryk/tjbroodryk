#!/usr/bin/env bash
# Daily from cron on each machine: record token usage and push it.
# Each machine writes only its own usage/<hostname>.json, so pushes never conflict.
set -euo pipefail
cd "$(dirname "$0")"
git pull -q --rebase
node usage.mjs
git add usage
if git diff --cached --quiet; then
  exit 0
fi
git commit -q -m "chore: sync token usage ($(hostname -s))"
git push -q
