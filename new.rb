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

  def initialize
    self.arc_id = $next_arc_id
    $next_arc_id += 1
  end
  def inspect
    values = ($arc_features - [:arc_type]).map { |feature|
      self.send(feature)
    }.compact.join(',')
    "#{self.arc_type}(%s)" % values
  end
end

def read_data(base_dir)
  arc_type_to_arcs = {}
  Dir.entries(base_dir).each do |filename|
    next if %w[. ..].include?(filename)
    next unless filename.end_with?('.txt')
    arc_type = filename.split('.')[0].sub(/xes$/, 'xs').sub(/s$/, '')
    path = "#{base_dir}/#{filename}"
  
    arcs = []
    File.open path do |file|
      headers = file.readline.strip
      file.each_line do |line|
        arc = Arc.new
        arc.arc_type = arc_type
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
      end
    end
    arc_type_to_arcs[arc_type] = arcs
  end
  arc_type_to_arcs
end

def escape s
  if s.nil?
    'null'
  else
    "'%s'" % s.to_s.gsub("'", "''")
  end
end

$data = read_data(File.dirname(__FILE__) + '/data/es')

def choose(list)
  raise "No choices" if list.size == 0
  list[rand(list.size)]
end

$data['noun_phrase'] = []
while $data['noun_phrase'].size < 6
  determiner = choose($data['determiner'])
  noun = choose($data['noun'].select { |noun| noun.gender == determiner.gender })
  arc = Arc.new
  arc.arc_type = 'noun_phrase'
  arc.child_arc_ids = [determiner.arc_id, noun.arc_id].join(',')
  if determiner.number == '1'
    arc.l1 = "#{determiner.l1} #{noun.l1}"
    arc.l2 = "#{determiner.l2} #{noun.l2}"
  elsif determiner.number == '2'
    arc.l1 = "#{determiner.l1} #{noun.l1}s"
    arc.l2 = "#{determiner.l2} #{noun.l2}s"
  else raise "Unknown number #{determiner.number}"
  end
  unless $data['noun_phrase'].find { |np| np.l1 == arc.l1 && np.l2 == arc.l2 }
    $data['noun_phrase'].push arc
  end
end

File.open 'persist.sql', 'w' do |file|
  column_names = $arc_features.join(', ')
  column_definitions = $arc_features.map { |col| "#{col} varchar" }.join(",\n")
  file.write "drop table if exists arcs;\n"
  file.write "create table if not exists arcs (arc_id int not null,
    child_arc_ids varchar,
    #{column_definitions});\n"
  for arc_type, arcs in $data
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
