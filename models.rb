require 'active_record'
require 'sqlite3'
require 'logger'

#ActiveRecord::Base.logger = Logger.new('debug.log')

ActiveRecord::Base.establish_connection({
  adapter: 'sqlite3',
  database: 'test.db',
})

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
    self.save!
  end
end

$concept_by_id = {}
for concept in Concept.all
  $concept_by_id[concept.id] = concept
end

$arc_by_id = {}
for arc in Arc.all
  $arc_by_id[arc.id] = arc
end
