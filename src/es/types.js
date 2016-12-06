// @flow
import type { Ref } from '../types'

const { raise } = require('../raise')

export type KindOfVerb = "ar" | "er" | "ir" | "erir" | "stempret"

export type Tense = "pres" | "pret"
function toTense(s:string): Tense {
  return { 'pres':'pres', 'pret':'pret' }[s]
}

export type Person = 1 | 2 | 3
function toPerson(s:string): Person {
  return { '1':1, '2':2, '3':3 }[s]
}

export type Number = 1 | 2
function toNumber(s:string): Number {
  return { '1':1, '2':2 }[s]
}

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

module.exports = { isInfinitiveKindOfVerb, toTense, toPerson, toNumber }
