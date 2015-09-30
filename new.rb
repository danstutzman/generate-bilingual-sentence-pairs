require 'json'
require 'pp'

$arc_features = %i[l1 l2 arc_type gender number kind_of_verb tense person suffix
  infinitive conjugation stem is_writing is_person is_countable is_object question
  l1_past agent_is_person
]

$next_arc_id = 1

class Arc
  attr_accessor :arc_id, :child_arc_ids
  attr_accessor *$arc_features

  def initialize arc_type
    self.arc_id = $next_arc_id
    $next_arc_id += 1
    self.arc_type = arc_type
  end
  def inspect
    values = ($arc_features - [:arc_type]).map { |feature|
      self.send(feature)
    }.compact.join(',')
    "#{self.arc_type}(%s)" % values
  end
end

$arc_type_to_arcs = {}
$arc_type_to_l1_to_arc = {}
$arc_type_to_l2_to_arc = {}
def add_arc arc
  arc_type = arc.arc_type

  $arc_type_to_arcs[arc_type] ||= []
  $arc_type_to_arcs[arc_type].push arc

  if arc.l1
    $arc_type_to_l1_to_arc[arc_type] ||= {}
    $arc_type_to_l1_to_arc[arc_type][arc.l1] = arc
  end

  if arc.l2
    $arc_type_to_l2_to_arc[arc_type] ||= {}
    $arc_type_to_l2_to_arc[arc_type][arc.l2] = arc
  end
end

def read_data(base_dir)
  Dir.entries(base_dir).each do |filename|
    next if %w[. ..].include?(filename)
    next unless filename.end_with?('.txt')
    arc_type = filename.split('.')[0].sub(/xes$/, 'xs').sub(/s$/, '')
    path = "#{base_dir}/#{filename}"
  
    File.open path do |file|
      headers = file.readline.strip
      file.each_line do |line|
        next if line.start_with?('#')
        arc = Arc.new arc_type
        headers.split('|').each_with_index do |header_part, i|
          line_part = line.strip.split('|')[i].strip
          if header_part.strip.match(/\s+/)
            header_part.strip.split(/\s+/).each_with_index do |header_part2, j|
              key = header_part2.strip.intern
              value = line_part.split(/\s+/)[j].strip
              arc.send "#{key}=", value
            end
          else
            key = header_part.strip
            arc.send "#{key}=", line_part
          end
        end
        add_arc arc
      end
    end
  end
end

def escape s
  if s.nil?
    'null'
  else
    "'%s'" % s.to_s.gsub("'", "''")
  end
end

read_data(File.dirname(__FILE__) + '/data/es')

def choose(list)
  raise "No choices" if list.size == 0
  list[rand(list.size)]
end

while ($arc_type_to_arcs['noun_phrase'] || []).size < 6
  determiner = choose($arc_type_to_arcs['determiner'])
  noun = choose($arc_type_to_arcs['noun'].select {
    |noun| noun.gender == determiner.gender })
  arc = Arc.new 'noun_phrase'
  arc.child_arc_ids = [determiner.arc_id, noun.arc_id].join(',')
  if determiner.number == '1'
    arc.l1 = "#{determiner.l1} #{noun.l1}"
    arc.l2 = "#{determiner.l2} #{noun.l2}"
  elsif determiner.number == '2'
    arc.l1 = "#{determiner.l1} #{noun.l1}s"
    arc.l2 = "#{determiner.l2} #{noun.l2}s"
  else raise "Unknown number #{determiner.number}"
  end
  add_arc arc unless ($arc_type_to_l1_to_arc['noun_phrase'] || {})[arc.l1]
end

for irregular in $arc_type_to_arcs['l2_irregular_conjugation']
  verb = $arc_type_to_l2_to_arc['verb'].fetch(irregular.infinitive)
  arc = Arc.new 'conjugated_verb'
  if irregular.tense == 'pres'
    arc.l1 = "#{verb.l1}(#{irregular.person},#{irregular.number})"
  elsif irregular.tense == 'pret'
    arc.l1 = "#{verb.l1_past}(#{irregular.person},#{irregular.number})"
  else raise "Unknown tense #{irregular.tense}"
  end
  arc.l2 = irregular.conjugation
  arc.tense, arc.person, arc.number =
    irregular.tense, irregular.person, irregular.number
  arc.child_arc_ids = [verb.arc_id, irregular.arc_id].join(',')
  add_arc arc
end

for stem in $arc_type_to_arcs['l2_irregular_stem']
  verb = $arc_type_to_l2_to_arc['verb'].fetch(stem.infinitive)
  for pattern in $arc_type_to_arcs['l2_conjugation_pattern']
    if stem.tense == 'pres' && pattern.tense == 'pres'
      if pattern.kind_of_verb == '-ar verb' && stem.infinitive.end_with?('ar') ||
         pattern.kind_of_verb == '-er verb' && stem.infinitive.end_with?('er') ||
         pattern.kind_of_verb == '-ir verb' && stem.infinitive.end_with?('ir') ||
         pattern.kind_of_verb == '-er and -ir verbs' &&
           (stem.infinitive.end_with?('er') || stem.infinitive.end_with?('ir'))
        arc = Arc.new 'conjugated_verb'
        arc.l1 = "#{verb.l1}(#{pattern.person},#{pattern.number})"
        next if $arc_type_to_l1_to_arc['conjugated_verb'][arc.l1]
        next if pattern.person == '1' && pattern.number == '2'
        arc.l2 = stem.stem.sub(/-$/, '') + pattern.suffix.sub(/^-/, '')
        arc.person = pattern.person
        arc.number = pattern.number
        arc.tense = pattern.tense
        arc.child_arc_ids = [stem.arc_id, pattern.arc_id]
        add_arc arc
      end
    elsif stem.tense == 'pret' && pattern.tense == 'pret' &&
        pattern.kind_of_verb == 'irregular preterite'
      arc = Arc.new 'conjugated_verb'
      arc.l1 = "#{verb.l1_past}(#{pattern.person},#{pattern.number})"
      arc.l2 = stem.stem.sub(/-$/, '') + pattern.suffix.sub(/^-/, '')
      arc.person = pattern.person
      arc.number = pattern.number
      arc.tense = pattern.tense
      arc.child_arc_ids = [stem.arc_id, pattern.arc_id]
      add_arc arc
    end
  end
end

for verb in $arc_type_to_arcs['verb']
  for pattern in $arc_type_to_arcs['l2_conjugation_pattern']
    if pattern.kind_of_verb == '-ar verb' && verb.l2.end_with?('ar') ||
       pattern.kind_of_verb == '-er verb' && verb.l2.end_with?('er') ||
       pattern.kind_of_verb == '-ir verb' && verb.l2.end_with?('ir') ||
       pattern.kind_of_verb == '-er and -ir verbs' &&
         (verb.l2.end_with?('er') || verb.l2.end_with?('ir'))
      arc = Arc.new 'conjugated_verb'
      if pattern.tense == 'pres'
        arc.l1 = "#{verb.l1}(#{pattern.person},#{pattern.number})"
      elsif pattern.tense == 'pret'
        arc.l1 = "#{verb.l1_past}(#{pattern.person},#{pattern.number})"
      end
      next if $arc_type_to_l1_to_arc['conjugated_verb'][arc.l1]
      arc.l2 = verb.l2[0...-2] + pattern.suffix.sub(/^-/, '')
      arc.person = pattern.person
      arc.number = pattern.number
      arc.tense = pattern.tense
      add_arc arc
    end
  end
end

def decorate_sentence string
  string[0].upcase + string[1..-1] + '.'
end

while ($arc_type_to_arcs['sentence'] || []).size < 6
  verb_phrase = choose($arc_type_to_arcs['verb_phrase'])
  l1_words = verb_phrase.l1.split(' ')
  l2_words = verb_phrase.l2.split(' ')
  verb = $arc_type_to_l2_to_arc['verb'][l2_words[0]]
  verb = verb.dup
  tense = choose(%w[pres pret])
  person, number = choose([%w[1 1], %w[2 1], %w[3 1], %w[1 2], %w[3 2]])
  if tense == 'pres'
    l1 = "#{verb.l1}(#{person},#{number})"
  elsif tense == 'pret'
    l1 = "#{verb.l1_past}(#{person},#{number})"
  end
  conjugated_verb = $arc_type_to_l1_to_arc['conjugated_verb'][l1]
  l2_words[0] = conjugated_verb.l2
  if [person, number] == %w[1 1]
    l1_words[0] = 'I'
  elsif [person, number] == %w[2 1]
    l1_words[0] = 'you'
  elsif [person, number] == %w[3 1]
    l1_words[0] = 'he/she'
  elsif [person, number] == %w[1 2]
    l1_words[0] = 'we'
  elsif [person, number] == %w[3 2]
    l1_words[0] = 'they'
  end
  if tense == 'pret'
    l1_words[1] = verb.l1_past
  elsif tense == 'pres'
    # even the word is already in pres, replace in case it's ambiguous past vs. pres
    if verb.l1 == 'be'
      l1_words[1] = {
        %w[1 1] => 'am',
        %w[2 1] => 'are',
        %w[3 1] => 'is',
        %w[1 2] => 'are',
        %w[3 2] => 'are',
      }[[person, number]]
    elsif [person, number] == %w[3 1]
      l1_words[1] = verb.l1 + 's'
    else
      l1_words[1] = verb.l1 # in case it's ambiguous past vs. pres
    end
  end

  if l2_words.include?('algo')
    object = choose($arc_type_to_arcs['noun'].select { |noun| noun.is_writing == 'T' })
    object = object.dup
    object_number, add_determiner = choose([['1', true], ['2', true], ['2', false]])
    if add_determiner
      determiner = choose($arc_type_to_arcs['determiner'].select { |determiner|
        determiner.gender == object.gender && determiner.number == object_number })
      object.l1 = "#{determiner.l1} #{object.l1}"
      object.l2 = "#{determiner.l2} #{object.l2}"
    end
    if object_number == '2'
      object.l1 += 's'
      object.l2 += 's'
    end
    l2_words.map! { |word| (word == 'algo') ?  object.l2 : word }
    l1_words.map! { |word| (word == 'something') ?  object.l1 : word }
  end
  sentence = Arc.new 'sentence'
  sentence.l1 = decorate_sentence(l1_words.join(' '))
  sentence.l2 = decorate_sentence(l2_words.join(' '))
  p sentence
  add_arc sentence
end

File.open 'persist.sql', 'w' do |file|
  column_names = $arc_features.join(', ')
  column_definitions = $arc_features.map { |col| "#{col} varchar" }.join(",\n")
  file.write "drop table if exists arcs;\n"
  file.write "create table if not exists arcs (arc_id int not null,
    child_arc_ids varchar,
    #{column_definitions});\n"
  for arc_type, arcs in $arc_type_to_arcs
    for arc in arcs
      file.write "insert into arcs (arc_id, child_arc_ids, arc_type, #{column_names})
        values (%s);\n" % 
        ([escape(arc.arc_id), escape(arc.child_arc_ids), escape(arc_type)] +
        $arc_features.map { |col| escape(arc.send(col))
        }).join(', ')
    end
  end
end
`rm -f test.db`
`cat persist.sql | sqlite3 test.db`
File.delete('persist.sql')
