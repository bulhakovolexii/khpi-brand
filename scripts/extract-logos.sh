#!/usr/bin/env bash
# Одноразове вирізання логотипів із брендбука (.ai = PDF) у assets/. Запуск: bash scripts/extract-logos.sh
# Потрібні poppler-utils (pdftocairo) та ImageMagick (convert). Результат комітиться, скрипт — для відтворюваності.
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="brandbook/Логотип НТУ ХПІ"
declare -A MAP=( [b_w]=emblem-direct-graphite [b_c_w]=emblem-direct-brand [b]=emblem-inverse-graphite [b_c]=emblem-inverse-brand
                 [s_w]=block-direct-graphite  [s_c_w]=block-direct-brand  [s]=block-inverse-graphite  [s_c]=block-inverse-brand )
crop_svg() { # in.pdf out.svg
  local tmp; tmp=$(mktemp -d)
  pdftocairo -svg "$1" "$tmp/o.svg"
  pdftocairo -png -transp -r 288 -singlefile "$1" "$tmp/o"
  read -r w h x y < <(convert "$tmp/o.png" -format '%@\n' info: | sed 's/[x+]/ /g')
  python3 -I - "$tmp/o.svg" "$2" "$w" "$h" "$x" "$y" <<'PY'
import re,sys
src,dst,w,h,x,y=sys.argv[1],sys.argv[2],*map(float,sys.argv[3:7])
s=open(src,encoding='utf-8').read(); k=4.0  # 288 dpi / 72 pt
vb=f"{x/k:.3f} {y/k:.3f} {w/k:.3f} {h/k:.3f}"
s=re.sub(r'width="[^"]*"','width="%.3f"'%(w/k),s,count=1)
s=re.sub(r'height="[^"]*"','height="%.3f"'%(h/k),s,count=1)
s=re.sub(r'viewBox="[^"]*"','viewBox="%s"'%vb,s,count=1)
open(dst,'w',encoding='utf-8').write(s)
PY
  rm -rf "$tmp"
}
for lang in UA EN; do
  l=$(echo "$lang" | tr A-Z a-z); mkdir -p "assets/logos/$l"
  for k in "${!MAP[@]}"; do crop_svg "$SRC/$lang/${l}_$k.ai" "assets/logos/$l/${MAP[$k]}.svg"; done
done
SYM="brandbook/Символ належності до спільноти ХПІ"; mkdir -p assets/symbol
crop_svg "$SYM/X-logo.ai" assets/symbol/community-color.svg
crop_svg "$SYM/X-logo-gray-outline.ai" assets/symbol/community-gray-outline.svg
crop_svg "$SYM/X-logo-red-outline.ai" assets/symbol/community-brand-outline.svg
crop_svg "$SYM/X-logo-white-outline.ai" assets/symbol/community-white-outline.svg
