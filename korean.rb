require 'sqlite3'

# JG = jamo glyph
# JP = jamo pronunciation
# JGPN = jamo glyph-pronunciation mnemonic

# See http://ryanestradadotcom.tumblr.com/post/20461267965/learn-to-read-korean-in-15-minutes

# 2nd col: Hangul Compatibility Jamo: http://www.unicode.org/charts/PDF/U3130.pdf
# 3rd col: Hangul Jamo: http://unicode.org/charts/PDF/U1100.pdf
# ㄱ 3131 1100 11A8 KIYEOK  Gun          /k/,[k],[ɡ],[k͈],[ŋ]
# ㄴ 3134 1102 11AB NIEUN   Nose         /n/,/l/
# ㄷ 3137 1103 11AE TIKEUT  Door         /t/,[t],[d],[t̚],[n]
# ㅂ 3142 1107 11B8 PIEUP   Bucket       /p/,[p],[b],[p̚],[m]
# ㅇ 3147 110B      IEUNG   none         [ŋ] at end
# ㅡ 3161 1173      EU      brOOk        [ɯ]
# ㄹ 3139 1105 11AF RIEUL   RattLesnake  /l/,[ɾ],[l]end,[ɭ]
# ㅁ 3141 1106      MIEUM   Map          /m/
# ㅍ 314D 1111      PHIEUPH Part two     /pʰ/, [pʰ]
# ㅅ 3145 1109 11BA SIOS    SummiT       /s/,[s],[ɕ],[t̚]end
# ㅣ 3163 1175      I       trEE         [i]
# ㅓ 3153 1165      EO      Up front     [ɔ]
# ㅏ 314F 1161      A       fAr away     [a]
# ㅔ 3154 1166      E       bEHfore      [e]
# ㅐ 3150 1162      AE      After        [ɛ]
# ㅗ 3157 1169      O       Over         [o]
# ㅜ 315C 116E      U       at the rOOt  [u]
# ㅋ 314B      118F KHIEUKH G changed    [kʰ]
# ㅌ 314C 1110 11C0 THIEUTH D changed    [tʰ]
# ㅎ 314E      11F9 HIEUH   none changed [h]
# ㅈ 3148      11BD CIEUC   S changed    [t͡ɕ]=j
# ㅊ 314A      11BE CHIEUCH S twice      [t͡ɕʰ]=ch

baet = "\u1107\u1162\u11ba" # 뱃
maen = "\u1106\u1162\u11ab" # 맨
to   = "\u1110\u1169"       # 토
ro   = "\u1105\u1169"       # 로
mo   = "\u1106\u1169"       # 모
ma   = "\u1106\u1161"       # 마
ri   = "\u1105\u1175"       # 리
o    = "\u110b\u1169"       # 오

#jamo = [u3131, u3134, u3137, u3142, u3147, u3161, u3163]
#
#puts 'Given jamo, type English letter(s) representing sounds'
#puts jamo[rand(jamo.size)]
#puts readline

def u_sequences_to_utf8(s)
  s.gsub(/\\u[0-9A-F]{4}/) { |u_sequence| u_sequence[2...6].to_i(16).chr('UTF-8') }
end

db = SQLite3::Database.new "test.db"
sql = "
  select
    from_assets.content as from_content,
    to_assets.content as to_content
  from arcs
  join assets as from_assets on from_assets.id = arcs.from_asset_id
  join assets as to_assets   on to_assets.id   = arcs.to_asset_id
  where from_assets.name like 'uhcj-%'
  and to_assets.name like 'njp-%'
  ;
"
jamo_mnemonic_pairs = []
for row in db.execute(sql) do
  jamo_utf8 = u_sequences_to_utf8(row[0])
  mnemonic  = u_sequences_to_utf8(row[1])
  jamo_mnemonic_pairs.push [jamo_utf8, mnemonic]
end

pair = jamo_mnemonic_pairs[rand(jamo_mnemonic_pairs.size)]
puts "What is the mnemonic for: #{pair[0]}?  Press enter to show answer."
readline
puts "The answer was: #{pair[1]}.  Did you get it right? (y/n)"
was_correct = (readline.strip == 'y')
if was_correct
  puts 'yeah'
else
  puts 'crap'
end
