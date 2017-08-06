// @flow
import type { Skill } from './types'

const fs       = require('fs')
const { Card } = require('./practice')

class Estimate {
  stuckSkill: Skill | void

  constructor(stuckSkill: Skill|void) {
    this.stuckSkill = stuckSkill
  }
}

class Bank {
  bankJsonPath: string
  skillToGoodness: {[skill:Skill]: bool}

  constructor(bankJsonPath:string) {
    this.bankJsonPath    = bankJsonPath
    if (!fs.existsSync(bankJsonPath)) {
      fs.writeFileSync(bankJsonPath, '{}')
    }
    this.skillToGoodness = JSON.parse(fs.readFileSync(bankJsonPath).toString())
  }
  estimate(card:Card) {
    let stuckSkill: Skill | void
    for (const [skill, _] of card.skills) {
      if (skill.startsWith('nclause-') ||
          skill.startsWith('iclause-orderof-') ||
          skill.startsWith('pro-')) {
        // assume it's known
      } else if (skill !== '' && this.skillToGoodness[skill] !== true) {
        stuckSkill = skill
        break
      }
    }
    return new Estimate(stuckSkill)
  }
  update(newSkillToGoodness: {[skill:Skill]: bool}) {
    for (const skill in newSkillToGoodness) {
      if (newSkillToGoodness.hasOwnProperty(skill)) {
        this.skillToGoodness[skill] = newSkillToGoodness[skill]
      }
    }
    fs.writeFileSync(this.bankJsonPath, JSON.stringify(this.skillToGoodness, null, 2))
  }
}

module.exports = Bank
