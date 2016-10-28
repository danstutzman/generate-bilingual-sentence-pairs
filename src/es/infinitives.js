// @flow
import type { Infinitive } from "./types";

var add = function(l2:string, l1:string, l1Past:string) {
  return {
    l2:     l2,
    l1:     l1,
    l1Past: l1Past,
  }
}

add("hablar", "talk",    "talked");
add("comer",  "eat",     "ate");
add("vivir",  "live",    "lived");
add("andar",  "walk",    "walked");
add("ser",    "be",      "were");
add("estar",  "be",      "were");
add("tener",  "have",    "had");
add("hacer",  "do",      "did");
add("decir",  "say",     "said");
add("ir",     "go",      "went");
add("ver",    "see",     "saw");
add("dar",    "give",    "gave");
add("saber",  "know",    "knew");
add("venir",  "come",    "came");
add("salir",  "leave",   "left");
add("querer", "want",    "wanted");
add("poder",  "can",     "could");
add("pensar", "think",   "thought");
add("volver", "return",  "returned");
add("sentir", "feel",    "felt");
add("contar", "tell",    "told");
add("odiar",  "hate",    "hated");
add("enviar", "send",    "sent");
add("usar",   "use",     "used");
add("llamar", "call",    "called");
add("pedir",  "request", "requested");
add("viajar", "travel",  "traveled");
add("ayudar", "help",    "helped");
add("beber",  "drink",   "drank");
add("tratar", "try",     "tried");
add("poner",      "put(pres)",  "put(past)");
add("leer",       "read(pres)", "read(past)");
add("parecer",    "appear",     "appeared");
add("conocer",    "know",       "knew");
add("escribir",   "write",      "wrote");
add("necesitar",  "need",       "needed");
add("seguir",     "continue",   "continued");
add("encontrar",  "find",       "found");
add("empezar",    "begin",      "began");
add("aprender",   "learn",      "learned");
add("importar",   "matter",     "mattered");
add("gustar",     "please",     "pleased");
add("significar", "mean",       "meant");
add("olvidar",    "forget",     "forgot");
add("estudiar",   "study",      "studied");
add("recordar",   "remember",   "remembered");
add("preguntar",  "ask",        "asked");
add("comprar",    "buy",        "bought");
add("encantar",   "enchant",    "enchanted");
