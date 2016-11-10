// @flow
import type { Sexp } from './types'

const fs       = require('fs')
const readline = require('readline')
const clauses  = require('./en/clauses')

function parseLine(line): Sexp|void {
  let stack = [[]]
  let word = ''
  for (const c of line) {
    if (c === '#') {
      break
    } else if (c === ' ') {
      // ignore
    } else if (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z') {
      word += c
    } else if (c === '(') {
      stack.push([word])
      word = ''
    } else if (c === ',') {
      if (word !== '') {
        stack[stack.length - 1].push(word)
        word = ''
      }
    } else if (c === ')') {
      if (word !== '') {
        stack[stack.length - 1].push(word)
      }
      word = ''
      //console.log('stack is ', JSON.stringify(stack))
      stack[stack.length - 2].push(stack.pop())
    }
  }
  if (word !== '') {
    stack.push(word)
    word = ''
  }
  if (stack.length !== 1) {
    throw new Error("Expected stack length=1 but got " + stack.length)
  }
  if (stack[0].length === 0) {
    return undefined // ignore this line
  } else if (stack[0].length > 1) {
    throw new Error("Expected stack[0] length=0|1 but got " + stack[0].length)
  } else {
    return stack[0][0]
  }
}

readline.createInterface({
  input: fs.createReadStream('curriculum_ideas/GAME2'),
}).on('line', function(line) {
  const parsed = parseLine(line)
  if (parsed !== undefined) {
    console.log('translated', clauses.translateIndependentClause(parsed,
      { negative: false, past: true }))
  }
})
