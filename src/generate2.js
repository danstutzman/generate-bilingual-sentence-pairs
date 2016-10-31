// @flow

//Maria asks me where I'm from. I answer Maria that I'm from Texas.

type Story = ['Story', Array<VP>]
type AskSbSth = ['askSbSth', string, string, WhereQuestion]
type BeFrom = ['beFrom', string, string]
type VP = AskSbSth | BeFrom
type WhereQuestion = ['whereQuestion', VP]
type Sexp = string | Array<Sexp>

function askSbSth(a:string, b:string, where:WhereQuestion): AskSbSth {
  return ['askSbSth', a, b, where]
}
function whereQuestion(vp:VP): WhereQuestion {
  return ['whereQuestion', vp]
}
function beFrom(a:string, b:string):BeFrom {
  return ['beFrom', a, b]
}


function flatten(sexp:Sexp): Array<string> {
  if (typeof sexp === 'string') {
    return [sexp]
  } else {
    let output = []
    output = [sexp[0].toString() + '(']
    for (let i = 1; i < sexp.length; i++) {
      if (i > 1) {
        output.push(',')
      }
      output = output.concat(flatten(sexp[i]))
    }
    output.push(')')
    return output
  }
}

type Agent = {|
  per: 1|2|3,
  num: 1|2,
  name: string,
  reflexiveName: string
|}

function conjugateNoun(noun:Agent, accusative:bool, reflexive:bool): Array<string> {
  if (reflexive) {
    return [noun.reflexiveName]
  } else {
    switch (noun.name) {
      case 'Me': return (accusative ? ['me'] : ['I'])
      case 'Maria': return [noun.name]
      default:
        throw new Error("Don't know how to conjugateNoun '" +
          JSON.stringify(noun) + "'")
    }
  }
}

function conjugateVerb(verb:string, per:1|2|3, num:1|2): Array<string> {
  switch (verb) {
    case 'ask':
      return (num === 2 || per === 1) ? ['ask'] : ['asks']
    default:
      throw new Error("Don't know how to conjugateVerb '" + verb + "'")
  }
}

const LOOKUP_AGENT: {[name: string]: Agent} = {
  'Me':    {per: 1, num: 1, name: 'Me', reflexiveName: 'myself'},
  'Maria': {per: 3, num: 1, name: 'Maria', reflexiveName: 'herself'},
}

function conjugateVP(sexp:Sexp): Array<string> {
  switch (sexp[0]) {
    case 'askSbSth':
      const agent = LOOKUP_AGENT[sexp[1].toString()]
      const object = LOOKUP_AGENT[sexp[2].toString()]
      const isReflexive = (sexp[1] === sexp[2])
      return conjugateNoun(agent, false, false)
        .concat(conjugateVerb('ask', agent.per, agent.num))
        .concat(conjugateNoun(agent, true, isReflexive))
    default:
      throw new Error("Don't know how to conjugate '" + sexp[0].toString() + "'")
  }
}

const stories = [
  askSbSth('Maria', 'Me',    whereQuestion(beFrom('Me', 'Where'))),
  askSbSth('Me',    'Maria', whereQuestion(beFrom('Me', 'Where'))),
  askSbSth('Me',    'Me',    whereQuestion(beFrom('Me', 'Where'))),
  askSbSth('Maria', 'Maria', whereQuestion(beFrom('Me', 'Where'))),
]
for (const story of stories) {
  console.log(flatten(story).join(''))
  console.log(conjugateVP(story))
}
