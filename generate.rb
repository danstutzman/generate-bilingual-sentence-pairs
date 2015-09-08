require 'pp'

def one_of(list)
  list[rand(list.size)]
end

def to_sentence(words, features)
  if words[0][0] == '('
    words[0] = '(' + words[0][1].upcase + words[0][2..-1]
  else
    words[0] = words[0][0].upcase + words[0][1..-1]
  end

  if features[:question]
    words += ['?']
  else
    if rand(10) == 0
      words += ['!']
    else
      words += ['.']
    end
  end

  words.join(' ').gsub(/ ([!?,.])/, '\1')
end

def choose_agent(features)
  choices = [
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
  ]
  if features[:question] != true # if it's not already a question
    choices += [
      ['who',    'quien', {gender:'N', person:3, number:'S', question:true}],
    ]
  end
  l1, l2, agent_features = one_of(choices)
  if features[:question]
    agent_features[:question] = true # pass along question:true down the sentence
  end
  [[l1], l2 ? [l2] : [], agent_features]
end

def choose_object(features)
  new_features = { question: features[:question] }
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
    choices = []
    if features[:actor] != false
      if !features[:question]
        choices.push [['whom'], ['quien'], {question:true}]
      end
      choices += [
        [['Bill'], ['Bill'], {}],
        [['Kim'],  ['Kim'], {}],
      ]
    end
    if features[:actor] != true
      choices += [
        [['money'], ['dinero'], {question:false}],
        [['a', 'jacket'], ['una', 'chaqueta'], {question:false}],
      ]
    end
    one_of(choices)
  end
end

def conjugate_l1_verb(l1, features)
  if features[:infinitive]
    ['to', l1]
  elsif features[:needs_auxiliary]
    if features[:person] == 3 && features[:number] == 'S'
      ['does', l1]
    else
      ['do', l1]
    end
  elsif features[:person] == 3 && features[:number] == 'S'
    l1.gsub! /y$/, 'ie'
    [l1 + 's']
  else
    [l1]
  end
end

def conjugate_l2_verb(l2, features)
  selector = [features[:person], features[:number], l2[-2..-1]]
  if features[:infinitive]
    return l2
  elsif l2 == 'dar' && selector == [1, 'S', 'ar']
    'doy'
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
      else raise "Can't handle #{selector} for verb #{l2}"
    end
  end
end

def choose_vp(features)
  case rand(10)
    when 0
      l1, l2 = one_of([
        ['try',   'probar'],
        ['learn', 'aprender'],
      ])

      object_l1, object_l2, object_features =
        choose_vp(features.merge({infinitive:true}))
    when 1
      l1, l2 = one_of([
        ['give', 'dar'],
      ])

      receiver_l1, receiver_l2, receiver_features =
        choose_object(features.merge({actor:true}))
      transferable_l1, transferable_l2, transferable_features =
        choose_object(features.merge({actor:false}))
      object_l1 = receiver_l1 + transferable_l1
      object_l2 = transferable_l2 + ['a'] + receiver_l2
      object_features = receiver_features

      if rand(2) == 0
        vp_l1, vp_l2, vp_features = choose_vp(features.merge({infinitive:true}))
        object_l1 += vp_l1
        object_l2 += ['para'] + vp_l2
        if vp_features[:question]
          object_features[:question] = true
        end
      end

    else
      l1, l2, actor = one_of([
        ['need', 'necesitar', false],
        ['want', 'querer',    false],
      ])

      if actor != false
        case rand(3)
          when 0 then features.update({reflexive: true, prefix_pronoun: true})
          when 1 then features.update({prefix_pronoun: true})
          when 2 then nil
        end
      end
      object_l1, object_l2, object_features =
        choose_object(features.merge({actor:actor}))
  end

  l1 = conjugate_l1_verb(l1, features)
  l2_conjugated = [conjugate_l2_verb(l2, features)]

  if features[:prefix_pronoun]
    [l1 + object_l1, object_l2 + l2_conjugated, object_features]
  else
    [l1 + object_l1, l2_conjugated + object_l2, object_features]
  end
end

def choose_sentence
  case rand(10)
  when 0..5 # Agent VP
    agent_l1, agent_l2, agent_features = choose_agent({})
    vp_l1, vp_l2, vp_features = choose_vp(agent_features)
    features = {question: agent_features[:question] || vp_features[:question]}
    [agent_l1 + vp_l1, agent_l2 + vp_l2, features]
  when 6 # Transform statement into a question by prepending
    features = {question: true}
    agent_l1, agent_l2, agent_features = choose_agent(features)
    vp_l1, vp_l2, vp_features =
      choose_vp(agent_features.merge({needs_auxiliary: true}))
    auxiliary_l1 = [vp_l1.shift]
    verb_l2 = [vp_l2.shift]
    s_l1 = auxiliary_l1 + agent_l1 + vp_l1
    s_l2 = verb_l2 + agent_l2 + vp_l2
    s_l1, s_l2 = case rand(3)
    when 0 then [s_l1, s_l2]
    when 1 then [['why'] + s_l1, ['porque'] + s_l2]
    when 2 then [['how'] + s_l1, ['como'] + s_l2]
    end
    [s_l1, s_l2, features]
  when 7 # Transform statement into a question by appending
    l1, l2, features = choose_sentence
    features.update({question: true})
    l1, l2 = case rand(2)
    when 0 then [l1, l2]
    when 1 then [l1 + [',', 'right'], l2 + [',', 'de', 'veras']]
    end
    [l1, l2, features]
  when 8 # Agent knows that S
    agent_l1, agent_l2, agent_features = choose_agent({})
    vp_l1, vp_l2, vp_features = 'know', 'saber', {}
    vp_l1 = conjugate_l1_verb(vp_l1, agent_features)
    vp_l2 = conjugate_l2_verb(vp_l2, agent_features)
    independent_clause = choose_sentence
    features = {question: independent_clause[2][:question] || rand(5) == 0 }
    [agent_l1 + [vp_l1] + ['that'] + independent_clause[0],
     agent_l2 + [vp_l2] + ['que'] + independent_clause[1], features]
  when 9 # S, and S
    s1_l1, s1_l2, s1_features = choose_sentence
    s2_l1, s2_l2, s2_features = choose_sentence
    features = {question: s1_features[:question] || s2_features[:question]}
    [s1_l1 + [',', 'and'] + s2_l1, s1_l2 + [',', 'y'] + s2_l2, features]
  end
end

10.times do
  s = choose_sentence
  l1 = to_sentence(s[0], s[2])
  l2 = to_sentence(s[1], s[2])
  if l1.size < 40 && l2.size < 40
    puts sprintf('%-40s %-40s', l1, l2)
  else
    puts sprintf("%s\n    %s", l1, l2)
  end
end
