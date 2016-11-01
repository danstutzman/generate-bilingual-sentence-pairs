// @flow
const assert = require('assert')
const { setup, suite, test } = require('mocha')

const { EnObject, EnPronouns, EsObject, EsPronouns, UniVP3 } =
  require('../src/generate4/uni')

suite('generate4', function() {
  suite('english', function() {
    setup(function() {
      const Maria  = new EnObject(['Maria'], 'I/she')
      const Dan    = new EnObject(['Dan'], 'I/he')
      const Robot  = new EnObject(['the', 'robot'], 'I/it')
      const Robots = new EnObject(['the', 'robots'], 'we/they')
      this.objects = { Maria, Dan, Robot, Robots }
    })
    test('I give myself the robot', function() {
      const vp = new UniVP3('Dan', 'give', 'Dan', 'Robot').toEn(this.objects)
      const words = vp.toWords(new EnPronouns({ me: this.objects.Dan }))
      assert.deepEqual(words.join(' '), 'I give myself the robot')
    })
  })
  suite('spanish', function() {
    const Dan      = new EsObject(['Dan'], 'yo/él', true)
    const Friend   = new EsObject(['un', 'amigo'], 'yo/él', true)
    const Friends  = new EsObject(['amigos'], 'nosotros/ellos', true)
    const Gifts    = new EsObject(['regalos'], 'nosotros/ellos', false)
    const Libro    = new EsObject(['el', 'libro'], 'yo/él', false)
    const Libros   = new EsObject(['los', 'libros'], 'nosotros/ellos', false)
    const Maria    = new EsObject(['María'], 'yo/ella', true)
    const Pluma    = new EsObject(['la', 'pluma'], 'yo/ella', false)
    const Revistas = new EsObject(['las', 'revistas'], 'yo/ella', false)
    const Robot    = new EsObject(['el', 'robot'], 'yo/él', false)
    const Robots   = new EsObject(['los', 'robots'], 'nosotros/ellos', false)
    const Sopa     = new EsObject(['la', 'sopa'], 'yo/ella', false)
    const objects = { Dan, Friend, Friends, Gifts, Libro, Libros, Maria, Pluma,
      Revistas, Robot, Robots, Sopa }

    for (const [agent, verb, indirectObj, directObj, pronounsInit, expected] of [
      ['Dan', 'have', null, 'Pluma', {}, 'Dan tiene la pluma'],
      ['Dan', 'have', null, 'Pluma', { la: Pluma }, 'Dan la tiene'],
      ['Dan', 'have', null, 'Libro', { lo: Libro }, 'Dan lo tiene'],
      ['Dan', 'have', null, 'Libros', { los: Libros }, 'Dan los tiene'],
      ['Dan', 'eat', null, 'Sopa', { _11: Dan, la: Sopa }, 'la como'],
//    ['Friend', 'give', 'Dan', 'Gifts', { _31: Friend}, 'da a Dan regalos'],
      ['Dan', 'have', null, 'Revistas', { _31:Dan, las:Revistas }, 'las tiene'],
      ['Dan', 'know_person', null, 'Maria', { _11:Dan, _21:Maria }, 'te conozco'],
      ['Maria', 'love', null, 'Dan', { ella:Maria, lo:Dan }, 'ella lo ama'],
      ['Maria', 'love', null, 'Dan', { _11:Dan, ella:Maria }, 'ella me ama'],
      ['Dan', 'see', null, 'Maria', { la:Maria }, 'Dan la ve'],
      ['Robots', 'call', null, 'Libros', { ellos:Robots, _12:Libros },
        'ellos nos llaman'],
      ['Robots', 'call', null, 'Libros', { _12:Robots, los:Libros },
        'los llamamos'],
    ]) {
      test(expected, /* jshint loopfunc:true */ function() {
        const vp = new UniVP3(agent, verb, indirectObj, directObj).toEs(objects)
        const pronouns = new EsPronouns(pronounsInit)
        assert.deepEqual(vp.toWords(pronouns).join(' '), expected)
      })
    }
  })
})
