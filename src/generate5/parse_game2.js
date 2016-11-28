// @flow
import type { Sexp } from './types'

const fs         = require('fs')
const readline   = require('readline')
const enClauses  = require('./en/clauses')
const esClauses  = require('./es/clauses')
const parse_line = require('./parse_line')

readline.createInterface({
  input: fs.createReadStream('curriculum_ideas/GAME2'),
}).on('line', function(line) {
  if (line !== '' && line.charAt(0) !== '#') {
    const parsed = parse_line.parseLine(line)
    for (const clauses of [enClauses, esClauses]) {
      console.log(clauses.translateIndependentClause(parsed,
        { negative: false, past: false, short: true }).join(' '))
    }
  }
})
