// @flow
import type { Skill } from '../../types'
import type { Tense } from '../types'
const { RegularConjugationPattern } = require('./regular_conjugation_pattern_table')

class StemChange {
  tense:      Tense
  infinitive: string
  stem:       string

  constructor(tense:Tense, infinitive:string, stem:string) {
    this.tense = tense
    this.infinitive = infinitive
    this.stem = stem
  }
  skills(): Array<[Skill,string]> {
    return [[`v-stem-${this.tense}-${this.infinitive}`, this.stem]]
  }
}

const table = [
  new StemChange("pres", "poder",     "pued-"),
  new StemChange("pres", "tener",     "tien-"),
  new StemChange("pres", "querer",    "quier-"),
  new StemChange("pres", "seguir",    "sig-"),
  new StemChange("pres", "encontrar", "encuentr-"),
  new StemChange("pres", "venir",     "vien-"),
  new StemChange("pres", "pensar",    "piens-"),
  new StemChange("pres", "volver",    "vuelv-"),
  new StemChange("pres", "sentir",    "sient-"),
  new StemChange("pres", "contar",    "cuent-"),
  new StemChange("pres", "empezar",   "empiez-"),
  new StemChange("pres", "decir",     "dic-"),
  new StemChange("pres", "recordar",  "recuerd-"),
  new StemChange("pres", "pedir",     "pid-"),
  new StemChange("pret", "andar",     "anduv-"),
  new StemChange("pret", "saber",     "sup-"),
  new StemChange("pret", "querer",    "quis-"),
  new StemChange("pret", "poner",     "pus-"),
  new StemChange("pret", "venir",     "vin-"),
  new StemChange("pret", "decir",     "dij-"),
  new StemChange("pret", "tener",     "tuv-"),
  new StemChange("pret", "hacer",     "hic-"),
  new StemChange("pret", "poder",     "pud-"),
]

const tableByInfinitiveTense: {[key:string]:StemChange} = {}
{
  for (const stemChange of table) {
    const key = `${stemChange.infinitive}-${stemChange.tense}`
    if (tableByInfinitiveTense[key] !== undefined) {
      throw new Error(`Found >1 StemChange for ${key}`)
    }
    tableByInfinitiveTense[key] = stemChange
  }
}

function find01(infinitive:string, tense:Tense): Array<StemChange> {
  const key = `${infinitive}-${tense}`
  const found: StemChange = tableByInfinitiveTense[key]
  return (found !== undefined) ? [found] : []
}

class StemChangeConjugation {
  infinitive: string
  stemChange: StemChange
  pattern:    RegularConjugationPattern

  constructor(infinitive:string, stemChange:StemChange,
      pattern:RegularConjugationPattern) {
    this.infinitive = infinitive
    this.stemChange = stemChange
    this.pattern    = pattern
  }

  skills(): Array<[Skill,string]> {
    return [['v-inf-' + this.infinitive, '']]
      .concat(this.stemChange.skills())
      .concat(this.pattern.skills())
  }
}

module.exports = { StemChange, find01, StemChangeConjugation }
