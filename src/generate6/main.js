// @flow
const fs                     = require('fs')
const readline               = require('readline')
const { parseLine }          = require('./uni/parse_line')
const EnPronouns             = require('./en/EnPronouns')
const EsPronouns             = require('./es/EsPronouns')
const EnTranslator           = require('./en/Translator')
const EsTranslator           = require('./es/Translator')
const { join }               = require('./join')
const { interpretIClause, interpretSpeechAct } =
  require('./uni/interpret_sexp')

const esRefToPreferredPronouns = {
  'A':'yo/él', 'AA':'nosotros/ellos', 'B':'yo/él', 'Libro':'yo/él',
  'Libros':'nosotros/ellos', 'Pluma':'yo/ella', 'What':'yo/él', 'C':'yo/él',
  'BB':'nosotros/ellos',
}
const enRefToPreferredPronouns = {
  'A':'I/he', 'B':'I/he', 'C':'I/it', 'BB':'we/they',
}

readline.createInterface({
  input: fs.createReadStream('curriculum_ideas/GAME2'),
}).on('line', function(line) {
  if (line !== '' && line.charAt(0) !== '#') {
    const speechAct = interpretSpeechAct(parseLine(line))

    const esPronouns = new EsPronouns({})
    const esTranslated = new EsTranslator('pres', esPronouns, esRefToPreferredPronouns)
      .translateSpeechAct(speechAct)
    const esJoined = join(esTranslated.words())
    console.log(esJoined)

    const enPronouns = new EnPronouns({})
    const enTranslated = new EnTranslator('pres', enPronouns, enRefToPreferredPronouns)
      .translateSpeechAct(speechAct)
    const enJoined = join(enTranslated.words())
    console.log(enJoined)
  }
})
