// @flow
import type { Person, Tense, Number, PreferredPronouns } from './types'
import type { UniNP } from '../uni/noun_phrases'
import type { EnNPhrase } from './noun_phrases'

const EnPronoun = require('./EnPronoun')
const { raise } = require('../raise')
const { UniNClause } = require('../uni/noun_phrases')
const { NameNoun, EnNClause } = require('./noun_phrases')
const EnIClause = require('./EnIClause')
const { UniIClause } = require('../uni/uni_iclause')
const EnPronouns = require('./EnPronouns')
const { conjugate, EnVerb } = require('./verbs')

class Translator {
  tense:                  Tense
  pronouns:               EnPronouns
  refToPreferredPronouns: {[ref:string]:PreferredPronouns}

  constructor(tense:Tense, pronouns:EnPronouns,
      refToPreferredPronouns:{[ref:string]:PreferredPronouns}) {
    this.tense                  = tense
    this.pronouns               = pronouns
    this.refToPreferredPronouns = refToPreferredPronouns
  }
  translateIClause(iclause:UniIClause) {
    let person = 3
    let number = 1
    let agent
    if (typeof iclause.agent === 'string') {
      [person, number, agent] = this.pronouns.lookup(iclause.agent, undefined, true,
        this.refToPreferredPronouns)
    }
    if (agent === undefined) {
      [person, number, agent] = [3, 1, this.translateNounPhrase(iclause.agent)]
    }

    const helpingVerb = (iclause.question !== undefined) ?
      conjugate('do', this.tense, person, number) : undefined
    const mainVerb = (iclause.question !== undefined) ?
      new EnVerb([iclause.verb]) : conjugate(iclause.verb, this.tense, person, number)

    let indirect: EnNPhrase | void
    if (iclause.indirect !== undefined) {
      if (typeof iclause.indirect === 'string') {
        indirect = this.pronouns.lookup(iclause.indirect,
          typeof iclause.agent === 'string' ? iclause.agent : undefined, false,
          this.refToPreferredPronouns)[2]
        if (indirect === undefined &&
            /* flowtype workaround */ iclause.indirect !== undefined) {
          indirect = this.translateNounPhrase(iclause.indirect)
        }
      }
    }

    let direct
    if (iclause.remove !== iclause.direct) {
      if (typeof iclause.direct === 'string') {
        direct = this.pronouns.lookup(iclause.direct,
          typeof iclause.agent === 'string' ? iclause.agent : undefined, false,
          this.refToPreferredPronouns)[2]
      }
      if (direct === undefined) {
        direct = this.translateNounPhrase(iclause.direct)
      }
    }

    return new EnIClause({ agent, helpingVerb, mainVerb, direct, indirect })
  }
  translateNounPhrase(np:UniNP) {
    if (typeof np == 'string') {
      return new NameNoun(np)
    } else if (np instanceof UniNClause) {
      return new EnNClause(this.translateIClause(np.iclause))
    } else {
      throw new Error("Can't translateNounPhrase " + JSON.stringify(np))
    }
  }
}

module.exports = Translator
