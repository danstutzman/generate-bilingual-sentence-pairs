// @flow
import type { Ref } from '../types'
import type { Gender, Person, Number } from './types'

const { raise } = require('../raise')
const Pronoun = require('./Pronoun')

function numOfRef(ref:Ref): Number {
  const num = {A:1, B:1, AA:2, Libro:1, Pluma:1, What:1}[ref]
  if (num === undefined) {
    throw new Error("Don't know num of " + ref)
  }
  return num
}

function genOfRef(ref:Ref): Gender {
  const gen = {A:'?', B:'?', AA:'?', Libro:'M', Pluma:'F', What:'?'}[ref]
  if (gen === undefined) {
    throw new Error("Don't know gen of " + ref)
  }
  return gen
}

class Pronouns {
  yo:     string|void
  recent: Array<string>

  constructor(args:{| yo?:string, recent?:Array<string> |}) {
    this.yo     = args.yo
    this.recent = (args.recent === undefined) ? [] : args.recent
  }

  // 3rd return (bool) means isSpecific (no further words needed)
  lookupAgent(ref:Ref): [Person, Number, bool] {
    if (ref === this.yo) {
      return [1, 1, true]
    } else {
      const isSpecific = (this.recent.length === 1 && this.recent[0] === ref)
      if (this.recent.indexOf(ref) === -1) {
        this.recent.push(ref)
      }
      return [3, numOfRef(ref), isSpecific]
    }
  }

  lookupDirectObj(directObj:Ref, agent:Ref): [Pronoun|void, bool] {
    if (directObj === this.yo) {
      return [new Pronoun('me'), true]
    } else {
      const num = numOfRef(directObj)
      const gen = genOfRef(directObj)

      const possible: Array<Ref> = []
      for (const possibleRef of this.recent) {
        if (possibleRef === agent) {
          // not confusable because we'd use reflexive for that
        } else if (numOfRef(possibleRef) === num && genOfRef(possibleRef) === gen) {
          possible.push(possibleRef)
        }
      }

      const isSpecific = (possible.length === 1 && possible[0] === directObj)
      if (this.recent.indexOf(directObj) === -1) {
        this.recent.push(directObj)
      }

      if (isSpecific) {
        const pronoun:string = {
          _M1: 'lo', _F1: 'la',
        }['_' + gen + num] //|| raise("Can't find pronoun for '" + gen + num + "'")
        return [new Pronoun(pronoun), isSpecific]
      } else {
        return [undefined, false]
      }
    }
  }
}

module.exports = Pronouns
