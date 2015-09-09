require 'pp'
require './models'

VOCAB_HEIGHT = 1

connect_to_db! true

new_prompt 'noun_l1', 'noun_l2', 'Translate to Spanish:'
new_prompt 'noun_l2', 'noun_l1', 'Translate to English:'

%q[
  1 money  dinero
  2 jacket chaqueta
].split("\n").reject { |line| line == '' }.each do |line|
  _, level, noun_l1, noun_l2 = line.split(/\s+/)
  noun_l1 = new_concept 'noun_l1', noun_l1, level, false
  noun_l2 = new_concept 'noun_l2', noun_l2, level, true
  arc = new_arc VOCAB_HEIGHT, noun_l1, noun_l2
end
