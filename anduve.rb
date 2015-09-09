require 'json'
require 'pp'

def unify in1, in2
  out = in1.clone
  for feature_name, feature_value in in2
    case in1[feature_name]
      when nil           then out[feature_name] = feature_value
      when feature_value then nil
      else raise "Can't unify #{in1} and #{in2}"
    end
  end
  out
end

def apply_rules verb, rules
  out = verb.clone
  for rule in rules
    rule_matches = true
    for feature_name, required_feature_value in rule['if']
      if out[feature_name.intern] != required_feature_value
        rule_matches = false
      end
    end
    for feature_name, prohibited_feature_value in (rule['unless'] || {})
      if out[feature_name.intern] == prohibited_feature_value
        rule_matches = false
      end
    end
  
    if rule_matches
      out = unify out, rule['then']
    end
  end
  out
end

verb1 = {
  'infinitive' => 'andar',
  'number' => 'singular',
  'tense' => 'preterite',
  'person' => 'first',
}
verb2 = {
  'infinitive' => 'comprar',
  'number' => 'singular',
  'tense' => 'preterite',
  'person' => 'first',
}

rules = JSON.load('[
  { "if":     { "infinitive": "andar", "tense": "preterite" },
    "then":   { "irregular": "true" } },
  { "if":     { "infinitive": "andar", "irregular": "true" },
    "then":   { "stem": "anduv-" } },
  { "if":     { "irregular": "true", "tense": "preterite",
                "number": "singular", "person": "first" },
    "then":   { "ending": "-e" } },
  { "if":     { "tense": "preterite", "number": "singular", "person": "first" },
    "unless": { "irregular": "true" },
    "then":   { "ending": "-é" } }
]')

pp apply_rules(verb1, rules)
pp apply_rules(verb2, rules)
