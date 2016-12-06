// @flow
import type { Skill } from '../../types'
import type { Number, Person, Tense } from '../types'

class UniqueConjugation {
  infinitive: string
  tense:      Tense
  person:     Person
  number:     Number
  word:       string

  constructor(
    infinitive: string,
    tense:      Tense,
    person:     Person,
    number:     Number,
    word:       string
  ) {
    this.infinitive = infinitive
    this.tense      = tense
    this.person     = person
    this.number     = number
    this.word       = word
  }

  words(): Array<string> {
    return [this.word]
  }
  skills(): Array<[Skill,string]> {
    return [
      [`v-inf-${this.infinitive}`, ''],
      [`v-uniq-${this.infinitive}-${this.tense}${this.person}${this.number}`,
        this.word]
    ]
  }
}

const table = [
  new UniqueConjugation("ser",     "pres", 1, 1, "soy"),
  new UniqueConjugation("ser",     "pres", 2, 1, "eres"),
  new UniqueConjugation("ser",     "pres", 3, 1, "es"),
  new UniqueConjugation("ser",     "pres", 1, 2, "somos"),
  new UniqueConjugation("ser",     "pres", 3, 2, "son"),
  new UniqueConjugation("ser",     "pret", 1, 1, "fui"),
  new UniqueConjugation("ser",     "pret", 2, 1, "fuiste"),
  new UniqueConjugation("ser",     "pret", 3, 1, "fue"),
  new UniqueConjugation("ser",     "pret", 1, 2, "fuimos"),
  new UniqueConjugation("ser",     "pret", 3, 2, "fueron"),
  new UniqueConjugation("estar",   "pres", 1, 1, "estoy"),
  new UniqueConjugation("estar",   "pres", 2, 1, "estás"),
  new UniqueConjugation("estar",   "pres", 3, 1, "está"),
  new UniqueConjugation("estar",   "pres", 3, 2, "están"),
  new UniqueConjugation("tener",   "pres", 1, 1, "tengo"),
  new UniqueConjugation("hacer",   "pres", 1, 1, "hago"),
  new UniqueConjugation("decir",   "pres", 1, 1, "digo"),
  new UniqueConjugation("decir",   "pret", 3, 2, "dijeron"),
  new UniqueConjugation("ir",      "pres", 1, 1, "voy"),
  new UniqueConjugation("ir",      "pres", 2, 1, "vas"),
  new UniqueConjugation("ir",      "pres", 3, 1, "va"),
  new UniqueConjugation("ir",      "pres", 1, 2, "vamos"),
  new UniqueConjugation("ir",      "pres", 3, 2, "van"),
  new UniqueConjugation("ir",      "pret", 1, 1, "fui"),
  new UniqueConjugation("ir",      "pret", 2, 1, "fuiste"),
  new UniqueConjugation("ir",      "pret", 3, 1, "fue"),
  new UniqueConjugation("ir",      "pret", 1, 2, "fuimos"),
  new UniqueConjugation("ir",      "pret", 3, 2, "fueron"),
  new UniqueConjugation("ver",     "pres", 1, 1, "veo"),
  new UniqueConjugation("ver",     "pret", 1, 1, "vi"),
  new UniqueConjugation("ver",     "pret", 3, 1, "vio"),
  new UniqueConjugation("ver",     "pret", 1, 2, "vimos"),
  new UniqueConjugation("dar",     "pres", 1, 1, "doy"),
  new UniqueConjugation("dar",     "pret", 1, 1, "di"),
  new UniqueConjugation("dar",     "pret", 2, 1, "diste"),
  new UniqueConjugation("dar",     "pret", 3, 1, "dio"),
  new UniqueConjugation("dar",     "pret", 1, 2, "dimos"),
  new UniqueConjugation("dar",     "pret", 3, 2, "dieron"),
  new UniqueConjugation("saber",   "pres", 1, 1, "sé"),
  new UniqueConjugation("poner",   "pres", 1, 1, "pongo"),
  new UniqueConjugation("venir",   "pres", 1, 1, "vengo"),
  new UniqueConjugation("salir",   "pres", 1, 1, "salgo"),
  new UniqueConjugation("parecer", "pres", 1, 1, "parezco"),
  new UniqueConjugation("conocer", "pres", 1, 1, "conozco"),
  new UniqueConjugation("empezar", "pret", 1, 1, "empecé"),
  new UniqueConjugation("enviar",  "pres", 1, 1, "envío"),
  new UniqueConjugation("enviar",  "pres", 2, 1, "envías"),
  new UniqueConjugation("enviar",  "pres", 3, 1, "envía"),
  new UniqueConjugation("enviar",  "pres", 1, 2, "envían"),
]

const tableByInfinitiveTensePersonNumber: {[key:string]:UniqueConjugation} = {}
{
  for (const conj of table) {
    const key = `${conj.infinitive}-${conj.tense}${conj.person}${conj.number}`
    if (tableByInfinitiveTensePersonNumber[key] !== undefined) {
      throw new Error(`Found >1 UniqueConjugation for ${key}`)
    }
    tableByInfinitiveTensePersonNumber[key] = conj
  }
}

function find01(infinitive:string, tense:Tense, person:Person, number:Number):
    Array<UniqueConjugation> {
  const key = `${infinitive}-${tense}${person}${number}`
  const found: UniqueConjugation|void = tableByInfinitiveTensePersonNumber[key]
  return (found !== undefined) ? [found] : []
}

module.exports = { UniqueConjugation, find01 }
