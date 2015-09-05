drop table if exists assets;
create table assets(
  id      integer primary key autoincrement,
  name    varchar unique,
  content varchar
);

-- uhcj = Unicode: Hangul Compatibility Jamo
-- (show giant letter)
insert into assets values (null, 'uhcj-k',  '\u3131');
insert into assets values (null, 'uhcj-n',  '\u3134');
insert into assets values (null, 'uhcj-t',  '\u3137');
insert into assets values (null, 'uhcj-p',  '\u3142');
insert into assets values (null, 'uhcj-ng', '\u3147');
insert into assets values (null, 'uhcj-eu', '\u3161');
insert into assets values (null, 'uhcj-r',  '\u3139');
insert into assets values (null, 'uhcj-m',  '\u3141');
insert into assets values (null, 'uhcj-ph', '\u314D');
insert into assets values (null, 'uhcj-s',  '\u3145');
insert into assets values (null, 'uhcj-i',  '\u3163');
insert into assets values (null, 'uhcj-eo', '\u3153');
insert into assets values (null, 'uhcj-a',  '\u314F');
insert into assets values (null, 'uhcj-e',  '\u3154');
insert into assets values (null, 'uhcj-ae', '\u3150');
insert into assets values (null, 'uhcj-o',  '\u3157');
insert into assets values (null, 'uhcj-u',  '\u315C');
--insert into assets values (null, 'uhcj-kh', '\u314B');
--insert into assets values (null, 'uhcj-th', '\u314C');
--insert into assets values (null, 'uhcj-h',  '\u314E');
--insert into assets values (null, 'uhcj-c',  '\u3148');
--insert into assets values (null, 'uhcj-ch', '\u314A');

-- njp = Mnemonic: Jamo Pronunciation (input or output)
-- (show in small letters)
insert into assets values (null, 'njp-k',  '(G)un');
insert into assets values (null, 'njp-n',  '(N)ose');
insert into assets values (null, 'njp-t',  '(D)oor');
insert into assets values (null, 'njp-p',  '(B)ucket');
insert into assets values (null, 'njp-ng', '(none)');
insert into assets values (null, 'njp-eu', 'br(OO)k');
insert into assets values (null, 'njp-r',  '(R)attlesnake');
insert into assets values (null, 'njp-m',  '(M)ap');
insert into assets values (null, 'njp-ph', '(P)art two');
insert into assets values (null, 'njp-s',  '(S)ummit');
insert into assets values (null, 'njp-i',  'tr(EE)');
insert into assets values (null, 'njp-eo', '(U)p front');
insert into assets values (null, 'njp-a',  'f(A)r away');
insert into assets values (null, 'njp-e',  'b(EH)fore');
insert into assets values (null, 'njp-ae', '(A)fter');
insert into assets values (null, 'njp-o',  '(O)ver');
insert into assets values (null, 'njp-u',  'at the r(OO)t');

-- ma = MPEG3: Alphabet (output)
-- to play: open -a VLC -g media/mp3s/A.mp3
--insert into assets values (null, 'ma-k',  'Giyeok.mp3');
--insert into assets values (null, 'ma-kh', 'Kieuk.mp3');
--insert into assets values (null, 'ma-a',  'A.mp3');
--insert into assets values (null, 'ma-ae', 'Ae.mp3');
--insert into assets values (null, 'ma-e',  'E.mp3');
--insert into assets values (null, 'ma-eo', 'Eo.mp3');
--insert into assets values (null, 'ma-eu', 'Eu.mp3');
--insert into assets values (null, 'ma-i',  'I.mp3');
--insert into assets values (null, 'ma-o',  'O.mp3');
--insert into assets values (null, 'ma-u',  'U.mp3');

drop table if exists arcs_loading;
create table arcs_loading(
  from_asset_name varchar not null,
  to_asset_name   varchar not null,
  teaching_order  integer not null -- 0 means don't teach directly
);
-- For now there is no keyboard entry or speech recognition;
--   it always shows the answer and asks if you got it right or not
-- uhcj->njp:  given character,      produce mnemonic word
-- njp->uhcj:  given mnemonic word,  produce character
-- njp->ma:    given mnemonic word,  produce isolated sound
-- ma->njp:    given isolated sound, produce mnemonic word
-- uhcj->ma:   given character,      produce isolated sound
-- ma->uhcj:   given isolated sound, produce character
-- 0 means 
insert into arcs_loading values ('uhcj-k', 'njp-k', 0);
insert into arcs_loading values ('njp-k', 'uhcj-k', 0);
--insert into arcs_loading values ('njp-k', 'ma-k',   0);
--insert into arcs_loading values ('ma-k', 'njp-k',   0);
--insert into arcs_loading values ('uhcj-k', 'ma-k',  1); -- connect 2
--insert into arcs_loading values ('ma-k', 'uhcj-k',  0); -- connect 2

drop table if exists arcs;
create table arcs(
  from_asset_id integer not null,
  to_asset_id   integer not null
);
insert into arcs
  select from_assets.id,
    to_assets.id
  from arcs_loading
  left join assets as from_assets
    on from_assets.name = arcs_loading.from_asset_name
  left join assets as to_assets
    on to_assets.name = arcs_loading.to_asset_name
  ;
drop table arcs_loading;

-- 마 <=--> ㅁ <-> map <-> m <--=> ma
--      \-> ㅏ <-> fAr <-> a <-/
insert into assets values (null, 'syllable-ma', '\u1106\u1161');

-- 마 -> ma sound
--   1. 마 -> ㅁ and ㅏ (easy)
--      11. 마 has ㅁ at left (easy)
--      12. 마 has ㅏ at right (easy)
--   2. ㅁ -> m sound
--      21. ㅁ -> "map"
--      22. "map" -> m sound
--   3. ㅏ -> a sound
--      31. ㅏ -> "tree with a notch on the far side"
--      32. "tree with a notch on the far side" -> "far"
--      33. "far" -> a sound
--   4. m sound and a sound make ma sound (easy)

-- ma sound -> 마
--   1. ma sound breaks apart into m sound and a sound (easy)
--   2. m sound -> ㅁ
--      21. m sound -> "map"
--      22. "map" -> ㅁ
--   3. a sound -> ㅏ
--      31. a sound -> "far"
--      32. "far" -> "tree with a notch on the far side"
--      33. "tree with a notch on the far side" -> ㅏ
--   4. ㅁ and ㅏ -> 마 (easy)
--      41. ㅁ goes on the left (easy)
--      42. ㅏ goes on the right (easy)

-- arcs:
--   1. ma sound -> 마
--   2. ma sound -> m + a
--   3. m sound -> ㅁ
--   4. a sound -> ㅏ
--   5. ㅁ and ㅏ -> 마
--   6. m sound -> "map"
--   7. "map" -> ㅁ
--   8. a sound -> "far"
--   9. "far" -> "tree with a notch on the far side"
--  10. "tree with a notch on the far side" -> ㅏ
--  11. mo sound -> 모
--  12. mo sound -> m + o
--  13. o stuff...
-- arc_compositions:
--   arc 1's 1st part is arc 2
--   arc 1's 2nd part is arc 3
--   arc 1's 3rd part is arc 4
--   arc 1's 4th part is arc 5
--   arc 3's 1st part is arc 6
--   arc 3's 2nd part is arc 7
--   arc 4's 1st part is arc 8
--   arc 4's 2nd part is arc 9
--   arc 4's 3rd part is arc 10
--   arc 11's 1st part is arc 12
--   arc 11's 2nd part is arc 3
--   arc 11's 3rd part ...

-- specified by JSON:
--  [["ㅁ", "map", "m sound"]
--   ["ㅏ", "tree with a notch on the far side", "far", "a sound"]],
--  Automatically generated compositions:
--  {"마": ["ㅁ", "ㅏ"],
--   "모": ["ㅁ", "ㅡ"],
--   "mo sound": ["m sound", "o sound"],
--   "ma sound": ["m sound", "a sound"]}
