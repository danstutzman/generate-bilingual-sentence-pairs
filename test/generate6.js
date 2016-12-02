// @flow
const assert                 = require('assert')
const { setup, suite, test } = require('mocha')
const { parseLine }          = require('../src/generate6/uni/parse_line')
const { IClause }            = require('../src/generate6/uni/iclause')
const { interpretIClause }   = require('../src/generate6/uni/interpret_sexp')
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
      assert.deepEqual(interpretIClause(sexp),
        new IClause({agent:'A', verb:'want', direct:'B'}))
    })
  })
  suite('translate_to_es', function() {
    test('A need B', function() {
      const from = new IClause({agent:'A', verb:'need', direct:'B'})
      const translated = es.translate(from, 'pres', new es.Pronouns({}),
        {'A':'yo/él', 'B':'yo/él'})
      assert.deepEqual(translated, new es.IClauseOrder({
        agent: new es.NameNoun('A').setOmit(false),
        conjugation: new es.RegularConjugation({
          infinitive: 'necesitar',
          pattern: new es.RegularConjugationPattern('-ar verbs', 'pres', 3, 1, '-a'),
        }),
        direct: new es.NameNoun('B').setOmit(false),
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
  suite('integration', function() {
    const refToPreferredPronouns = {
      A:'yo/él', AA:'nosotros/ellos', B:'yo/él', Libro:'yo/él', Libros:'nosotros/ellos',
      Pluma:'yo/ella',
    }
    for (const [sexp, expected, pronounsInit] of [
      ['need(A,B)', 'A necesita B', {}],
      ['need(A,B)', 'Necesita B', {recent:['A']}],
      ['need(A,B)', 'Necesito B', {yo:'A'}],
      ['need(AA,B)', 'AA necesitan B', {}],
      ['need(A,Libro)', 'A necesita Libro', {}],
      ['need(A,Libro)', 'A lo necesita', {recent:['Libro']}],
      ['need(A,Pluma)', 'A la necesita', {recent:['Pluma']}],
      ['need(A,Libros)', 'A los necesita', {recent:['Libros']}],
      ['what(need(A,What))', '¿Qué necesito?', {yo:'A'}],
      ['give(A,B,Libros)', 'A da Libros a B', {}],
      ['give(A,B,Libros)', 'A me da Libros', {yo:'B'}],
      ['give(A,B,Libros)', 'A le da Libros', {recent:['B']}],
      ['tell(A,B,that(need(A,B)))', 'A dice a B que A necesita B', {}],
    ]) {
      test(expected, /* jshint loopfunc:true */ function() {
        const iclause = interpretIClause(parseLine(sexp))
        const pronouns = new es.Pronouns(pronounsInit)
        const translated = es.translate(iclause, 'pres', pronouns, refToPreferredPronouns)
        const joined = es.join(translated.words())
        assert.equal(joined, expected)
      })
    }
  })
})
