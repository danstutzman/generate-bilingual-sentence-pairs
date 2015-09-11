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
$l1_infinitive_to_l1_past = {}
def new_infinitives table
  arcs = table.split("\n").reject { |line| line.strip == '' }.map do |line|
    _, level, l1, l1_past, l2,  = line.split(/\s+/)

    $l1_infinitive_to_l1_past[l1] = l1_past

    l1 = new_concept 'vocab_l1', l1, level, false
    l2 = new_concept 'vocab_l2', l2, level, true
    new_arc VOCAB_HEIGHT, l1, l2
  end
end

regular_infinitive_arcs = {
  '-ar' => new_infinitives(%q[
    3  talk  talked  hablar
  ]),
  '-er' => new_infinitives(%q[
    3  eat   ate     comer
  ]),
  '-ir' => new_infinitives(%q[
    3  live  lived   vivir
  ]),
}

[[regular_infinitive_arcs['-ar'], '-ar verb', %q[
    11 pres 1 s -o
    12 pres 2 s -as
    13 pres 3 s -a
    14 pres 1 p -amos
    15 pres 3 p -an
    21 pret 1 s -é
    22 pret 2 s -aste
    23 pret 3 s -ó
    24 pret 1 p -amos
    25 pret 3 p -aron
 ]],
 [regular_infinitive_arcs['-er'] + regular_infinitive_arcs['-ir'],
  '-er and -ir verbs', %q[
    11 pres 1 s -o
    12 pres 2 s -es
    13 pres 3 s -e
    14 pres 3 p -en
    11 pret 1 s -í
    12 pret 2 s -iste
    13 pret 3 s -ió
    11 pret 1 p -imos
    13 pret 1 p -ieron]],
 [regular_infinitive_arcs['-er'], '-er verb', %q[ 14 pres 1 p -emos]],
 [regular_infinitive_arcs['-er'], '-ir verb', %q[ 14 pres 1 p -imos]],
].each do |infinitive_arcs, verb_type, conjugation_table|
  for infinitive_arc in infinitive_arcs
    conjugation_table.split("\n").reject { |line2| line2.strip == '' }.each do |line2|
      _, suffix_level, tense, person, number, suffix = line2.split(/\s+/)

      features = "(#{tense},#{person},#{number}) for #{verb_type}"
      features = $concept_by_type_and_content[['features_l2', features]] ||
        new_concept('features_l2', features, suffix_level, false)
      suffix_description = "#{suffix} for #{verb_type}"
      suffix_description = $concept_by_type_and_content[['suffix_l2', suffix]] ||
        new_concept('suffix_l2', suffix_description, suffix_level, true)
      suffix_arc = new_arc SUFFIX_HEIGHT, features, suffix_description

      conjugation_level = [infinitive_arc.level, suffix_level.to_i].max
      conjugation_l1 = case tense
        when 'pres' then infinitive_arc.from_concept.content
        when 'pret' then $l1_infinitive_to_l1_past[infinitive_arc.from_concept.content]
        else raise "Don't know tense #{tense}"
      end
      conjugation_l1 = new_concept 'conjugation_l1',
        "#{conjugation_l1}(#{person},#{number})", conjugation_level, false
      conjugation_l2 = new_concept 'conjugation_l2',
        infinitive_arc.to_concept.content[0...-2] + suffix[1..-1],
        conjugation_level, true
      conjugation_arc = new_arc CONJUGATION_HEIGHT, conjugation_l1, conjugation_l2
      conjugation_arc.add_part_arcs! [infinitive_arc, suffix_arc]
      reverse_arc(conjugation_arc).add_part_arcs!(
        [reverse_arc(infinitive_arc), reverse_arc(suffix_arc)])
    end # next conjugation
  end # next verb
end # next verb type

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
