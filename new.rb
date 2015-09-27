require 'json'
require 'pp'

$arc_features = %i[l1 l2 arc_type gender number kind_of_verb tense person suffix
  infinitive conjugation stem is_writing is_person is_countable is_object question
  l1_past
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
$arc_type_to_l2_to_arc = {}
def read_data(base_dir)
  Dir.entries(base_dir).each do |filename|
    next if %w[. ..].include?(filename)
    next unless filename.end_with?('.txt')
    arc_type = filename.split('.')[0].sub(/xes$/, 'xs').sub(/s$/, '')
    path = "#{base_dir}/#{filename}"
  
    arcs = []
    l2_to_arc = {}
    File.open path do |file|
      headers = file.readline.strip
      file.each_line do |line|
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
        arcs.push arc
        l2_to_arc[arc.l2] = arc if arc.l2
      end
    end
    $arc_type_to_arcs[arc_type] = arcs
    $arc_type_to_l2_to_arc[arc_type] = l2_to_arc
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

$arc_type_to_arcs['noun_phrase'] = []
while $arc_type_to_arcs['noun_phrase'].size < 6
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
  unless $arc_type_to_arcs['noun_phrase'].find {
      |np| np.l1 == arc.l1 && np.l2 == arc.l2 }
    $arc_type_to_arcs['noun_phrase'].push arc
  end
end

$arc_type_to_arcs['conjugated_verb'] = []
for irregular in $arc_type_to_arcs['l2_irregular_conjugation']
  verb = $arc_type_to_l2_to_arc['verb'][irregular.infinitive]
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
  p arc
  $arc_type_to_arcs['conjugated_verb'].push arc
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
