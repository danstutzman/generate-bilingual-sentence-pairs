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

concept_id_to_concept = {}
sql = 'select id, type, content from concepts'
for row in db.execute(sql) do
  concept = {}
  concept[:id], concept[:type], concept[:content] = row
  concept_id_to_concept[concept[:id]] = concept
end

arc_id_to_arc = {}
sql = 'select id, from_concept_id, to_concept_id, is_from_l2,
  is_to_l2, height, part_arc_ids, was_correct
  from arcs'
for row in db.execute(sql) do
  arc = {}
  arc[:id], arc[:from_concept_id], arc[:to_concept_id],
    arc[:is_from_l2], arc[:is_to_l2], arc[:height], arc[:part_arc_ids],
    arc[:was_correct] = row
  arc_id_to_arc[arc[:id]] = arc
end

# prefer wrong arcs, then higher arcs (if right) or lower arcs (if wrong), arcs to l2, arcs from l2
arcs_sorted = arc_id_to_arc.sort_by { |arc_id, arc|
  [arc[:was_correct], (arc[:was_correct] == 1 ? -1 : 1) * arc[:height],
    -arc[:is_to_l2], arc[:is_from_l2], rand]
}.map { |arc_id, arc| arc }
arc = arcs_sorted.first
from_concept = concept_id_to_concept[arc[:from_concept_id]]
to_concept   = concept_id_to_concept[arc[:to_concept_id]]

case [from_concept[:type], to_concept[:type]]
  when ['jamo', 'mnemonic']
    puts 'Think of the mnemonic for:'
  when ['sound', 'jamo']
    puts 'With your finger, draw the jamo for the sound:'
  when ['sound', 'composition']
    puts 'With your finger, draw the hangul for the sounds:'
  else
    raise "Don't know how to ask for #{from_concept[:type]}, #{to_concept[:type]}"
end
puts "   #{from_concept[:content]}"
puts "Press enter to show answer."
readline

puts "The answer is:"
puts "   #{to_concept[:content]}"
puts "Got it right? (y/n)"
was_correct = (readline.strip == 'y')

if was_correct
  arc[:was_correct] = 1
else
  arc[:was_correct] = 0
end
sql = 'update arcs set was_correct = ? where id = ?'
db.execute(sql, arc[:was_correct], arc[:id])

def ask_about_part_arcs(arc, arc_id_to_arc, concept_id_to_concept, db)
  if arc[:part_arc_ids] != nil
    puts "Which part arc(s) did you get wrong? (Separate numbers with commas)"
    for part_arc_id in arc[:part_arc_ids].split(',')
      part_arc = arc_id_to_arc[part_arc_id.to_i]
      from_concept = concept_id_to_concept[part_arc[:from_concept_id]]
      to_concept = concept_id_to_concept[part_arc[:to_concept_id]]
      puts "  #{part_arc_id}. #{from_concept[:content]} -> #{to_concept[:content]}"
    end
    part_arc_ids_to_review = readline.split(',').map { |id| id.to_i }
    if part_arc_ids_to_review != [0]
      for part_arc_id in part_arc_ids_to_review
        part_arc = arc_id_to_arc[part_arc_id]
        part_arc[:was_correct] = 0
        sql = 'update arcs set was_correct = 0 where id = ?'
        db.execute(sql, part_arc_id)
        ask_about_part_arcs(part_arc, arc_id_to_arc, concept_id_to_concept, db)
      end
    end
  end
end

if not was_correct
  ask_about_part_arcs(arc, arc_id_to_arc, concept_id_to_concept, db)
end
