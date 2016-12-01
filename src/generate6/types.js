// @flow
export type Sexp = string|Array<Sexp>
export type Noun = string

function expectNoun(sexp:Sexp, required:bool): Noun {
  if (typeof sexp !== 'string') {
    throw new Error("Expected string but got " + JSON.stringify(sexp))
  }
  const noun = sexp.toString()
  if (['', 'A', 'B', 'AA', 'Libro', 'Pluma', 'What'].indexOf(noun) === -1) {
    throw new Error("Unknown noun '" + noun + "'")
  }
  if (noun === '' && required) {
    throw new Error("Blank noun not allowed here")
  }
  return noun
}

function expectString(sexp:Sexp): Noun {
  if (typeof sexp !== 'string') {
    throw new Error("Expected string but got " + JSON.stringify(sexp))
  }
  return sexp.toString()
}

function expectStatement(sexp:Sexp): Sexp {
  if (typeof sexp === 'string') {
    throw new Error("Expected Array<string> but got " + sexp.toString())
  }
  return sexp
}

function expectNounOrStatement(sexp:Sexp, required:bool): Noun|Sexp {
  return (typeof sexp === 'string') ? expectNoun(sexp, required) : expectStatement(sexp)
}

module.exports = { expectNoun, expectNounOrStatement, expectString, expectStatement }
