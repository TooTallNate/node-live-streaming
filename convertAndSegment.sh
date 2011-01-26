#!/usr/bin/env sh

ffmpeg \
  -f s16le -acodec pcm_s16le -ac 2 -ar 44100 -i - \
  -f mpegts -acodec libmp3lame -ab "$1k" -ar 32000 -flags +loop+mv4 -cmp 256 \
  -partitions +parti4x4+partp8x8+partb8x8 -subq 7 -trellis 1 -refs 5 -coder 0 \
  -me_range 16 -keyint_min 25 -sc_threshold 40 -i_qfactor 0.71 -bt "$1k" \
  -maxrate "$1k" -bufsize "$1k" -qcomp 0.6 -qmin 10 -qmax 51 -qdiff 4 \
  -level 30 -g 45 -async 2 - 2>/dev/null | \
~/segmenter/segmenter - 10 "$1k" "$1k.m3u8" "" 5
