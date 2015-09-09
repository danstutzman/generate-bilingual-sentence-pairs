require './models'

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

connect_to_db! false

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

while arcs_sorted.size > 0
  arc = arcs_sorted.shift
  content_types = [arc.from_concept.type, arc.to_concept.type]
  prompt = $prompt_by_from_and_to_concept_types[content_types]
  if prompt.nil?
    raise "Don't know how to ask for #{content_types.inspect}"
  end

  puts prompt.content
  puts "   #{arc.from_concept.content}"
  puts "Press enter to show answer."
  readline

  puts "The answer is:"
  puts "   #{arc.to_concept.content}"
  puts "Got it right? (y/n)"
  arc.was_correct = (readline.strip == 'y')
  arc.save!

  if not arc.was_correct
    ask_about_part_arcs arc
  end
end
