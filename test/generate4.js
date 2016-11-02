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
    const Libro    = new EsObject(['el', 'libro'], 'yo/él', false)
    const Libros   = new EsObject(['los', 'libros'], 'nosotros/ellos', false)
    const Maria    = new EsObject(['María'], 'yo/ella', true)
    const Pluma    = new EsObject(['la', 'pluma'], 'yo/ella', false)
    const Regalo   = new EsObject(['un', 'regalo'], 'yo/él', false)
    const Revistas = new EsObject(['las', 'revistas'], 'nosotras/ellas', false)
    const Robot    = new EsObject(['el', 'robot'], 'yo/él', false)
    const Robots   = new EsObject(['los', 'robots'], 'nosotros/ellos', false)
    const Sopa     = new EsObject(['la', 'sopa'], 'yo/ella', false)
    const objects = { Dan, Friend, Friends, Libro, Libros, Maria, Pluma,
      Regalo, Revistas, Robot, Robots, Sopa }

    for (const [agent, verb, indirectObj, directObj, pronounsInit, pronounsInit2,
        expected] of [
      ['Dan', 'have', null, 'Pluma', {}, [], 'Dan tiene la pluma'],
      ['Dan', 'have', null, 'Pluma', {}, [Pluma], 'Dan la tiene'],
      ['Dan', 'have', null, 'Libro', {}, [Libro], 'Dan lo tiene'],
      ['Dan', 'have', null, 'Libros', {}, [Libros], 'Dan los tiene'],
      ['Dan', 'eat', null, 'Sopa', { _11: Dan }, [Sopa], 'la como'],
      ['Dan', 'have', null, 'Revistas', {}, [Dan, Revistas], 'las tiene'],
      ['Dan', 'know_person', null, 'Maria', { _11:Dan, _21:Maria }, [], 'te conozco'],
      ['Maria', 'love', null, 'Dan', {}, [Maria, Dan], 'ella lo ama'],
      ['Maria', 'love', null, 'Dan', { _11:Dan }, [Maria], 'me ama'],
      ['Dan', 'see', null, 'Maria', {}, [Maria], 'Dan la ve'],
      ['Robots', 'call', null, 'Libros', { _12:Libros }, [Robots], 'nos llaman'],
      ['Robots', 'call', null, 'Libros', { _12:Robots }, [Libros], 'los llamamos'],
      ['Dan', 'give', 'Maria', 'Regalo', { _11: Maria }, [], 'Dan me da un regalo'],
      ['Dan', 'give', 'Maria', 'Regalo', { _21: Maria }, [], 'Dan te da un regalo'],
      ['Dan', 'give', 'Maria', 'Regalo', {}, [Maria], 'Dan le da un regalo'],
      ['Dan', 'give', 'Robots', 'Regalo', { _12: Robots }, [], 'Dan nos da un regalo'],
      ['Dan', 'give', 'Robots', 'Regalo', {}, [Robots], 'Dan les da un regalo'],
//      ['Dan', 'give', 'Maria', 'Pluma', { _11: Dan }, [Pluma, Maria], 'se lo doy'],
    ]) {
      test(expected, /* jshint loopfunc:true */ function() {
        const vp = new UniVP3(agent, verb, indirectObj, directObj).toEs(objects)
        const pronouns = new EsPronouns(pronounsInit)
        for (const mention of pronounsInit2) {
          pronouns.update(mention)
        }
        assert.deepEqual(vp.toWords(pronouns).join(' '), expected)
      })
    }
  })
})
