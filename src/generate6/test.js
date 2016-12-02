// @flow
const { parseLine }          = require('./uni/parse_line')
const { IClause }            = require('./uni/iclause')
const { interpretIClause }   = require('./uni/interpret_sexp')
const es                     = require('./es')

const refToPreferredPronouns = {
  'A':'yo/él', 'AA':'nosotros/ellos', 'B':'yo/él', 'Libro':'yo/él',
  'Libros':'nosotros/ellos', 'Pluma':'yo/ella',
}

const sexp = 'need(A,B)'
const pronounsInit = {}
const iclause = interpretIClause(parseLine(sexp))
const pronouns = new es.Pronouns(pronounsInit)
const translated = es.translate(iclause, 'pres', pronouns, refToPreferredPronouns)
const joined = es.join(translated.words())
console.log(joined)
