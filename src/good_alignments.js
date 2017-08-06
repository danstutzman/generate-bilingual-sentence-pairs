// @flow
const fs            = require('fs')
const child_process = require('child_process')

type Alignment = {|
  begin_millis:     number,
  end_millis:       number,
  text_if_good:     string,
  youtube_video_id: string
|}

const alignments: Array<Alignment> = []
const lines = fs.readFileSync('good_alignments.txt').toString().split(/\r?\n/)
for (const line of lines) {
  if (line.trim() !== '') {
    alignments.push(JSON.parse(line))
  }
}

const alignment = alignments[Math.floor(Math.random() * alignments.length)]
const excerptUrl = `http://localhost:9292/excerpt.wav?video_id=${alignment.youtube_video_id}&begin_millis=${alignment.begin_millis}&end_millis=${alignment.end_millis}`
console.log(`Downloading ${excerptUrl}...`)
child_process.execFileSync('curl', ['--silent', '-L', excerptUrl, '-o', 'excerpt.wav'])
console.log('what is the text?')
child_process.execFileSync('/usr/bin/afplay', ['excerpt.wav'])
