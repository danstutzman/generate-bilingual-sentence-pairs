// @flow
const assert                 = require('assert')
const { setup, suite, test } = require('mocha')
const { parseLine }          = require('../src/generate6/uni/parse_line')
const { interpretSexp }      = require('../src/generate6/uni/interpret_sexp')
const { IClause }            = require('../src/generate6/uni/iclause')
const es                     = require('../src/generate6/es')

suite('generate6', function() {
  suite('parse_line', function() {
    test('a(b,,c())', function() {
      assert.deepEqual(parseLine('a(b,,c())'), ['a', 'b', '', ['c']])
    })
  })
  suite('interpret_sexp', function() {
    test('A want B', function() {
      const sexp = ['want', 'A', 'B']
      assert.deepEqual(interpretSexp(sexp),
        new IClause({agent:'A', verb:'want', direct:'B'}))
    })
  })
  suite('translate_to_es', function() {
    test('A need B', function() {
      const from = new IClause({agent:'A', verb:'need', direct:'B'})
      assert.deepEqual(es.translate(from, 'pres'), new es.IClauseOrder({
        agent: new es.NameNoun('A'),
        conjugation: new es.RegularConjugation({
          infinitive: 'necesitar',
          pattern: new es.RegularConjugationPattern('-ar verbs', 'pres', 3, 1, '-a'),
        }),
        direct: new es.NameNoun('B'),
      }))
    })
  })
  suite('words', function() {
    test('A need B', function() {
      const iclause = new es.IClauseOrder({
        agent: new es.NameNoun('A'),
        conjugation: new es.RegularConjugation({
          infinitive: 'necesitar',
          pattern: new es.RegularConjugationPattern('-ar verbs', 'pres', 3, 1, '-a'),
        }),
        direct: new es.NameNoun('B'),
      })
      assert.deepEqual(iclause.words(), ['A', 'necesit-', '-a', 'B'])
    })
  })
})
