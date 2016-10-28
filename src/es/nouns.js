// @flow
import type { Gender } from "./types";

var new_noun = function(l2:string, l1:string, gender:Gender, is_writing:bool,
    is_person:bool, is_countable:bool) {
  return {
    l2: l2
  }
}
new_noun("billete",  "ticket", "M", true,  false, true );
new_noun("chaqueta", "jacket", "F", false, false, true );
