// @flow
import type { Ref } from '../types'

const EnIClause = require('./EnIClause')
const EnPronoun = require('./EnPronoun')

class NameNoun {
  ref:  Ref

  constructor(ref:Ref) {
    this.ref = ref
  }
  words(): Array<string> {
    return [this.ref]
  }
}

class EnNClause {
  headWords: Array<string>
  iclause:   EnIClause

  constructor(headWords:Array<string>, iclause:EnIClause) {
    this.headWords = headWords
    this.iclause   = iclause
  }
  words(): Array<string> {
    return this.headWords.concat(this.iclause.words())
  }
}

export type EnNP = NameNoun | EnNClause | EnPronoun

module.exports = { NameNoun, EnNClause }
