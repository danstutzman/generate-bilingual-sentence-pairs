require 'active_record'
require 'logger'
require 'sqlite3'

#ActiveRecord::Base.logger = Logger.new('debug.log')

class Concept < ActiveRecord::Base
  Concept.inheritance_column = 'inheritance_type'
end

class Arc < ActiveRecord::Base
  def from_concept
    $concept_by_id[self.from_concept_id]
  end

  def to_concept
    $concept_by_id[self.to_concept_id]
  end

  def add_part_arcs! new_part_arcs
    new_part_arc_ids = new_part_arcs.map { |arc| arc.id }
    if self.part_arc_ids.nil?
      self.part_arc_ids = new_part_arc_ids.join(',')
    else
      self.part_arc_ids = [arc.part_arc_ids.split(',') + new_part_arc_ids].join(',')
    end
  end
end

class Prompt < ActiveRecord::Base
end

def connect_to_db! drop_and_create_tables
  ActiveRecord::Base.establish_connection({
    adapter: 'sqlite3',
    database: 'test.db',
  })

  if drop_and_create_tables
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

    db.execute 'drop table if exists prompts'
    db.execute 'create table if not exists prompts(
      id                integer primary key not null,
      from_concept_type varchar not null,
      to_concept_type   varchar not null,
      content           varchar not null
    )'
  end

  $concept_by_id = {}
  $concept_by_type_and_content = {}
  for concept in Concept.all
    $concept_by_id[concept.id] = concept
    $concept_by_type_and_content[[concept.type, concept.content]] = concept
  end

  $arc_by_id = {}
  $arc_by_from_concept_and_to_concept_type = {}
  for arc in Arc.all
    $arc_by_id[arc.id] = arc
    $arc_by_from_concept_and_to_concept_type[
      [arc.from_concept, arc.to_concept.type]] = arc
  end

  $prompt_by_from_and_to_concept_types = {}
  for prompt in Prompt.all
    $prompt_by_from_and_to_concept_types[
      [prompt.from_concept_type, prompt.to_concept_type]] = prompt
  end
end

$next_id = 0
def next_id
  $next_id += 1
end

$new_concepts = []
def new_concept type, content, level, is_l2_script
  concept = Concept.new id: next_id,
    type: type, content: content, level: level,
    is_l2_script: is_l2_script
  $concept_by_id[concept.id] = concept
  $concept_by_type_and_content[[type, content]] = concept
  $new_concepts.push concept
  concept
end

$new_arcs = []
def new_arc height, from, to
  level = [from.level, to.level].max

  arc1 = Arc.new id: next_id,
    from_concept_id: from.id,
    to_concept_id: to.id,
    height: height,
    level: level,
    is_from_l2_script: from.is_l2_script,
    is_to_l2_script: to.is_l2_script,
    was_correct: true
  $arc_by_id[arc1.id] = arc1
  $arc_by_from_concept_and_to_concept_type[
    [arc1.from_concept, arc1.to_concept.type]] = arc1
  $new_arcs.push arc1

  arc2 = Arc.new id: next_id,
    from_concept_id: to.id,
    to_concept_id: from.id,
    height: height,
    level: level,
    is_from_l2_script: to.is_l2_script,
    is_to_l2_script: from.is_l2_script,
    was_correct: true
  $arc_by_id[arc2.id] = arc2
  $arc_by_from_concept_and_to_concept_type[
    [arc2.from_concept, arc2.to_concept.type]] = arc2
  $new_arcs.push arc2

  arc1
end

$new_prompts = []
def new_prompt from_concept_type, to_concept_type, content
  prompt = Prompt.new({
    id:                next_id,
    from_concept_type: from_concept_type,
    to_concept_type:   to_concept_type,
    content:           content,
  })
  $prompt_by_from_and_to_concept_types[
    [prompt.from_concept_type, prompt.to_concept_type]] = prompt
  $new_prompts.push prompt
  prompt
end

def reverse_arc arc
  $arc_by_from_concept_and_to_concept_type.fetch(
    [arc.to_concept, arc.from_concept.type])
end

def split_arc height, arc, middle_concept, both_ways
  arc1 = new_arc height, arc.from_concept, middle_concept
  arc2 = new_arc height, middle_concept, arc.to_concept
  arc.add_part_arcs! [arc1, arc2]
  if both_ways
    reverse_arc(arc).add_part_arcs! [reverse_arc(arc2), reverse_arc(arc1)]
  end
  [arc1, arc2]
end

def persist_to_db!
  db = ActiveRecord::Base.connection

  File.open('persist.sql', 'w') do |file|
    file.write "begin;\n"

    $new_concepts.each do |concept|
      file.write "insert into concepts
        (id, type, content, level, is_l2_script)
        values (%s);\n" % [concept.id, concept.type, concept.content, concept.level,
          concept.is_l2_script].map { |value| db.quote(value) }.join(',')
    end

    $new_arcs.each do |arc|
      file.write "insert into arcs
        (id, from_concept_id, to_concept_id, is_from_l2_script, is_to_l2_script,
        height, part_arc_ids, was_correct, level)
        values (%s);\n" % [arc.id, arc.from_concept_id, arc.to_concept_id,
        arc.is_from_l2_script, arc.is_to_l2_script, arc.height,
        arc.part_arc_ids, arc.was_correct, arc.level].map { |value|
        db.quote(value) }.join(',')
    end

    $new_prompts.each do |prompt|
      file.write "insert into prompts
        (id, from_concept_type, to_concept_type, content)
        values (%s);\n" % [prompt.id, prompt.from_concept_type,
        prompt.to_concept_type, prompt.content].map { |value| db.quote(value)
        }.join(',')
    end

    file.write "commit;\n"
  end
  `cat persist.sql | sqlite3 test.db`
  File.delete('persist.sql')
end
