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
    $concept_id_to_concept[self.from_concept_id]
  end

  def to_concept
    $concept_id_to_concept[self.to_concept_id]
  end
end

$concept_id_to_concept = {}
for concept in Concept.all
  $concept_id_to_concept[concept.id] = concept
end

$arc_id_to_arc = {}
for arc in Arc.all
  $arc_id_to_arc[arc.id] = arc
end
