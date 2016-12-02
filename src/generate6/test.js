// @flow
const { parseLine }          = require('./uni/parse_line')
const { interpretIClause }   = require('./uni/interpret_sexp')
const EsPronouns             = require('./es/EsPronouns')
const Translator             = require('./es/Translator')
const { join }               = require('./join')

const refToPreferredPronouns = {
  'A':'yo/él', 'AA':'nosotros/ellos', 'B':'yo/él', 'Libro':'yo/él',
  'Libros':'nosotros/ellos', 'Pluma':'yo/ella',
}

const sexp = 'need(A,B)'
const pronounsInit = {}
const iclause = interpretIClause(parseLine(sexp))
const pronouns = new EsPronouns(pronounsInit)
const translated = new Translator('pres', pronouns, refToPreferredPronouns)
  .translateIClause(iclause)
const joined = join(translated.words())
console.log(joined)
