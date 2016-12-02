// @flow
import type { Ref } from '../types'
import type { NounPhrase } from '../uni/noun_phrases'

const { NounClause } = require('../uni/noun_phrases')

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
  omit: bool

  setOmit(omit:bool): EsNounClause {
    this.omit = omit
    return this
  }
  words(): Array<string> {
    return ['que...']
  }
}

export type EsNounPhrase = NameNoun | EsNounClause

function translateNounPhrase(np:NounPhrase) {
  if (typeof np == 'string') {
    return new NameNoun(np)
  } else if (np instanceof NounClause) {
    return new EsNounClause()
  } else {
    throw new Error("Can't translateNounPhrase " + JSON.stringify(np))
  }
}

module.exports = { NameNoun, EsNounClause, translateNounPhrase }
