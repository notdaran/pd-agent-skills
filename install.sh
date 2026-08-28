#!/usr/bin/env bash
# Symlink every skill in this repo into your agent's skills folder, and copy any
# slash commands the skills ship. Safe to re-run: existing links are left alone
# and anything unexpected is skipped rather than overwritten.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
COMMANDS_DIR="${CLAUDE_COMMANDS_DIR:-$HOME/.claude/commands}"

mkdir -p "$SKILLS_DIR" "$COMMANDS_DIR"

echo "Installing from $REPO_DIR"
echo "  skills   -> $SKILLS_DIR"
echo "  commands -> $COMMANDS_DIR"
echo

skipped=0

for src in "$REPO_DIR"/skills/*/; do
  src="${src%/}"
  name="$(basename "$src")"
  dest="$SKILLS_DIR/$name"

  if [ -L "$dest" ]; then
    if [ "$(readlink "$dest")" = "$src" ]; then
      echo "  = $name (already linked)"
    else
      echo "  ! $name - a symlink to somewhere else is already there, skipped"
      skipped=$((skipped + 1))
    fi
  elif [ -e "$dest" ]; then
    echo "  ! $name - a real directory is already there, skipped"
    skipped=$((skipped + 1))
  else
    ln -s "$src" "$dest"
    echo "  + $name"
  fi

  for cmd in "$src"/commands/*.md; do
    [ -e "$cmd" ] || continue
    cp "$cmd" "$COMMANDS_DIR/$(basename "$cmd")"
    echo "      command: /$(basename "$cmd" .md)"
  done
done

echo
if [ "$skipped" -gt 0 ]; then
  echo "$skipped skill(s) skipped - remove the existing entry yourself if you meant to replace it."
  echo
fi
echo "Skills are symlinked, so 'git pull' in this repo updates them in place."
echo "The rendering skills each need one setup step before first use:"
echo "  feature-demo  cd skills/feature-demo && npm install && npx playwright install chromium"
echo "  illustra      cd skills/illustra && npm install && npx playwright install chromium-headless-shell"
echo "  anima         npx hyperframes doctor           (needs Node >= 22 and FFmpeg)"
