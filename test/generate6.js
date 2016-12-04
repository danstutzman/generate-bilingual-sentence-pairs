// @flow
const assert                 = require('assert')
const { setup, suite, test } = require('mocha')
const { parseLine }          = require('../src/generate6/uni/parse_line')
const { UniIClause }         = require('../src/generate6/uni/uni_iclause')
const { UniNClause }         = require('../src/generate6/uni/noun_phrases')
const { UniSpeechAct }       = require('../src/generate6/uni/uni_speech_act')
const EsPronouns             = require('../src/generate6/es/EsPronouns')
const EnPronouns             = require('../src/generate6/en/EnPronouns')
const EsTranslator           = require('../src/generate6/es/Translator')
const EnTranslator           = require('../src/generate6/en/Translator')
const { join }               = require('../src/generate6/join')
const EsIClause              = require('../src/generate6/es/EsIClause')
const { NameNoun }           = require('../src/generate6/es/noun_phrases')
const RegularConjugation     = require('../src/generate6/es/verbs/RegularConjugation.js')
const { RegularConjugationPattern } =
  require('../src/generate6/es/verbs/regular_conjugation_pattern_table')
const { interpretIClause, interpretSpeechAct, interpretNP } =
  require('../src/generate6/uni/interpret_sexp')

function lineToUniSpeechAct(line:string): UniSpeechAct {
  if (line.startsWith('what(')) {
    return new UniSpeechAct('ask', undefined, undefined,
      interpretNP(parseLine(line), true))
  } else {
    return new UniSpeechAct('tell', undefined, undefined,
      new UniNClause('that', interpretIClause(parseLine(line)), true))
  }
}

suite('generate6', function() {
  suite('parse_line', function() {
    test('a(b,,c())', function() {
      assert.deepEqual(parseLine('a(b,,c())'), ['a', 'b', '', ['c']])
    })
  })
  suite('interpret_sexp', function() {
    test('A want B', function() {
      const sexp = ['want', 'A', 'B']
      assert.deepEqual(interpretIClause(sexp),
        new UniIClause({agent:'A', verb:'want', direct:'B'}))
    })
  })
  suite('translate_to_es', function() {
    test('A need B', function() {
      const from = new UniIClause({agent:'A', verb:'need', direct:'B'})
      const translated = new EsTranslator('pres', new EsPronouns({}),
        {'A':['M',1,[]], 'B':['M',1,[]]}).translateIClause(from)
      assert.deepEqual(translated, new EsIClause({
        agent: new NameNoun('A').setOmit(false),
        conjugation: new RegularConjugation({
          infinitive: 'necesitar',
          pattern: new RegularConjugationPattern('-ar verbs', 'pres', 3, 1, '-a'),
        }),
        direct: new NameNoun('B').setOmit(false),
      }))
    })
  })
  suite('words', function() {
    test('A need B', function() {
      const iclause = new EsIClause({
        agent: new NameNoun('A'),
        conjugation: new RegularConjugation({
          infinitive: 'necesitar',
          pattern: new RegularConjugationPattern('-ar verbs', 'pres', 3, 1, '-a'),
        }),
        direct: new NameNoun('B'),
      })
      assert.deepEqual(iclause.words(), ['A', 'necesit-', '-a', 'B'])
    })
  })
  suite('integration-spanish', function() {
    const refToPreferredPronouns = {
      'A':['M',1,[]], 'AA':['M',2,['A']], 'B':['M',1,[]], 'BB':['M',2,['B']],
      'Libro':['M',1,[]], 'Libros':['M',2,[]], 'Pluma':['F',1,[]],
    }
    for (const [sexp, expected, pronounsInit] of [
      ['need(A,B)', 'A necesita B.', {}],
      ['need(A,B)', 'Necesita B.', {recent:['A']}],
      ['need(A,B)', 'Necesito B.', {yo:'A'}],
      ['need(AA,B)', 'AA necesitan B.', {}],
      ['need(A,Libro)', 'A necesita Libro.', {}],
      ['need(A,Libro)', 'A lo necesita.', {recent:['Libro']}],
      ['need(A,Pluma)', 'A la necesita.', {recent:['Pluma']}],
      ['need(A,Libros)', 'A los necesita.', {recent:['Libros']}],
      ['what(need(A,What))', '¿Qué necesito?', {yo:'A'}],
      ['give(A,B,Libros)', 'A da Libros a B.', {}],
      ['give(A,B,Libros)', 'A me da Libros.', {yo:'B'}],
      ['give(A,B,Libros)', 'A le da Libros.', {recent:['B']}],
      ['tell(A,B,that(need(A,B)))', 'A dice a B que A lo necesita.', {}],
    ]) {
      test(expected, /* jshint loopfunc:true */ function() {
        const translated = new EsTranslator('pres', new EsPronouns(pronounsInit),
          refToPreferredPronouns).translateSpeechAct(lineToUniSpeechAct(sexp))
        const joined = join(translated.words())
        assert.equal(joined, expected)
      })
    }
  })
  suite('integration-english', function() {
    const refToPreferredPronouns = { 'A':['M',1,[]], 'B':['M',1,[]], 'C':['N',1,[]] }
    for (const [sexp, expected, pronounsInit] of [
      ['need(A,B)', 'A needs B.', {}],
      ['what(need(A,What))', 'What does A need?', {}],
      ['give(A,B,C)', 'A gives B C.', {}],
    ]) {
      test(expected, /* jshint loopfunc:true */ function() {
        const translated = new EnTranslator('pres', new EnPronouns(pronounsInit),
          refToPreferredPronouns).translateSpeechAct(lineToUniSpeechAct(sexp))
        const joined = join(translated.words())
        assert.equal(joined, expected)
      })
    }
  })
})
