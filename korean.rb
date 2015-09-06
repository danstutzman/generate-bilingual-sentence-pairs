require './models'

arcs_to_review = $arc_by_id.values.select { |arc| !arc.was_correct }
if arcs_to_review.size == 0
  raise "No failed cards to review"
end
p ['arcs_to_review'] + arcs_to_review.map { |arc|
  $concept_by_id.fetch(arc[:to_concept_id]).content
}

# prefer harder if correct, or easier if incorrect, where harder means:
# - arcs with greater level
# - arcs with greater height
# - arcs to l2
# - arcs from l2
arcs_sorted = $arc_by_id.values.sort_by { |arc|
  was_correct = arc.was_correct ? 1 : -1
  [
    was_correct,
    was_correct * -arc.level,
    was_correct * -arc.height,
    was_correct * (arc.is_to_l2_script ? -1 : 1),
    was_correct * (arc.is_from_l2_script ? -1 : 1),
    rand,
  ]
}
arc = arcs_sorted.first

case [arc.from_concept.type, arc.to_concept.type]
  when ['jamo', 'jamo-mnemonic']
    puts 'Think of the mnemonic word for:'
  when ['jamo-pronunciation', 'jamo']
    puts 'Write the jamo for the sound:'
  when ['jamo-pronunciation', 'composition']
    puts 'Write the hangul for the sounds:'
  when ['jamo-pronunciation', 'jamo-mnemonic']
    puts 'Think of the mnemonic word for the sound:'
  when ['jamo-mnemonic', 'jamo']
    puts 'Write the jamo for the mnemonic word:'
  when ['jamo-mnemonic', 'jamo-pronunciation']
    puts 'Say the sound intended by the mnemonic word:'
  when ['jamo-mnemonic', 'jamo-mnemonic-phrase']
    puts "Think of the phrase for the mnemonic word:"
  when ['jamo-mnemonic-phrase', 'jamo-mnemonic']
    puts 'Isolate the key word in the mnemonic phrase:'
  when ['jamo-mnemonic-phrase', 'jamo']
    puts 'Write the jamo for the mnemonic phrase:'
  when ['jamo', 'jamo-pronunciation']
    puts 'Say the sound that this jamo makes'
  when ['composition', 'sound']
    puts 'Read this character aloud'
  when ['l1_transliteration', 'l2_word']
    puts 'Write the hanguls for the word:'
  when ['l2_word', 'l1_transliteration']
    puts 'Read this word aloud:'
  when ['composition', 'syllable-rrk']
    puts 'Read this syllable aloud:'
  when ['syllable-rrk', 'composition']
    puts 'Write the hangul for the syllable:'
  when ['word', 'word-transcription']
    puts 'Read this word aloud:'
  when ['word-transcription', 'word']
    puts 'Write the hanguls for the transcription:'
  when ['word', 'word-translation']
    puts 'Say the English translation aloud:'
  when ['word-translation', 'word']
    puts 'Write this word in Korean:'
  when ['word-translation', 'word-mnemonic']
    puts 'Translate this word to Korean:'
  when ['word-translation', 'word-transcription']
    puts 'Translate this word to Romanized Korean:'
  when ['word-transcription', 'word-translation']
    puts 'Translate the Romanized Korean:'
  when ['word-mnemonic', 'word-translation']
    puts 'Extract the translation part out of the mnemonic:'
  else
    raise "Don't know how to ask for #{arc.from_concept.type}, #{arc.to_concept.type}"
end
puts "   #{arc.from_concept.content}"
puts "Press enter to show answer."
readline

puts "The answer is:"
puts "   #{arc.to_concept.content}"
puts "Got it right? (y/n)"
arc.was_correct = (readline.strip == 'y')
arc.save!

def ask_about_part_arcs(arc)
  if arc.part_arc_ids != nil
    puts "Which part arc(s) did you get wrong? (Separate numbers with commas)"
    for part_arc_id in arc.part_arc_ids.split(',')
      part_arc = $arc_by_id.fetch(part_arc_id.to_i)
      puts "  #{part_arc_id}. #{part_arc.from_concept.content} -> " +
        "#{part_arc.to_concept.content}"
    end
    part_arc_ids_to_review = readline.split(',').map { |id| id.to_i }
    if part_arc_ids_to_review != [0]
      for part_arc_id in part_arc_ids_to_review
        part_arc = $arc_by_id.fetch(part_arc_id)
        part_arc.was_correct = false
        part_arc.save!
        ask_about_part_arcs part_arc
      end
    end
  end
end

if not arc.was_correct
  ask_about_part_arcs arc
end
