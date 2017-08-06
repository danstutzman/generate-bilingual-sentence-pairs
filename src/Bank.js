// @flow
import type { Skill } from './types'

const fs       = require('fs')
const { Card } = require('./practice')

class Estimate {
  stuckSkills: Array<Skill>

  constructor(stuckSkills: Array<Skill>) {
    this.stuckSkills = stuckSkills
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
  estimate(card:Card): Estimate {
    let stuckSkills: Array<Skill> = []
    for (const [skill, _] of card.skills) {
      if (skill.startsWith('nclause-') ||
          skill.startsWith('iclause-orderof-') ||
          skill.startsWith('pro-')) {
        // assume it's known
      } else if (skill !== '' && this.skillToGoodness[skill] !== true) {
        stuckSkills.push(skill)
      }
    }
    return new Estimate(stuckSkills)
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
