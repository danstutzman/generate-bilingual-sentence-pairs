require 'pp'
require './models'

WORD_HEIGHT   = 1
PHRASE_HEIGHT = 2

connect_to_db! true

new_prompt 'word_l1', 'word_l2', 'Translate to Spanish:'
new_prompt 'word_l2', 'word_l1', 'Translate to English:'
new_prompt 'phrase_l1', 'phrase_l2', 'Translate to Spanish:'
new_prompt 'phrase_l2', 'phrase_l1', 'Translate to English:'

%q[
  1 the(m) el
  1 the(f) la
  1 a(m)   un
  1 a(f)   una
].split("\n").reject { |line| line == '' }.each do |line|
  _, level, word_l1, word_l2 = line.split(/\s+/)
  word_l1 = new_concept 'word_l1', word_l1, level, false
  word_l2 = new_concept 'word_l2', word_l2, level, true
  arc = new_arc WORD_HEIGHT, word_l1, word_l2
end

%q[
  2 ticket billete
  2 jacket chaqueta
].split("\n").reject { |line| line == '' }.each do |line|
  _, level, word_l1, word_l2 = line.split(/\s+/)
  word_l1 = new_concept 'word_l1', word_l1, level, false
  word_l2 = new_concept 'word_l2', word_l2, level, true
  arc = new_arc WORD_HEIGHT, word_l1, word_l2
end

%q[
  the(m) ticket  |el billete
  the(f) jacket  |la chaqueta
  a(m) ticket    |un billete
  a(f) jacket    |una chaqueta
].split("\n").reject { |line| line == '' }.each do |line|
  phrase_l1, phrase_l2 = line.split('|').map { |field| field.strip }

  determiner_l1, noun_l1 = phrase_l1.split(' ')
  determiner_l1 = $concept_by_type_and_content[['word_l1', determiner_l1]]
  noun_l1       = $concept_by_type_and_content[['word_l1', noun_l1]]
  determiner_l1_arc = $arc_by_from_concept_and_to_concept_type[
    [determiner_l1, 'word_l2']]
  level = [noun_l1.level, determiner_l1.level].max

  phrase_l1 = new_concept 'phrase_l1', phrase_l1, level, false
  phrase_l2 = new_concept 'phrase_l2', phrase_l2, level, true
  arc = new_arc PHRASE_HEIGHT, phrase_l1, phrase_l2
  noun_l1_arc = $arc_by_from_concept_and_to_concept_type[[noun_l1, 'word_l2']]
  arc.add_part_arcs! [determiner_l1_arc, noun_l1_arc]
  reverse_arc(arc).add_part_arcs! \
    [reverse_arc(determiner_l1_arc), reverse_arc(noun_l1_arc)]
end


# the(f) apple -> la manzana
# a(f) apple -> una manzana

#%q[
#  11 walk andar
#]
# walked(1,S)
# -> {l1_infinitive:walk,tense:pret,per:1,num:S)
# -> {l2_infinitive:andar,irreg:true,tense:pret,per:1,num:S,stem:anduv}
# -> anduve

# I see(I,S)
# -> (I,S) voy
