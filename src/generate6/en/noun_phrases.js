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
  iclause: EnIClause

  constructor(iclause:EnIClause) {
    this.iclause = iclause
  }
  words(): Array<string> {
    return ['that'].concat(this.iclause.words())
  }
}

export type EnNPhrase = NameNoun | EnNClause | EnPronoun

module.exports = { NameNoun, EnNClause }
