// @flow
import type { Tense } from './types'

class StemChange {
  tense:      Tense
  infinitive: string
  stem:       string

  constructor(tense:Tense, infinitive:string, stem:string) {
    this.tense = tense
    this.infinitive = infinitive
    this.stem = stem
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

const lookupByL2Prefix = function(l2:string) : Array<StemChange> {
  const stemChanges = []
  for (const stemChange of table) {
    const stemWithoutHyphen = stemChange.stem.substring(0, stemChange.stem.length - 1)
    if (l2.startsWith(stemWithoutHyphen)) {
      stemChanges.push(stemChange)
    }
  }
  return stemChanges
}

module.exports = {
  lookupByL2Prefix: lookupByL2Prefix,
  StemChange: StemChange,
}
