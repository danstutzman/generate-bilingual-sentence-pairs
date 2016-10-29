// @flow
import type { Number, Person, Tense } from './types'

class IdiosyncraticVerbConjugation {
  infinitive: string
  tense: Tense
  person: Person
  number: Number
  l2: string

  constructor(
    infinitive:string,
    tense:Tense,
    person:Person,
    number:Number,
    l2:string) {
    this.infinitive = infinitive
    this.tense      = tense
    this.person     = person
    this.number     = number
    this.l2         = l2
  }
  tense_person_number() : [Tense, Person, Number] {
    return [this.tense, this.person, this.number]
  }
}

var table = [
  new IdiosyncraticVerbConjugation("ser",     "pres", 1, 1, "soy"),
  new IdiosyncraticVerbConjugation("ser",     "pres", 2, 1, "eres"),
  new IdiosyncraticVerbConjugation("ser",     "pres", 3, 1, "es"),
  new IdiosyncraticVerbConjugation("ser",     "pres", 1, 2, "somos"),
  new IdiosyncraticVerbConjugation("ser",     "pres", 3, 2, "son"),
  new IdiosyncraticVerbConjugation("ser",     "pret", 1, 1, "fui"),
  new IdiosyncraticVerbConjugation("ser",     "pret", 2, 1, "fuiste"),
  new IdiosyncraticVerbConjugation("ser",     "pret", 3, 1, "fue"),
  new IdiosyncraticVerbConjugation("ser",     "pret", 1, 2, "fuimos"),
  new IdiosyncraticVerbConjugation("ser",     "pret", 3, 2, "fueron"),
  new IdiosyncraticVerbConjugation("estar",   "pres", 1, 1, "estoy"),
  new IdiosyncraticVerbConjugation("estar",   "pres", 2, 1, "estás"),
  new IdiosyncraticVerbConjugation("estar",   "pres", 3, 1, "está"),
  new IdiosyncraticVerbConjugation("estar",   "pres", 3, 2, "están"),
  new IdiosyncraticVerbConjugation("tener",   "pres", 1, 1, "tengo"),
  new IdiosyncraticVerbConjugation("hacer",   "pres", 1, 1, "hago"),
  new IdiosyncraticVerbConjugation("decir",   "pres", 1, 1, "digo"),
  new IdiosyncraticVerbConjugation("decir",   "pret", 3, 2, "dijeron"),
  new IdiosyncraticVerbConjugation("ir",      "pres", 1, 1, "voy"),
  new IdiosyncraticVerbConjugation("ir",      "pres", 2, 1, "vas"),
  new IdiosyncraticVerbConjugation("ir",      "pres", 3, 1, "va"),
  new IdiosyncraticVerbConjugation("ir",      "pres", 1, 2, "vamos"),
  new IdiosyncraticVerbConjugation("ir",      "pres", 3, 2, "van"),
  new IdiosyncraticVerbConjugation("ir",      "pret", 1, 1, "fui"),
  new IdiosyncraticVerbConjugation("ir",      "pret", 2, 1, "fuiste"),
  new IdiosyncraticVerbConjugation("ir",      "pret", 3, 1, "fue"),
  new IdiosyncraticVerbConjugation("ir",      "pret", 1, 2, "fuimos"),
  new IdiosyncraticVerbConjugation("ir",      "pret", 3, 2, "fueron"),
  new IdiosyncraticVerbConjugation("ver",     "pres", 1, 1, "veo"),
  new IdiosyncraticVerbConjugation("ver",     "pret", 1, 1, "vi"),
  new IdiosyncraticVerbConjugation("ver",     "pret", 3, 1, "vio"),
  new IdiosyncraticVerbConjugation("ver",     "pret", 1, 2, "vimos"),
  new IdiosyncraticVerbConjugation("dar",     "pres", 1, 1, "doy"),
  new IdiosyncraticVerbConjugation("dar",     "pret", 1, 1, "di"),
  new IdiosyncraticVerbConjugation("dar",     "pret", 2, 1, "diste"),
  new IdiosyncraticVerbConjugation("dar",     "pret", 3, 1, "dio"),
  new IdiosyncraticVerbConjugation("dar",     "pret", 1, 2, "dimos"),
  new IdiosyncraticVerbConjugation("dar",     "pret", 3, 2, "dieron"),
  new IdiosyncraticVerbConjugation("saber",   "pres", 1, 1, "sé"),
  new IdiosyncraticVerbConjugation("poner",   "pres", 1, 1, "pongo"),
  new IdiosyncraticVerbConjugation("venir",   "pres", 1, 1, "vengo"),
  new IdiosyncraticVerbConjugation("salir",   "pres", 1, 1, "salgo"),
  new IdiosyncraticVerbConjugation("parecer", "pres", 1, 1, "parezco"),
  new IdiosyncraticVerbConjugation("conocer", "pres", 1, 1, "conozco"),
  new IdiosyncraticVerbConjugation("empezar", "pret", 1, 1, "empecé"),
  new IdiosyncraticVerbConjugation("enviar",  "pres", 1, 1, "envío"),
  new IdiosyncraticVerbConjugation("enviar",  "pres", 2, 1, "envías"),
  new IdiosyncraticVerbConjugation("enviar",  "pres", 3, 1, "envía"),
  new IdiosyncraticVerbConjugation("enviar",  "pres", 1, 2, "envían"),
]

var tableByL2 : { [l2:string] : IdiosyncraticVerbConjugation|void } = {}
for (var i = 0; i < table.length; i++) {
  var conjugation = table[i]
  tableByL2[conjugation.l2] = conjugation
}
 
var lookupByL2 = function(l2:string) : Array<IdiosyncraticVerbConjugation> {
  var conjugation = tableByL2[l2]
  return (conjugation !== undefined) ? [conjugation] : []
}

module.exports = {
  IdiosyncraticVerbConjugation: IdiosyncraticVerbConjugation,
  lookupByL2: lookupByL2,
}
