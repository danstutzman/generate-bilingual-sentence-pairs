// @flow
const fs                     = require('fs')
const readline               = require('readline')
const { parseLine }          = require('./uni/parse_line')
const { interpretIClause }   = require('./uni/interpret_sexp')
const EsPronouns             = require('./es/EsPronouns')
const Translator             = require('./es/Translator')
const { join }               = require('./join')

const refToPreferredPronouns = {
  'A':'yo/él', 'AA':'nosotros/ellos', 'B':'yo/él', 'Libro':'yo/él',
  'Libros':'nosotros/ellos', 'Pluma':'yo/ella', 'What':'yo/él', 'C':'yo/él',
  'BB':'nosotros/ellos',
}

readline.createInterface({
  input: fs.createReadStream('curriculum_ideas/GAME2'),
}).on('line', function(line) {
  if (line !== '' && line.charAt(0) !== '#') {
    const pronounsInit = {}
    const iclause = interpretIClause(parseLine(line))
    const pronouns = new EsPronouns(pronounsInit)
    const translated = new Translator('pres', pronouns, refToPreferredPronouns)
      .translateIClause(iclause)
    const joined = join(translated.words())
    console.log(joined)
  }
})
