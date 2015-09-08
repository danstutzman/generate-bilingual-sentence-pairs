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
  elsif features[:exclamation]
    words += ['!']
  else
    words += ['.']
  end

  words.join(' ').gsub(/ ([!?,.])/, '\1')
end

def choose_agent(features)
  choices = [
    ['I',          nil, {gender:'?', person:1, number:'S', question:false}],
    ['you',        nil, {gender:'?', person:2, number:'S', question:false}],
    ['he',        'él', {gender:'M', person:3, number:'S', question:false}],
    ['she',     'ella', {gender:'F', person:3, number:'S', question:false}],
    ['it',        'el', {gender:'N', person:3, number:'S', question:false}],
    ['it',      'ella', {gender:'N', person:3, number:'S', question:false}],
    ['we',         nil, {gender:'?', person:1, number:'P', question:false}],
    ['they',       nil, {gender:'?', person:3, number:'P', question:false}],
  ]
  if features[:question].nil? # if it's not already a question
    choices += [
      ['who',    'quién', {gender:'N', person:3, number:'S', question:true}],
    ]
  end
  l1, l2, agent_features = one_of(choices)
  if !features[:question].nil?
    agent_features[:question] = features[:question]
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
      if features[:question].nil?
        choices.push [['whom'], ['quién'], {question:true}]
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

def add_d(l1)
  l1.gsub! /y$/, 'ie'
  case l1
    when 'give' then 'gave'
    when 'know' then 'knew'
    else l1.sub(/([tdn])$/, '\1e') + 'd'
  end
end

def add_s(l1)
  l1.gsub! /y$/, 'ie'
  l1 + 's'
end

def conjugate_l1_verb(l1, features)
  if features[:tense] == 'infinitive'
    ['to', l1]
  elsif features[:needs_auxiliary]
    case features[:tense]
      when 'past'
        ['did', l1]
      when 'present'
        if features[:person] == 3 && features[:number] == 'S'
          ['does', l1]
        else
          ['do', l1]
        end
      else raise "Don't know how to conjugate #{l1} for #{features}"
    end
  elsif features[:person] == 3 && features[:number] == 'S'
    case features[:tense]
      when 'past'    then [add_d(l1)]
      when 'present' then [add_s(l1)]
      else raise "Don't know how to conjugate #{l1} for #{features}"
    end
  else
    case features[:tense]
      when 'past' then [add_d(l1)]
      when 'present' then [l1]
      else raise "Don't know how to conjugate #{l1} for #{features}"
    end
  end
end

def conjugate_l2_verb(l2, features)
  case features[:tense]
  when 'infinitive' then l2
  when 'past'
    l2_base, suffix = case l2
      when 'querer' then ['quis', '**']
      when 'dar'    then ['d', 'ir']
      when 'saber'  then ['sup', '**']
      when 'pedir'  then features[:person] == 3 ? ['pid', 'ir'] : ['ped', 'ir']
      else               [l2[0...-2], l2[-2..-1]]
    end
    selector = [features[:person], features[:number], suffix]
    l2_conjugated = case selector
      when [1, 'S', 'ar'] then l2_base + 'é'
      when [2, 'S', 'ar'] then l2_base + 'aste'
      when [3, 'S', 'ar'] then l2_base + 'ó'
      when [1, 'P', 'ar'] then l2_base + 'amos'
      when [3, 'P', 'ar'] then l2_base + 'aron'
      when [1, 'S', 'er'] then l2_base + 'í'
      when [2, 'S', 'er'] then l2_base + 'iste'
      when [3, 'S', 'er'] then l2_base + 'ió'
      when [1, 'P', 'er'] then l2_base + 'imos'
      when [3, 'P', 'er'] then l2_base + 'ieron'
      when [1, 'S', 'ir'] then l2_base + 'í'
      when [2, 'S', 'ir'] then l2_base + 'iste'
      when [3, 'S', 'ir'] then l2_base + 'ió'
      when [1, 'P', 'ir'] then l2_base + 'imos'
      when [3, 'P', 'ir'] then l2_base + 'ieron'
      when [1, 'S', '**'] then l2_base + 'e'
      when [2, 'S', '**'] then l2_base + 'iste'
      when [3, 'S', '**'] then l2_base + 'o'
      when [1, 'P', '**'] then l2_base + 'imos'
      when [3, 'P', '**'] then l2_base + 'ieron'
      else raise "Can't handle #{selector} for verb #{l2}"
    end
  when 'present'
    l2_base, suffix = [l2[0...-2], l2[-2..-1]]
    selector = [features[:person], features[:number], suffix]
    if l2 == 'dar' && selector == [1, 'S', 'ar']
      'doy'
    elsif l2 == 'saber' && selector == [1, 'S', 'er']
      'sé'
    else
      unless features[:person] == 1 && features[:number] == 'P'
        l2_base = case l2
          when 'querer' then 'quier'
          when 'probar' then 'prueb'
          when 'pedir'  then 'pid'
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
        when [1, 'S', 'ir'] then l2_base + 'o'
        when [2, 'S', 'ir'] then l2_base + 'es'
        when [3, 'S', 'ir'] then l2_base + 'e'
        when [1, 'P', 'ir'] then l2_base + 'imos'
        when [3, 'P', 'ir'] then l2_base + 'en'
        else raise "Can't handle #{selector} for verb #{l2}"
      end
    end
    else raise "Don't know how to conjugate #{l2} for #{features}"
  end
end

def choose_vp(features)
  if features[:tense].nil?
    features[:tense] = one_of(['past', 'present'])
  end
  case rand(10)
    when 0
      l1, l2 = one_of([
        ['try',   'probar'],
        ['learn', 'aprender'],
      ])

      object_l1, object_l2, object_features =
        choose_vp(features.merge({tense:'infinitive'}))
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
        vp_l1, vp_l2, vp_features = choose_vp(features.merge({tense:'infinitive'}))
        object_l1 += vp_l1
        object_l2 += ['para'] + vp_l2
        if !vp_features[:question].nil?
          object_features[:question] = vp_features[:question]
        end
      end

    else
      l1, l2, actor = one_of([
        ['need',    'necesitar', false],
        ['want',    'querer',    false],
        ['request', 'pedir',     false],
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

def choose_sentence(must_be_simple)
  if must_be_simple || rand(2) == 0
    agent_l1, agent_l2, agent_features = choose_agent({question: false})
    vp_l1, vp_l2, vp_features = choose_vp(agent_features)
    features = {question: agent_features[:question] || vp_features[:question]}
    [agent_l1 + vp_l1, agent_l2 + vp_l2, features]
  else
    case rand(4)
    when 0 # Transform statement into a question by prepending
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
    when 1 # Transform statement into a question by appending
      l1, l2, features = choose_sentence(true)
      features.update({question: true})
      l1, l2 = case rand(2)
      when 0 then [l1, l2]
      when 1 then [l1 + [',', 'right'], l2 + [',', 'de', 'veras']]
      end
      [l1, l2, features]
    when 2 # Agent knows that S
      agent_l1, agent_l2, agent_features = choose_agent({})
      agent_features[:tense] = one_of(['past', 'present'])
      vp_l1, vp_l2, vp_features = 'know', 'saber', {}
      vp_l1 = conjugate_l1_verb(vp_l1, agent_features)
      vp_l2 = conjugate_l2_verb(vp_l2, agent_features)
      independent_clause = choose_sentence(true)
      features = {question: independent_clause[2][:question] || rand(5) == 0 }
      [agent_l1 + [vp_l1] + ['that'] + independent_clause[0],
       agent_l2 + [vp_l2] + ['que'] + independent_clause[1], features]
    when 3 # S, and S
      s1_l1, s1_l2, s1_features = choose_sentence(true)
      s2_l1, s2_l2, s2_features = choose_sentence(true)
      features = {question: s1_features[:question] || s2_features[:question]}
      [s1_l1 + [',', 'and'] + s2_l1, s1_l2 + [',', 'y'] + s2_l2, features]
    end
  end
end

10.times do
  s = choose_sentence(false)
  unless s[2][:question]
    if rand(5) == 0
      s[2][:exclamation] = true
    end
  end
  l1 = to_sentence(s[0], s[2])
  l2 = to_sentence(s[1], s[2])
  if l1.size < 40 && l2.size < 40
    puts sprintf('%-40s %-40s', l1, l2)
  else
    puts sprintf("%s\n    %s", l1, l2)
  end
end
