require 'pp'
require 'sqlite3'
require 'yaml'

yaml = YAML::load(File.read('content.yaml'))
string_to_concept = {}
arcs = []

def reverse(arc, arcs, reverse_parts)
  new_arc = {
    id:              arcs.size + 1,
    from_concept_id: arc[:to_concept_id],
    to_concept_id:   arc[:from_concept_id],
    part_arc_ids:    (arc[:part_arc_ids] || []).map { |part_arc_id|
      part_arc = arcs.find { |found_arc| found_arc[:id] == part_arc_id }
      arcs.find { |found_arc|
        found_arc[:from_concept_id] == part_arc[:to_concept_id] &&
        found_arc[:to_concept_id]   == part_arc[:from_concept_id]
      }[:id]
    }
  }
  new_arc[:part_arc_ids].reverse! if reverse_parts
  new_arc.reject { |key, value| key == :part_arc_ids && value == [] }
end

for sequence in yaml['mnemonics']
  for string in sequence
    unless string_to_concept[string]
      if string == sequence.first
        type = 'jamo'
      elsif string == sequence.last
        type = 'sound'
      else
        type = 'mnemonic'
      end
      string_to_concept[string] = {
        id:      string_to_concept.size + 1,
        type:    type,
        content: string,
      }
    end
  end

  part_arc_ids = []
  if sequence.size > 2
    0.upto(sequence.size - 2) do |i|
      new_arc = {
        id:              arcs.size + 1,
        from_concept_id: string_to_concept[sequence[i]][:id],
        to_concept_id:   string_to_concept[sequence[i + 1]][:id],
      }
      part_arc_ids.push new_arc[:id]
      arcs.push new_arc
      arcs.push reverse(new_arc, arcs, true)
    end
  end
  new_arc = {
    id:              arcs.size + 1,
    from_concept_id: string_to_concept[sequence.first][:id],
    to_concept_id:   string_to_concept[sequence.last][:id],
    part_arc_ids:    part_arc_ids,
  }
  arcs.push new_arc
  arcs.push reverse(new_arc, arcs, true)
end

for composition, position_to_jamo in yaml['compositions']
  raise if string_to_concept[composition]
  string_to_concept[composition] = {
    id:      string_to_concept.size + 1,
    type:    'composition',
    content: composition,
  }

  #puts "#{composition} => #{position_to_jamo.values().join(' and ')}"

  sounds = []
  part_arc_ids = []
  for position, jamo in position_to_jamo
    jamo_concept_id = string_to_concept[jamo][:id]
    #new_arc = {
    #  id:              arcs.size + 1,
    #  from_concept_id: string_to_concept[composition][:id],
    #  to_concept_id:   jamo_concept_id,
    #}
    #arcs.push new_arc
    #arcs.push reverse(new_arc, arcs)
    #part_arc_ids.push new_arc[:id]

    if not string_to_concept.has_key?(jamo)
      raise "Can't find concept for jamo #{jamo}"
    end
    jamo_to_sound_arc = arcs.find { |arc|
      arc[:from_concept_id] == jamo_concept_id && arc[:part_arc_ids] }
    part_arc_ids.push jamo_to_sound_arc[:id]

    sound_concept = string_to_concept.values.find { |concept|
      concept[:id] == jamo_to_sound_arc[:to_concept_id]
    }
    if sound_concept.nil?
      raise "Couldn't find 'to' concept for #{jamo_to_sound_arc}"
    end
    sound_content = sound_concept[:content]
    if match = sound_content.match(/^(.*) sound$/)
      sounds.push(match[1])
    else
      raise "Expected #{sound_content} to end with 'sound'"
    end
  end

  all_sounds = sounds.join
  raise if string_to_concept[all_sounds]
  string_to_concept[all_sounds] = {
    id:      string_to_concept.size + 1,
    type:    'sound',
    content: all_sounds,
  }

  new_arc = {
    id:              arcs.size + 1,
    from_concept_id: string_to_concept[composition][:id],
    to_concept_id:   string_to_concept[all_sounds][:id],
    part_arc_ids:    part_arc_ids,
  }
  arcs.push new_arc
  arcs.push reverse(new_arc, arcs, false)
end

#pp string_to_concept.values
#pp arcs

db = SQLite3::Database.new 'test.db'

db.execute 'drop table if exists concepts'
db.execute 'create table if not exists concepts(
  id      integer primary key not null,
  type    varchar not null,
  content varchar not null
)'
for concept in string_to_concept.values
  db.execute 'insert into concepts values (?, ?, ?)',
    concept[:id], concept[:type], concept[:content]
end

db.execute 'drop table if exists arcs'
db.execute 'create table if not exists arcs(
  id              integer primary key not null,
  from_concept_id integer not null,
  to_concept_id   integer not null,
  part_arc_ids    varchar
)'
for arc in arcs
  db.execute 'insert into arcs values (?, ?, ?, ?)',
    arc[:id], arc[:from_concept_id], arc[:to_concept_id],
    arc[:part_arc_ids] && arc[:part_arc_ids].join(',')
end
