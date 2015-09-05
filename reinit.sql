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
