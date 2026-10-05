#!/bin/sh
# Télécharge les archives DCMP, type par type, de façon reprenable.
cd "$(dirname "$0")/.."
for t in attribution avisgeneral plan; do
  node --experimental-strip-types scripts/archive-dcmp.ts --type=$t --limite=100000 --pause=3000 2>&1 | grep -v -i "warning\|reparsing\|eliminate\|trace-warn"
done
