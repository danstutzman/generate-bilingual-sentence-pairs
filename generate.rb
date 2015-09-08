require 'pp'

def one_of(list)
  list[rand(list.size)]
end

def to_sentence(words)
  if words[0][0] == '('
    words[0] = '(' + words[0][1].upcase + words[0][2..-1]
  else
    words[0] = words[0][0].upcase + words[0][1..-1]
  end
  words[0...-1].join(' ') + words[-1]
end

def choose_agent
  l1, l2, features = one_of([
    ['I',         'yo', {gender:'?', person:1, number:'S', question:false}],
    ['I',          nil, {gender:'?', person:1, number:'S', question:false}],
    ['you',       'tu', {gender:'?', person:2, number:'S', question:false}],
    ['you',        nil, {gender:'?', person:2, number:'S', question:false}],
    ['he',        'el', {gender:'M', person:3, number:'S', question:false}],
    ['she',     'ella', {gender:'F', person:3, number:'S', question:false}],
    ['it',        'el', {gender:'N', person:3, number:'S', question:false}],
    ['it',      'ella', {gender:'N', person:3, number:'S', question:false}],
    ['we',  'nosotros', {gender:'?', person:1, number:'P', question:false}],
    ['we',         nil, {gender:'?', person:1, number:'P', question:false}],
    ['they',   'ellos', {gender:'?', person:3, number:'P', question:false}],
    ['they',   'ellas', {gender:'?', person:3, number:'P', question:false}],
    ['they',       nil, {gender:'?', person:3, number:'P', question:false}],
    ['who',    'quien', {gender:'N', person:3, number:'S', question:true}],
  ])
  [[l1], l2 ? [l2] : [], features]
end

def choose_object(features)
  new_features = { question: false }
  if features[:reflexive]
    l1, l2 = if features[:person] == 1 && features[:number] == 'S'
      ['myself', 'me']
    elsif features[:person] == 2 && features[:number] == 'S'
      ['yourself', 'te']
    elsif features[:person] == 3 && features[:number] == 'S'
      case features[:gender]
        when 'M' then ['himself',    'se']
        when 'F' then ['herself',    'se']
        when 'N' then ['itself',     'se']
        else raise "Unknown gender #{features[:gender]}"
      end
    elsif features[:person] == 1 && features[:number] == 'P'
      ['ourselves', 'nos']
    elsif features[:person] == 2 && features[:number] == 'P'
      ['yourselves', 'vos']
    elsif features[:person] == 3 && features[:number] == 'P'
      ['themselves', 'se']
    end
    [[l1], [l2], new_features]
  elsif features[:prefix_pronoun]
    choices = []
    pair = [features[:person], features[:number]]
    if pair != [1, 'S'] then choices.push ['me',  'me'] end
    if pair != [2, 'S'] then choices.push ['you', 'te'] end
    choices.push ['him', 'le'] # can't be sure it's reflexive
    choices.push ['her', 'le'] # can't be sure it's reflexive
    choices.push ['it',  'le'] # can't be sure it's reflexive
    if pair != [1, 'P'] then choices.push ['us',  'nos'] end
    if pair != [3, 'P'] then choices.push ['them','les'] end
    l1, l2 = one_of(choices)
    [[l1], [l2], new_features]
  else
    one_of([
      [['money'], ['dinero'], {question:false}],
      [['a', 'jacket'], ['una', 'chaqueta'], {question:false}],
      [['whom'], ['a', 'quien'], {question:true}],
    ])
  end
end

def conjugate_l2_verb(l2, features)
  selector = [features[:person], features[:number], l2[-2..-1]]
  if features[:infinitive]
    return l2
  else
    l2_base = l2[0...-2]
    unless features[:person] == 1 && features[:number] == 'P'
      l2_base = case l2
        when 'querer' then 'quier'
        when 'probar' then 'prueb'
        else l2_base
      end
    end
    l2_conjugated = case selector
      when [1, 'S', 'ar'] then l2_base + 'o'
      when [2, 'S', 'ar'] then l2_base + 'as'
      when [3, 'S', 'ar'] then l2_base + 'a'
      when [1, 'P', 'ar'] then l2_base + 'amos'
      when [3, 'P', 'ar'] then l2_base + 'an'
      when [1, 'S', 'er'] then l2_base + 'o'
      when [2, 'S', 'er'] then l2_base + 'es'
      when [3, 'S', 'er'] then l2_base + 'e'
      when [1, 'P', 'er'] then l2_base + 'emos'
      when [3, 'P', 'er'] then l2_base + 'en'
      else raise "Can't handle #{selector}"
    end
  end
end

def choose_vp(features)
  if rand(4) == 0
    l1, l2 = one_of([
      ['try',   'probar'],
      ['learn', 'aprender'],
    ])

    object_l1, object_l2, object_features =
      choose_vp(features.merge({infinitive:true}))
  else
    l1, l2 = one_of([
      ['need', 'necesitar'],
      ['want', 'querer'],
    ])

    case rand(3)
      when 0 then features.update({reflexive: true, prefix_pronoun: true})
      when 1 then features.update({prefix_pronoun: true})
      when 2 then nil
    end
    object_l1, object_l2, object_features = choose_object(features)
  end

  if features[:infinitive]
    l1 = ['to', l1]
  elsif features[:person] == 3 && features[:number] == 'S'
    l1.gsub! /y$/, 'ie'
    l1 = [l1 + 's']
  else
    l1 = [l1]
  end
  l2_conjugated = [conjugate_l2_verb(l2, features)]

  if features[:prefix_pronoun]
    [l1 + object_l1, object_l2 + l2_conjugated, object_features]
  else
    [l1 + object_l1, l2_conjugated + object_l2, object_features]
  end
end

def choose_sentence
  agent_l1, agent_l2, agent_features = choose_agent
  vp_l1, vp_l2, vp_features = choose_vp(agent_features)
  is_question = agent_features[:question] || vp_features[:question] || rand(2) == 1
  end_punctuation = is_question ? ['?'] : ['.']
  ['S', agent_l1 + vp_l1 + end_punctuation, agent_l2 + vp_l2 + end_punctuation]
end

10.times do
  s = choose_sentence
  l1 = to_sentence(s[1])
  l2 = to_sentence(s[2])
  puts sprintf('%-40s %-40s', l1, l2)
end
