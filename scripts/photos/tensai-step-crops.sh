#!/bin/zsh
# Crops of the live Tensai screens wide enough to hold each paragraph and answer whole (no line is
# cut at an edge), upscaled ~1.4x with lanczos; the app's button bar under the exercise dissolves into
# the app background (#f9faf5).
set -e
D=${TENSAI_SCREENS:?path to tensai-home/docs/positioning-v8/release/screens}
OUT=${1:-public/images/two-path}
W=1120; H=1013
crop() { # id src x y w h fadeRightPx fadeBottomFrom fadeBottomTo (output px)
  local id=$1 src=$2 x=$3 y=$4 w=$5 h=$6 fr=$7 b0=$8 b1=$9
  local a="max(if(gt($fr,0),clip((X-(W-$fr))/max($fr,1),0,1),0),if(gt($b1,0),clip((Y-$b0)/max($b1-$b0,1),0,1),0))"
  local m="st(0,$a);st(0,ld(0)*ld(0)*(3-2*ld(0)))"
  ffmpeg -v error -y -i $D/$src -vf "format=rgb24,crop=${w}:${h}:${x}:${y},scale=${W}:${H}:flags=lanczos,unsharp=5:5:0.5,geq=r='$m;r(X,Y)*(1-ld(0))+249*ld(0)':g='$m;g(X,Y)*(1-ld(0))+250*ld(0)':b='$m;b(X,Y)*(1-ld(0))+245*ld(0)'" -frames:v 1 $OUT/$id.png
  cwebp -quiet -q 90 -m 6 $OUT/$id.png -o $OUT/$id.webp
  print "$id $(stat -f %z $OUT/$id.webp) bytes  box [$x,$y,$((x+w)),$((y+h))]"
}
crop tensai-step-intro live-lesson-intro.png 674 0 786 711 0 0 0
crop tensai-step-exercise live-exercise.png 682 130 810 733 0 902 922
crop tensai-step-map live-map.png 565 100 821 742 0 0 0
