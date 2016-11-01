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
    setup(function() {
      const Dan     = new EsObject(['Dan'], 'yo/él', true)
      const Maria   = new EsObject(['María'], 'yo/ella', true)
      const Robot   = new EsObject(['el', 'robot'], 'yo/él', false)
      const Robots  = new EsObject(['los', 'robots'], 'nosotros/ellos', false)
      const Friend  = new EsObject(['un', 'amigo'], 'yo/él', true)
      const Friends = new EsObject(['amigos'], 'nosotros/ellos', true)
      const Gifts   = new EsObject(['regalos'], 'nosotros/ellos', false)
      this.objects = { Maria, Dan: Dan, Robot, Robots, Friend, Friends, Gifts }
    })
    test('da a Dan regalos', function() {
      const vp = new UniVP3('Friend', 'give', 'Dan', 'Gifts').toEs(this.objects)
      const words = vp.toWords(new EsPronouns({ _3s: this.objects.Friend }))
      assert.deepEqual(words.join(' '), 'da a Dan regalos')
    })
  })
})
