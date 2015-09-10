require 'pp'
require './models'

VOCAB_HEIGHT       = 1
SUFFIX_HEIGHT      = 1
CONJUGATION_HEIGHT = 2
PHRASE_HEIGHT      = 3

connect_to_db! true

new_prompt 'vocab_l1', 'vocab_l2', 'Translate to Spanish:'
new_prompt 'vocab_l2', 'vocab_l1', 'Translate to English:'
new_prompt 'conjugation_l1', 'conjugation_l2', 'Translate to Spanish:'
new_prompt 'conjugation_l2', 'conjugation_l1', 'Translate to English:'
new_prompt 'phrase_l1', 'phrase_l2', 'Translate to Spanish:'
new_prompt 'phrase_l2', 'phrase_l1', 'Translate to English:'

%q[
  1 the(m) el
  1 the(f) la
  1 a(m)   un
  1 a(f)   una
  2 ticket billete
  2 jacket chaqueta
].split("\n").reject { |line| line == '' }.each do |line|
  _, level, vocab_l1, vocab_l2 = line.split(/\s+/)
  vocab_l1 = new_concept 'vocab_l1', vocab_l1, level, false
  vocab_l2 = new_concept 'vocab_l2', vocab_l2, level, true
  arc = new_arc VOCAB_HEIGHT, vocab_l1, vocab_l2
end

%q[
  the(m) ticket  |el billete
  the(f) jacket  |la chaqueta
  a(m) ticket    |un billete
  a(f) jacket    |una chaqueta
].split("\n").reject { |line| line == '' }.each do |line|
  phrase_l1, phrase_l2 = line.split('|').map { |field| field.strip }

  determiner_l1, noun_l1 = phrase_l1.split(' ')
  determiner_l1 = $concept_by_type_and_content[['vocab_l1', determiner_l1]]
  noun_l1       = $concept_by_type_and_content[['vocab_l1', noun_l1]]
  determiner_l1_arc = $arc_by_from_concept_and_to_concept_type[
    [determiner_l1, 'vocab_l2']]
  level = [noun_l1.level, determiner_l1.level].max

  phrase_l1 = new_concept 'phrase_l1', phrase_l1, level, false
  phrase_l2 = new_concept 'phrase_l2', phrase_l2, level, true
  arc = new_arc PHRASE_HEIGHT, phrase_l1, phrase_l2
  noun_l1_arc = $arc_by_from_concept_and_to_concept_type[[noun_l1, 'vocab_l2']]
  arc.add_part_arcs! [determiner_l1_arc, noun_l1_arc]
  reverse_arc(arc).add_part_arcs! \
    [reverse_arc(determiner_l1_arc), reverse_arc(noun_l1_arc)]
end

%q[
  3  eat  comer
].split("\n").reject { |line| line == '' }.each do |line|
  _, infinitive_level, infinitive_l1, infinitive_l2 = line.split(/\s+/)

  infinitive_l1 = new_concept 'vocab_l1', infinitive_l1, infinitive_level, false
  infinitive_l2 = new_concept 'vocab_l2', infinitive_l2, infinitive_level, true
  infinitive_arc = new_arc VOCAB_HEIGHT, infinitive_l1, infinitive_l2

  %q[
    11 1 s -o
    12 2 s -es
    13 3 s -e
    14 1 p -emos
    15 3 p -en
  ].split("\n").reject { |line2| line2.strip == '' }.each do |line2|
    _, suffix_level, person, number, suffix = line2.split(/\s+/)

    features = "(#{person},#{number}) for -er verb"
    features = $concept_by_type_and_content[['features_l2', features]] ||
      new_concept('features_l2', features, suffix_level, false)
    suffix_description = "#{suffix} for -er verb"
    suffix_description = $concept_by_type_and_content[['suffix_l2', suffix]] ||
      new_concept('suffix_l2', suffix_description, suffix_level, true)
    suffix_arc = new_arc SUFFIX_HEIGHT, features, suffix_description

    conjugation_level = [infinitive_level, suffix_level].max
    conjugation_l1 = new_concept 'conjugation_l1',
      "#{infinitive_l1.content}(#{person},#{number})", conjugation_level, false
    conjugation_l2 = new_concept 'conjugation_l2',
      infinitive_l2.content[0...-2] + suffix[1..-1], conjugation_level, true
    conjugation_arc = new_arc CONJUGATION_HEIGHT, conjugation_l1, conjugation_l2
    conjugation_arc.add_part_arcs! [infinitive_arc, suffix_arc]
    reverse_arc(conjugation_arc).add_part_arcs!(
      [reverse_arc(infinitive_arc), reverse_arc(suffix_arc)])
  end
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
