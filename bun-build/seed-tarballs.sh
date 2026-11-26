#!/bin/bash
# Seeds Bun's dependency tarball cache from git clones, for a sandbox whose proxy
# refuses GitHub archive downloads but serves git reads. Run after applying
# bun-pin.patch. BUN=/path/to/oven-sh/bun  BORINGSSL=/path/to/ocean/boringssl
set -euo pipefail
: "${BUN:?}" "${BORINGSSL:?}"
C=${BUN_BUILD_CACHE_DIR:-$HOME/.bun/build-cache}/tarballs
mkdir -p "$C" /tmp/depclones
bun "$(dirname "$0")/listdeps.ts" "$BUN" 2>/dev/null | while read -r name repo commit hash; do
  out=$C/$name-$hash.tar.gz
  base=$(basename "$repo")
  if [ "$name" = boringssl ]; then
    git -C "$BORINGSSL" archive --format=tar.gz --prefix="$base-$commit/" -o "$out" "$commit"
  else
    d=/tmp/depclones/$name; rm -rf "$d"; git init -q "$d"
    git -C "$d" fetch -q --depth 1 "https://github.com/$repo" "$commit"
    git -C "$d" archive --format=tar.gz --prefix="$base-$commit/" -o "$out" FETCH_HEAD
  fi
  echo "$name $(stat -c %s "$out")"
done
