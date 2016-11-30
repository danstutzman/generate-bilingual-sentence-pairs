// @flow
import type { Sexp } from './types'

const fs             = require('fs')
const readline       = require('readline')
const enClauses      = require('./en/clauses')
const esClauses      = require('./es/clauses')
const { EnPronouns } = require('./en/pronouns')
const { EsPronouns } = require('./es/pronouns')
const parse_line     = require('./parse_line')

readline.createInterface({
  input: fs.createReadStream('curriculum_ideas/GAME2'),
}).on('line', function(line) {
  if (line !== '' && line.charAt(0) !== '#') {
    const parsed = parse_line.parseLine(line)
    console.log(enClauses.translateSpeechActShort(parsed, new EnPronouns({}),
      {}).join(' '))
    console.log(esClauses.translateSpeechActShort(parsed, new EsPronouns({}),
      {}).join(' '))
  }
})
