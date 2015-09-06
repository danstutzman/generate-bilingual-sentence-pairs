require 'pp'
require 'unicode_utils'
require './models'

JAMO_MNEMONIC_HEIGHT1 = 2
JAMO_MNEMONIC_HEIGHT2 = 2
JAMO_MNEMONIC_HEIGHT3 = 3
JAMO_HEIGHT           = 4
COMPOSITION_HEIGHT    = 5
WORD_HEIGHT           = 6

db = ActiveRecord::Base.connection
db.execute 'drop table if exists concepts'
db.execute 'create table if not exists concepts(
  id           integer primary key not null,
  type         varchar not null,
  content      varchar not null,
  level        integer not null,
  is_l2_script boolean not null
)'

db.execute 'drop table if exists arcs'
db.execute 'create table if not exists arcs(
  id                integer primary key not null,
  from_concept_id   integer not null,
  to_concept_id     integer not null,
  is_from_l2_script boolean not null,
  is_to_l2_script   boolean not null,
  height            integer not null,
  part_arc_ids      varchar,
  was_correct       boolean not null,
  level             integer not null
)'

$concept_by_id = {}
$arc_by_id = {}
$concept_by_type_and_content = {}
$arc_by_from_concept_and_to_concept_type = {}

def new_concept type, content, level, is_l2_script
  concept = Concept.create type: type, content: content, level: level,
    is_l2_script: is_l2_script
  $concept_by_id[concept.id] = concept
  $concept_by_type_and_content[[type, content]] = concept
end

def new_arc height, from, to
  level = [from.level, to.level].max

  arc1 = Arc.create from_concept_id: from.id,
    to_concept_id: to.id,
    height: height,
    level: level,
    is_from_l2_script: from.is_l2_script,
    is_to_l2_script: to.is_l2_script,
    was_correct: true
  $arc_by_id[arc1.id] = arc1
  $arc_by_from_concept_and_to_concept_type[
    [arc1.from_concept, arc1.to_concept.type]] = arc1

  arc2 = Arc.create from_concept_id: to.id,
    to_concept_id: from.id,
    height: height,
    level: level,
    is_from_l2_script: to.is_l2_script,
    is_to_l2_script: from.is_l2_script,
    was_correct: height < WORD_HEIGHT
  $arc_by_id[arc2.id] = arc2
  $arc_by_from_concept_and_to_concept_type[
    [arc2.from_concept, arc2.to_concept.type]] = arc2

  arc1
end

def reverse_arc arc
  $arc_by_from_concept_and_to_concept_type.fetch(
    [arc.to_concept, arc.from_concept.type])
end

def split_arc height, arc, middle_concept
  arc1 = new_arc height, arc.from_concept, middle_concept
  arc2 = new_arc height, middle_concept, arc.to_concept
  arc.add_part_arcs! [arc1, arc2]
  reverse_arc(arc).add_part_arcs! [reverse_arc(arc2), reverse_arc(arc1)]
  [arc1, arc2]
end

%q[
   1 ㄱ gun         g
   2 ㅣ tree        i
   3 ㄴ nose        n
   4 ㅡ brook       eu
   5 ㄷ door        d
   6 ㅂ bucket      b
   7 ㄹ rattlesnake r
   8 ㅁ map         m
   9 ㅍ part-two    p
  10 ㅅ summit      s
  11 ㅇ nothing     0
  12 ㅏ far         a
  13 ㅓ up-front    eo
  14 ㅔ before      e
  15 ㅐ after       ae
  16 ㅗ over        o
  17 ㅜ root        u
].split("\n").reject { |line| line == '' }.each do |line|
  _, level, jamo, mnemonic, pronunciation = line.split(/\s+/)

  jamo = new_concept 'jamo', jamo, level, true
  mnemonic = new_concept 'jamo-mnemonic', mnemonic, level, false
  pronunciation = new_concept 'jamo-pronunciation', pronunciation, level, false

  arc = new_arc JAMO_HEIGHT, jamo, pronunciation
  split_arc JAMO_MNEMONIC_HEIGHT2, arc, mnemonic
end

%q[
  far       mark on the far side of the tree
  up-front  mark on the up-front side of the tree
  before    mark before the first tree
  after     mark after the first tree
  over      mark over the brook
  root      mark at the root of the brook
].split("\n").reject { |line| line == '' }.each do |line|
  _, mnemonic, *phrase = line.split(/\s+/)
  phrase = phrase.join(' ')

  mnemonic = $concept_by_type_and_content.fetch(['jamo-mnemonic', mnemonic])
  phrase = new_concept 'jamo-mnemonic-phrase', phrase, mnemonic.level, false

  arc_n_to_j = $arc_by_from_concept_and_to_concept_type.fetch([mnemonic, 'jamo'])
  split_arc JAMO_MNEMONIC_HEIGHT1, arc_n_to_j, phrase
end

%q[
  20  ㅌ   ㄷ with aspiration    t
].split("\n").reject { |line| line == '' }.each do |line|
  _, level, new_jamo, *new_mnemonic, new_pronunciation = line.split(/\s+/)
  old_jamo = new_mnemonic[0]
  new_mnemonic = new_mnemonic.join(' ')

  old_jamo = $concept_by_type_and_content.fetch(['jamo', old_jamo])
  old_jamo_mnemonic_arc = $arc_by_from_concept_and_to_concept_type.fetch(
    [old_jamo, 'jamo-pronunciation'])
  new_jamo = new_concept 'jamo', new_jamo, level, true
  new_mnemonic = new_concept 'jamo-mnemonic', new_mnemonic, level, false
  new_pronunciation = new_concept 'jamo-pronunciation', new_pronunciation, level,
    false

  arc_j_to_p = new_arc JAMO_MNEMONIC_HEIGHT3, new_jamo, new_pronunciation
  _, arc_n_to_p = split_arc JAMO_MNEMONIC_HEIGHT2, arc_j_to_p, new_mnemonic
  arc_n_to_p.add_part_arcs! [old_jamo_mnemonic_arc]
  reverse_arc(arc_n_to_p).add_part_arcs! [reverse_arc(old_jamo_mnemonic_arc)]
end

JAMO_TO_RRK_VOWELS = {}
lines = %q[
  ㅏ ㅐ ㅑ  ㅒ ㅓ ㅔ ㅕ ㅖ ㅗ ㅘ ㅙ  ㅚ ㅛ ㅜ ㅝ ㅞ ㅟ ㅠ ㅡ ㅢ ㅣ
  a  ae ya yae eo e yeo ye o  wa wae oe yo u  wo we wi yu eu ui i
].split("\n").reject { |line| line == '' }.map { |line| line.strip }
rrk_vowels = lines[1].split(/\s+/)
lines[0].split(/\s+/).each_with_index do |jamo, i|
  JAMO_TO_RRK_VOWELS[jamo] = rrk_vowels[i]
end

JAMO_TO_RRK_INITIALS = {}
JAMO_TO_RRK_FINALS = {}
lines = %q[
  ㄱ  ㄲ  ㄴ  ㄷ  ㄸ  ㄹ  ㅁ  ㅂ  ㅃ  ㅅ  ㅆ  ㅇ  ㅈ  ㅉ  ㅊ  ㅋ  ㅌ  ㅍ  ㅎ
   g  kk  n   d   tt  r   m   b   pp  s   ss  -   j   jj  ch  k   t   p   h
   k   k  n   t   -   l   m   p   -   t    t  ng  t   -    t  k   t   p   t
].split("\n").reject { |line| line == '' }.map { |line| line.strip }
rrk_initials = lines[1].split(/\s+/)
rrk_finals = lines[2].split(/\s+/)
lines[0].split(/\s+/).each_with_index do |jamo, i|
  JAMO_TO_RRK_INITIALS[jamo] = rrk_initials[i].sub('-', '')
  JAMO_TO_RRK_FINALS[jamo]   = rrk_finals[i].sub('-', '')
end

codepoint_name_to_chr = {}
((0x3131..0x3163).to_a).each do |codepoint|
  # for example, "HANGUL LETTER AE" will point to "ㅐ"
  codepoint_name_to_chr[UnicodeUtils.sid(codepoint)] = codepoint.chr('UTF-8')
end

%q[
  뱃맨    Batman
  토토로  Totoro
  모      Mo
  마리오  Mario
].split("\n").reject { |line| line == '' }.each do |line|
  _, word, word_transcription = line.split(/\s+/)
  composition_strings = word.split('')
  compositions = composition_strings.map do |composition_string|
    jamos_decomposed = UnicodeUtils.canonical_decomposition(composition_string)
    jamos = []
    syllable_rrk = []
    jamos_decomposed.split('').each do |jamo_decomposed|
      name = UnicodeUtils.sid(jamo_decomposed.ord)
      match = name.match(/^HANGUL (CHOSEONG|JUNGSEONG|JONGSEONG) (.*)$/)
      if not match
        raise "Name #{name} must start with HANGUL CHOSEONG|JUNGSEONG|JONGSEONG"
      end
      jamo = codepoint_name_to_chr.fetch("HANGUL LETTER #{match[2]}")
      jamo = $concept_by_type_and_content.fetch(['jamo', jamo])
      jamos.push jamo

      rrk = case match[1]
        when 'CHOSEONG'  then JAMO_TO_RRK_INITIALS[jamo.content]
        when 'JUNGSEONG' then JAMO_TO_RRK_VOWELS[jamo.content]
        when 'JONGSEONG' then JAMO_TO_RRK_FINALS[jamo.content]
        else raise "Unexpected character name #{name}"
      end
      syllable_rrk.push rrk
    end

    composition = $concept_by_type_and_content[['composition', composition_string]]
    if composition
      syllable_arc = $arc_by_from_concept_and_to_concept_type.fetch(
        [composition, 'syllable-rrk'])
    else
      max_level = jamos.map { |jamo| jamo.level }.max
      composition = new_concept 'composition', composition_string, max_level, true
      syllable_rrk = syllable_rrk.join()
      syllable_rrk = new_concept 'syllable-rrk', syllable_rrk, max_level, false
      syllable_arc = new_arc COMPOSITION_HEIGHT, composition, syllable_rrk
      jamo_arcs = jamos.map { |jamo|
        $arc_by_from_concept_and_to_concept_type.fetch([jamo, 'jamo-pronunciation'])
      }
      syllable_arc.add_part_arcs! jamo_arcs
      reverse_arc(syllable_arc).add_part_arcs! jamo_arcs.map { |arc| reverse_arc(arc) }
    end
    composition
  end

  max_level = compositions.map { |composition| composition.level }.max
  word = new_concept 'word', word, max_level, true
  word_transcription = new_concept 'word-transcription', word_transcription,
    max_level, false
  word_arc = new_arc WORD_HEIGHT, word, word_transcription
  syllable_arcs = compositions.map { |composition|
    $arc_by_from_concept_and_to_concept_type.fetch([composition, 'syllable-rrk'])
  }
  word_arc.add_part_arcs! syllable_arcs
  reverse_arc(word_arc).add_part_arcs! syllable_arcs.map { |arc| reverse_arc(arc) }
end
