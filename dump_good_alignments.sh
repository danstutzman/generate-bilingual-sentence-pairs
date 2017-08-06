#!/bin/bash -e
PSQL=/Applications/Postgres.app/Contents/MacOS/bin/psql
QUERY="select row_to_json(tuple) from (
  select
    videos.youtube_video_id,
    alignments.begin_millis,
    alignments.end_millis,
    alignments.text_if_good
  from alignments
  join videos on videos.song_source_num = alignments.song_source_num
  where text_if_good is not null
) tuple;"
$PSQL -Upostgres --tuples-only -c "$QUERY" >good_alignments.txt
