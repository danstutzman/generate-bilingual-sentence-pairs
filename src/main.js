// @flow
import type { Ref, Skill } from './types'
import type { EnIdentity } from './en/types'
import type { EsIdentity } from './es/types'

const fs           = require('fs')
const yaml         = require('js-yaml')

const { parseLine }          = require('./uni/parse_line')
const EnPronouns             = require('./en/EnPronouns')
const EsPronouns             = require('./es/EsPronouns')
const EnTranslator           = require('./en/Translator')
const EsTranslator           = require('./es/Translator')
const { join, joinSkills }   = require('./join')
const { UniSpeechAct }       = require('./uni/uni_speech_act')
const { interpretSpeechAct } = require('./uni/interpret_sexp')
const { raise }              = require('./raise')
const { Card, makeCardForSkill } = require('./practice')
const Bank                   = require('./Bank')

const esRefToIdentity: {[ref:Ref]:EsIdentity} = {
  'A':['M',1,[]], 'AA':['M',2,['A']], 'B':['M',1,[]], 'BB':['M',2,['B']],
  'C':['M',1,[]], 'Libro':['M',1,[]], 'Libros':['M',2,[]],
  'Pluma':['F',1,[]], 'What':['M',1,[]],
}
const enRefToIdentity: {[ref:Ref]:EnIdentity} = {
  'A':['M',1,[]], 'B':['M',1,[]], 'C':['N',1,[]], 'BB':['N',2,['B']],
}

const nestedSexps = yaml.safeLoad(fs.readFileSync('curriculum_ideas/GAME2', 'utf8'))
const sexpToCard: Map<string,Card> = new Map()
function flattenNestedSexps(sexpOrSexps) {
  if (Array.isArray(sexpOrSexps)) {
    for (const sexp of sexpOrSexps) {
      flattenNestedSexps(sexp)
    }
  } else if (typeof sexpOrSexps === 'string') {
    const speechAct: UniSpeechAct = interpretSpeechAct(parseLine(sexpOrSexps))
    const enPronouns = new EnPronouns({ me:speechAct.speaker, you:speechAct.audience })
    const enTranslated = new EnTranslator('past', enPronouns, enRefToIdentity)
      .translateSpeechAct(speechAct)
    const esPronouns = new EsPronouns({ yo:speechAct.speaker, tu:speechAct.audience })
    const esTranslator = new EsTranslator('pret', esPronouns, esRefToIdentity)
    const esTranslated = esTranslator.translateSpeechAct(speechAct)
    sexpToCard.set(sexpOrSexps, new Card(
      'Translate the following sentence into Spanish:',
      esTranslated.skills(), join(enTranslated.words())))
  } else {
    throw new Error(`Unexpected sexpOrSexps '${JSON.stringify(sexpOrSexps)}'`)
  }
}
flattenNestedSexps(nestedSexps)

const bank = new Bank('bank.json')
const translatableSentenceCards: Array<Card> = []
const skillToRemedialCard: Map<string, Card> = new Map()
for (const card of sexpToCard.values()) {
  const estimate = bank.estimate(card)
  if (estimate.stuckSkills.length === 0) {
    translatableSentenceCards.push(card)
  } else {
    for (const stuckSkill of estimate.stuckSkills) {
      skillToRemedialCard.set(stuckSkill, makeCardForSkill(stuckSkill))
    }
  }
}

console.log('Translatable sentence cards:')
for (var card of translatableSentenceCards) {
  console.log(`- ${card.enJoined}`)
}

console.log('Remedial cards:')
for (var pair of skillToRemedialCard) {
  const [skill, card] = pair
  console.log(`- ${card.enJoined} (${skill})`)
}

for (var card of translatableSentenceCards) {
  const newSkillToGoodness = card.questionEsGivenEn()
  bank.update(newSkillToGoodness)
  break
}
