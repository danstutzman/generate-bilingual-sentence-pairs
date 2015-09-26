require 'active_record'
require 'logger'
require 'sqlite3'

#ActiveRecord::Base.logger = Logger.new('debug.log')

class Concept < ActiveRecord::Base
  Concept.inheritance_column = 'inheritance_type'
end

class Arc < ActiveRecord::Base
  belongs_to :from_concept, class_name: 'Concept'
  belongs_to :to_concept, class_name: 'Concept'
end

class Prompt < ActiveRecord::Base
end

def connect_to_db! drop_and_create_tables
  ActiveRecord::Base.establish_connection({
    adapter: 'sqlite3',
    database: 'test.db',
  })
end
