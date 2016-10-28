// @flow
import type { Jamo } from "./types";

var add = function(l2:string, mnemonic:string, sound:string):Jamo {
  return {
    l2: l2,
    mnemonic: mnemonic,
    sound: sound,
  };
}

add("ㄱ", "[G]un",         "g");
add("ㅣ", "tr[EE]",        "i");
add("ㄴ", "[N]ose",        "n");
add("ㅡ", "br[OO]k",       "eu");
add("ㄷ", "[D]oor",        "d");
add("ㅂ", "[B]ucket",      "b");
add("ㄹ", "[R]attlesnake", "r");
add("ㅁ", "[M]ap",         "m");
add("ㅍ", "[P]art-two",    "p");
add("ㅅ", "[S]ummit",      "s");
add("ㅇ", "zero",          "0");
add("ㅏ", "mark f[A]r side of tree", "a");
add("ㅓ", "mark [U]p-front side of tree", "eo");
add("ㅔ", "mark b[E]fore first tree", "e");
add("ㅐ", "mark [A]fter first tree", "ae");
add("ㅗ", "mark [O]ver brook", "o");
add("ㅜ", "mark at r[OO]t of brook", "u");
add("ㅋ", "ㄱ with aspiration",        "k");
add("ㅌ", "ㄷ with aspiration",        "t");
add("ㅎ", "ㅇ with aspiration",        "h");
add("ㅈ", "ㅅ Summit? Jack hit Jill",  "j");
add("ㅊ", "ㅅ Summit? Jack hit Jill",  "ch");
add("ㅉ", "ㅈ doubled",                "jj");
add("ㅃ", "ㅂ doubled",                "bb");
add("ㄸ", "ㄷ doubled",                "dd");
add("ㄲ", "ㄱ doubled",                "gg");
add("ㅆ", "ㅅ doubled",                "ss");
add("ㅛ", "y plus ㅗ",                 "yo");
add("ㅕ", "y plus ㅓ",                 "yeo");
add("ㅑ", "y plus ㅏ",                 "ya");
add("ㅒ", "y plus ㅐ",                 "yae");
add("ㅖ", "y plus ㅔ",                 "ye");
add("ㅠ", "y plus ㅜ",                 "yu");
