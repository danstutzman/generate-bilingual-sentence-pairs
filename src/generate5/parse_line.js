// @flow
import type { Sexp } from './types'

function parseLine(line: string): Sexp {
  let stack: Array<Array<Sexp>> = [[]]
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
    stack.push([word])
    word = ''
  }
  if (stack.length !== 1) {
    throw new Error("Expected stack length=1 but got " + stack.length)
  }
  if (stack[0].length === 0) {
    throw new Error("Given empty line '" + line + "' to parse")
  } else if (stack[0].length > 1) {
    throw new Error("Expected stack[0] length=0|1 but got " + stack[0].length)
  } else {
    return stack[0][0]
  }
}

module.exports = { parseLine }
