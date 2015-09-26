require 'pp'
require './models_fast'

VOCAB_HEIGHT       = 1
SUFFIX_HEIGHT      = 1
STEM_HEIGHT        = 1
CONJUGATION_HEIGHT = 2
TEMPLATE_HEIGHT    = 3
PHRASE_HEIGHT      = 4

connect_to_db! true

new_prompt 'vocab_l1', 'vocab_l2', 'Translate to Spanish:'
new_prompt 'vocab_l2', 'vocab_l1', 'Translate to English:'
new_prompt 'conjugation_l1', 'conjugation_l2', 'Translate to Spanish:'
new_prompt 'conjugation_l2', 'conjugation_l1', 'Translate to English:'
new_prompt 'phrase_l1', 'phrase_l2', 'Translate to Spanish:'
new_prompt 'phrase_l2', 'phrase_l1', 'Translate to English:'
new_prompt 'l2_irregular_infinitive', 'l2_irregular_stem',
  "What's the irregular stem for:"
new_prompt 'l2_irregular_stem', 'l2_irregular_infinitive',
  "What verb and tense does this irregular stem go to?"
new_prompt 'suffix_l2', 'features_l2',
  "What tense, person, and number does this verb suffix mean?"
new_prompt 'features_l2', 'suffix_l2',
  "What's the suffix for this tense, person, and number?"
new_prompt 'l1_vp_template', 'l2_vp_template', 'Translate to Spanish:'
new_prompt 'l2_vp_template', 'l1_vp_template', 'Translate to English:'

%q[
  1 the(m) el
  1 the(f) la
  1 a(m)   un
  1 a(f)   una
  1 ticket billete
  1 jacket chaqueta
  1 something algo
  1 someone   alguien
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

# Definitions of verbs
$l1_infinitive_to_l1_past = {}
$l2_verbs_ending_with = {}
%q[
  1  hablar  talk   talked
  1  comer   eat    ate
  1  vivir   live   lived
  1  andar   walk   walked
  1  ser     be     were
  1  estar   be     were
  1  tener   have   had
  1  hacer   do     did
  1  decir   say    said
  1  ir      go     went
  1  ver     see    saw
  1  dar     give   gave
  1  saber   know   knew
  1  venir   come   came
  1  salir   leave  left
  1  querer  want   wanted
  1  poner   put    put
  1  leer    read   read
  1  parecer   appear  appeared
  1  conocer   know    knew
  1  escribir  write   wrote
].split("\n").reject { |line| line == '' }.each do |line|
  _, level, l2, l1, l1_past = line.split(/\s+/)
  $l1_infinitive_to_l1_past[l1] = l1_past

  l1 = new_concept 'vocab_l1', l1, level, false
  l2 = new_concept 'vocab_l2', l2, level, true
  arc = new_arc VOCAB_HEIGHT, l1, l2

  suffix = '-' + l2.content[-2..-1]
  $l2_verbs_ending_with[suffix] ||= []
  $l2_verbs_ending_with[suffix].push arc
end

# Special present conjugations
%q[
  1 ser   pret 1 s soy
  1 ser   pret 2 s eres
  1 ser   pres 3 s es
  1 ser   pres 1 p somos
  1 ser   pres 3 p son
  1 estar pres 1 s estoy
  1 estar pres 2 s estás
  1 estar pres 3 s está
  1 estar pres 3 p están
  1 tener pres 1 s tengo
  1 hacer pres 1 s hago
  1 decir pres 1 s digo
  1 decir pret 3 p dijeron
  1 ir    pres 1 s voy
  1 ir    pres 2 s vas
  1 ir    pres 3 s va
  1 ir    pres 1 p vamos
  1 ir    pres 3 p van
  1 ir    pret 1 s fui
  1 ir    pret 2 s fuiste
  1 ir    pret 3 s fue
  1 ir    pret 1 p fuimos
  1 ir    pret 3 p fueron
  1 ver   pres 1 s veo
  1 dar   pres 1 s doy
  1 dar   pret 1 s di
  1 dar   pret 2 s diste
  1 dar   pret 3 s dio
  1 dar   pret 1 p dimos
  1 dar   pret 3 p dieron
  1 saber pres 1 s sé
  1 poner pres 1 s pongo
  1 venir pres 1 s vengo
  1 salir pres 1 s salgo
  1 parecer pres 1 s parezco
  1 conocer pres 1 s conozco
].split("\n").reject { |line| line == '' }.each do |line|
  _, level, infinitive_l2, tense, person, number, conjugation_l2 =
    line.split(/\s+/)
  infinitive_l2 = $concept_by_type_and_content[['vocab_l2', infinitive_l2]]
  infinitive_arc = reverse_arc(
    $arc_by_from_concept_and_to_concept_type[[infinitive_l2, 'vocab_l1']])

  conjugation_l1 = infinitive_arc.from_concept.content
  if tense == 'pret'
    conjugation_l1 = $l1_infinitive_to_l1_past.fetch(conjugation_l1)
  end
  conjugation_l1 = "#{conjugation_l1}(#{person},#{number})"
  conjugation_l1 = new_concept 'conjugation_l1', conjugation_l1, level, false
  conjugation_l2 = new_concept 'conjugation_l2', conjugation_l2, level, true
  arc = new_arc STEM_HEIGHT, conjugation_l1, conjugation_l2

  # Probably memorized directly without falling back to infinitive
  #arc.add_part_arcs! [infinitive_arc]
  #reverse_arc(arc).add_part_arcs! [reverse_arc(infinitive_arc)]
end

# Stem changers
%q[
  1 pres  poder      pued-
  1 pres  tener      tien-
  1 pres  querer     quier-
  1 pres  seguir     sig-
  1 pres  encontrar  encuentr-
  1 pres  venir      vien-
  1 pres  pensar     piens-
  1 pres  volver     vuelv-
  1 pres  sentir     sient-
  1 pres  contar     cuent-
  1 pres  empezar    empiez-
  1 pres  decir      di-
  1 pret  andar      anduv-
  1 pret  saber      sup-
  1 pret  querer     quis-
  1 pret  poner      pus-
  1 pret  venir      vin-
  1 pret  decir      dij-
].split("\n").reject { |line| line == '' }.each do |line|
  _, level, tense, l2_infinitive, l2_irregular_stem = line.split(/\s+/)
  l2_irregular_infinitive = "#{l2_infinitive}(#{tense})"
  l2_irregular_infinitive = new_concept 'l2_irregular_infinitive',
    l2_irregular_infinitive, level, true
  l2_irregular_stem = new_concept 'l2_irregular_stem', l2_irregular_stem,
    level, true
  stem_arc = new_arc STEM_HEIGHT, l2_irregular_infinitive, l2_irregular_stem

  if tense == 'pret'
    %q[
      21 1 s -e
      21 2 s -iste
      21 3 s -o
      21 1 p -imos
      21 3 p -ieron
    ].split("\n").reject { |line2| line2.strip == '' }.each do |line2|
      _, suffix_level, person, number, suffix = line2.split(/\s+/)

      features = "(#{tense},#{person},#{number}) for irregular verbs"
      features = $concept_by_type_and_content[['features_l2', features]] ||
        new_concept('features_l2', features, suffix_level, false)
      suffix_description = "#{suffix} for irregular verbs"
      suffix_description = $concept_by_type_and_content[['suffix_l2', suffix]] ||
        new_concept('suffix_l2', suffix_description, suffix_level, true)
      suffix_arc = new_arc SUFFIX_HEIGHT, features, suffix_description

      l2_infinitive_concept =
        $concept_by_type_and_content.fetch(['vocab_l2', l2_infinitive])
      infinitive_arc = reverse_arc($arc_by_from_concept_and_to_concept_type.fetch(
        [l2_infinitive_concept, 'vocab_l1']))

      conjugation_l1 = $l1_infinitive_to_l1_past.fetch(
        infinitive_arc.from_concept.content)
      conjugation_l1 = new_concept 'conjugation_l1',
        "#{conjugation_l1}(#{person},#{number})", level, false

      conjugation_l2 = new_concept 'conjugation_l2',
        l2_irregular_stem.content[0...-1] + suffix[1..-1], level, true

      conjugation_arc = new_arc CONJUGATION_HEIGHT, conjugation_l1, conjugation_l2
      part_arcs = [infinitive_arc, stem_arc, suffix_arc].compact
      part_arcs2 = [stem_arc, infinitive_arc, suffix_arc].compact
      conjugation_arc.add_part_arcs! part_arcs
      reverse_arc(conjugation_arc).add_part_arcs!(
        part_arcs2.map { |arc| reverse_arc(arc) })
    end
  end
end

[[$l2_verbs_ending_with['-ar'], '-ar verb', %q[
    11 pres 1 s -o
    12 pres 2 s -as
    13 pres 3 s -a
    14 pres 1 p -amos
    15 pres 3 p -an
    21 pret 1 s -é
    22 pret 2 s -aste
    23 pret 3 s -ó
    24 pret 1 p -amos
    25 pret 3 p -aron]],
 [$l2_verbs_ending_with['-er'] + $l2_verbs_ending_with['-ir'], '-er and -ir verbs', %q[
    11 pres 1 s -o
    12 pres 2 s -es
    13 pres 3 s -e
    14 pres 3 p -en
    11 pret 1 s -í
    12 pret 2 s -iste
    13 pret 3 s -ió
    11 pret 1 p -imos
    13 pret 3 p -ieron]],
 [$l2_verbs_ending_with['-er'], '-er verb', %q[ 14 pres 1 p -emos]],
 [$l2_verbs_ending_with['-ir'], '-ir verb', %q[ 14 pres 1 p -imos]],
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
        when 'pres'
          infinitive_arc.from_concept.content
        when 'pret'
          $l1_infinitive_to_l1_past[infinitive_arc.from_concept.content]
        else raise "Don't know tense #{tense}"
      end
      conjugation_l1 = "#{conjugation_l1}(#{person},#{number})"
      if $concept_by_type_and_content[['conjugation_l1', conjugation_l1]]
        # don't create conjugation; it was already created
      else
        conjugation_l1 = new_concept 'conjugation_l1',
          conjugation_l1, conjugation_level, false

        if [tense, person, number] == ['pres', '1', 'p']
          # then don't look for an irregular stem
          possible_l2_irregular_stem = nil
        else
          possible_l2_irregular_stem = $concept_by_type_and_content[
            ['l2_irregular_infinitive',
              "#{infinitive_arc.to_concept.content}(#{tense})"]]
          possible_l2_irregular_stem = $arc_by_from_concept_and_to_concept_type[
            [possible_l2_irregular_stem, 'l2_irregular_stem']]
        end
        l2_stem = possible_l2_irregular_stem ?
          possible_l2_irregular_stem.to_concept.content[0...-1] :
          infinitive_arc.to_concept.content[0...-2]
        conjugation_l2 = new_concept 'conjugation_l2', l2_stem + suffix[1..-1],
          conjugation_level, true

        conjugation_arc = new_arc CONJUGATION_HEIGHT, conjugation_l1, conjugation_l2
        part_arcs = [infinitive_arc, possible_l2_irregular_stem, suffix_arc].compact
        part_arcs2 = [possible_l2_irregular_stem, infinitive_arc, suffix_arc].compact
        conjugation_arc.add_part_arcs! part_arcs
        reverse_arc(conjugation_arc).add_part_arcs!(
          part_arcs2.map { |arc| reverse_arc(arc) })
      end
    end # next conjugation
  end # next verb
end # next verb type

%q[
  1 | leer algo               | to read something
  1 | escribir algo a alguien | to write something to someone
].split("\n").reject { |line| line == '' }.each do |line|
  level, l2_vp_template, l1_vp_template = line.split('|').map { |part| part.strip }

  part_arcs = []
  l2_words = l2_vp_template.split(' ')
  l2_verb = $concept_by_type_and_content.fetch(['vocab_l2', l2_words.first])
  part_arcs.push reverse_arc(
    $arc_by_from_concept_and_to_concept_type.fetch([l2_verb, 'vocab_l1']))

  for template_word in ['algo', 'alguien']
    if l2_words.include? template_word
      part_arcs.push reverse_arc($arc_by_from_concept_and_to_concept_type.fetch(
        [$concept_by_type_and_content.fetch(['vocab_l2', template_word]), 'vocab_l1']))
    end
  end

  l1_vp_template = new_concept 'l1_vp_template', l1_vp_template, level, false
  l2_vp_template = new_concept 'l2_vp_template', l2_vp_template, level, true
  arc = new_arc TEMPLATE_HEIGHT, l1_vp_template, l2_vp_template
  arc.add_part_arcs! part_arcs
  reverse_arc(arc).add_part_arcs! part_arcs.map { |arc| reverse_arc(arc) }
end

persist_to_db!
