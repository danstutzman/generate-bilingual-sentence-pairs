// @flow
import type { StemChange, Tense } from "./types";

var add = function(tense:Tense, infinitive:string, stem:string) : StemChange {
  return {
    tense:       tense,
    infinitive:  infinitive,
    stem:        stem,
  }
}

add("pres", "poder",     "pued-");
add("pres", "tener",     "tien-");
add("pres", "querer",    "quier-");
add("pres", "seguir",    "sig-");
add("pres", "encontrar", "encuentr-");
add("pres", "venir",     "vien-");
add("pres", "pensar",    "piens-");
add("pres", "volver",    "vuelv-");
add("pres", "sentir",    "sient-");
add("pres", "contar",    "cuent-");
add("pres", "empezar",   "empiez-");
add("pres", "decir",     "dic-");
add("pres", "recordar",  "recuerd-");
add("pres", "pedir",     "pid-");
add("pret", "andar",     "anduv-");
add("pret", "saber",     "sup-");
add("pret", "querer",    "quis-");
add("pret", "poner",     "pus-");
add("pret", "venir",     "vin-");
add("pret", "decir",     "dij-");
add("pret", "tener",     "tuv-");
add("pret", "hacer",     "hic-");
add("pret", "poder",     "pud-");
