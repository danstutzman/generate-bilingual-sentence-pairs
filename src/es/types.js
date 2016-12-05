// @flow
import type { Ref } from '../types'

const { raise } = require('../raise')

export type KindOfVerb = "ar" | "er" | "ir" | "erir" | "stempret"

export type Tense = "pres" | "pret"

export type Person = 1 | 2 | 3

export type Number = 1 | 2

export type Gender = "M" | "F"

function isInfinitiveKindOfVerb(infinitive:string, kindOfVerb:KindOfVerb,
    isStemChangePret:bool): bool {
  if (isStemChangePret) {
    return kindOfVerb === 'stempret'
  } else {
    switch (kindOfVerb) {
      case 'ar': return infinitive.endsWith('ar')
      case 'er': return infinitive.endsWith('er')
      case 'ir': return infinitive.endsWith('ir')
      case 'erir': return infinitive.endsWith('er') || infinitive.endsWith('ir')
      case 'stempret': return false
      default: throw new Error("Unknown kindOfVerb " + kindOfVerb)
    }
  }
}

export type EsIdentity = [Gender, Number, Array<Ref>]

module.exports = { isInfinitiveKindOfVerb }
