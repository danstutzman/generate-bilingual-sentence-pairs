// @flow

class InfinitivePair {
  l2: string
  l1: string
  l1Past: string

  constructor(l2:string, l1:string, l1Past:string) {
    this.l2     = l2
    this.l1     = l1
    this.l1Past = l1Past
  }
}

var table : Array<InfinitivePair> = [
  new InfinitivePair("hablar", "talk",    "talked"),
  new InfinitivePair("comer",  "eat",     "ate"),
  new InfinitivePair("vivir",  "live",    "lived"),
  new InfinitivePair("andar",  "walk",    "walked"),
  new InfinitivePair("ser",    "be",      "were"),
  new InfinitivePair("estar",  "be",      "were"),
  new InfinitivePair("tener",  "have",    "had"),
  new InfinitivePair("hacer",  "do",      "did"),
  new InfinitivePair("decir",  "say",     "said"),
  new InfinitivePair("ir",     "go",      "went"),
  new InfinitivePair("ver",    "see",     "saw"),
  new InfinitivePair("dar",    "give",    "gave"),
  new InfinitivePair("saber",  "know",    "knew"),
  new InfinitivePair("venir",  "come",    "came"),
  new InfinitivePair("salir",  "leave",   "left"),
  new InfinitivePair("querer", "want",    "wanted"),
  new InfinitivePair("poder",  "can",     "could"),
  new InfinitivePair("pensar", "think",   "thought"),
  new InfinitivePair("volver", "return",  "returned"),
  new InfinitivePair("sentir", "feel",    "felt"),
  new InfinitivePair("contar", "tell",    "told"),
  new InfinitivePair("odiar",  "hate",    "hated"),
  new InfinitivePair("enviar", "send",    "sent"),
  new InfinitivePair("usar",   "use",     "used"),
  new InfinitivePair("llamar", "call",    "called"),
  new InfinitivePair("pedir",  "request", "requested"),
  new InfinitivePair("viajar", "travel",  "traveled"),
  new InfinitivePair("ayudar", "help",    "helped"),
  new InfinitivePair("beber",  "drink",   "drank"),
  new InfinitivePair("tratar", "try",     "tried"),
  new InfinitivePair("poner",      "put(pres)",  "put(past)"),
  new InfinitivePair("leer",       "read(pres)", "read(past)"),
  new InfinitivePair("parecer",    "appear",     "appeared"),
  new InfinitivePair("conocer",    "know",       "knew"),
  new InfinitivePair("escribir",   "write",      "wrote"),
  new InfinitivePair("necesitar",  "need",       "needed"),
  new InfinitivePair("seguir",     "continue",   "continued"),
  new InfinitivePair("encontrar",  "find",       "found"),
  new InfinitivePair("empezar",    "begin",      "began"),
  new InfinitivePair("aprender",   "learn",      "learned"),
  new InfinitivePair("importar",   "matter",     "mattered"),
  new InfinitivePair("gustar",     "please",     "pleased"),
  new InfinitivePair("significar", "mean",       "meant"),
  new InfinitivePair("olvidar",    "forget",     "forgot"),
  new InfinitivePair("estudiar",   "study",      "studied"),
  new InfinitivePair("recordar",   "remember",   "remembered"),
  new InfinitivePair("preguntar",  "ask",        "asked"),
  new InfinitivePair("comprar",    "buy",        "bought"),
  new InfinitivePair("encantar",   "enchant",    "enchanted"),
]

var tableByL2 : { [l2:string] : InfinitivePair|void } = {}
for (var i = 0; i < table.length; i++) {
  var pair = table[i]
  tableByL2[pair.l2] = pair
}

var lookupByL2 = function(l2:string) : Array<InfinitivePair> {
  var pair = tableByL2[l2]
  return (pair !== undefined) ? [pair] : []
}

module.exports = {
  InfinitivePair: InfinitivePair,
  lookupByL2:     lookupByL2,
}
