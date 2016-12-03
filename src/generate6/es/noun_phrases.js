// @flow
import type { Ref } from '../types'

const EsIClause = require('./EsIClause')

class NameNoun {
  ref:  Ref
  omit: bool

  constructor(ref:Ref) {
    this.ref = ref
  }
  setOmit(omit:bool): NameNoun {
    this.omit = omit
    return this
  }
  words(): Array<string> {
    return this.omit ? [] : [this.ref]
  }
}

class EsNounClause {
  headWords: Array<string>
  iclause:   EsIClause
  omit:      bool

  constructor(headWords:Array<string>, iclause:EsIClause) {
    this.headWords = headWords
    this.iclause   = iclause
  }
  setOmit(omit:bool): EsNounClause {
    this.omit = omit
    return this
  }
  words(): Array<string> {
    return this.headWords.concat(this.iclause.words())
  }
}

export type EsNounPhrase = NameNoun | EsNounClause

module.exports = { NameNoun, EsNounClause }
