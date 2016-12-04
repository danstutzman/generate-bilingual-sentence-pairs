// @flow
import type { Ref } from '../types'

const { raise } = require('../raise')

export type Tense = "pres" | "past"

export type Person = 1 | 2 | 3

export type Number = 1 | 2

export type Gender = "M" | "F" | "N"

// 3rd element is members: what refs are a part of this ref
// (e.g. BB has members [B] so B can refer to BB "we")
export type EnIdentity = [Gender, Number, Array<Ref>]
