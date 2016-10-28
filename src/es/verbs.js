// @flow

import type { Verb } from "./types";

var add = function(l2:string, l1:string, l1Past:string) : Verb {
  return {
    l2:     l2,
    l1:     l1,
    l1Past: l1Past,
  }
}

add("hablar", "talk", "talked");
add("comer",  "eat",  "ate");
add("vivir",  "live", "lived");
