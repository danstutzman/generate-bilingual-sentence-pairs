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

def choose_agent(features)
  agent = case [features[:person], features[:number], features[:object]]
    when [1, 'S', false]
      one_of([
        ['NP', ['I'], ['yo']],
        ['NP', ['(I)'], []]
      ])
    when [1, 'S', true]
      ['NP', ['me'], ['yo']]
    when [2, 'S', false]
      one_of([
        ['NP', ['you'], ['tu']],
        ['NP', ['(you)'], []]
      ])
    when [2, 'S', true]
      ['NP', ['you'], ['tu']]
    when [3, 'S', false]
      one_of([
        ['NP', ['he'],  ['el']],
        ['NP', ['she'], ['ella']],
        ['NP', ['it(m)'], ['el']],
        ['NP', ['it(f)'], ['ella']],
        ['NP', ['(he/she/it)'], []],
      ] + (features[:question] ? [['NP', ['who'], ['quien']]] : []))
    when [3, 'S', true]
      one_of([
        ['NP', ['him'],  ['el']],
        ['NP', ['him'], ['ella']],
        ['NP', ['it(m)'], ['el']],
        ['NP', ['it(f)'], ['ella']],
      ])
    when [1, 'P', false]
      one_of([
        ['NP', ['we'], ['nosotros']],
        ['NP', ['(we)'], []],
      ])
    when [1, 'P', true]
      ['NP', ['us'], ['nosotros']]
    when [3, 'P', false]
      one_of([
        ['NP', ['they'], ['ellos']],
        ['NP', ['they(f)'], ['ellas']],
        ['NP', ['(they)'], []],
      ])
    when [3, 'P', true]
      one_of([
        ['NP', ['them'], ['ellos']],
        ['NP', ['them(f)'], ['ellas']],
      ])
    else
      raise "Can't handle #{features}"
  end
end

def choose_object(prefix_pronoun)
  if prefix_pronoun
    one_of([
      ['NP', ['me'],  ['me']],
      ['NP', ['you'], ['te']],
      ['NP', ['him'], ['le(m)']],
      ['NP', ['her'], ['le(f)']],
      ['NP', ['it'],  ['le']],
      ['NP', ['us'],  ['nos']],
      ['NP', ['them'],['les']],
    ])
  else
    one_of([
      ['NP', ['money'], ['dinero']],
      ['NP', ['a', 'jacket'], ['una', 'chaqueta']],
    ])
  end
end

def choose_vp(features)
  l1, l2 = one_of([
    ['need', 'necesitar'],
    ['want', 'querer'],
  ])

  if features[:person] == 3 && features[:number] == 'S'
    l1 += 's'
  end

  selector = [features[:person], features[:number], l2[-2..-1]]
  l2_base = l2[0...-2]
  unless features[:person] == 1 && features[:number] == 'P'
    l2_base = case l2_base
      when 'quer' then 'quier'
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

  prefix_pronoun = one_of([true, false])
  object = choose_object(prefix_pronoun)
  if prefix_pronoun
    ['VP', [l1] + object[1], object[2] + [l2_conjugated]]
  else
    ['VP', [l1] + object[1], [l2_conjugated] + object[2]]
  end
end

def choose_sentence
  features = one_of([
    {person:1, number:'S'},
    {person:2, number:'S'},
    {person:3, number:'S'},
    {person:1, number:'P'},
    {person:3, number:'P'},
  ])
  features[:question] = one_of([true, false])
  agent = choose_agent(features.merge({object:false}))
  vp = choose_vp(features)
  end_punctuation = features[:question] ? ['?'] : ['.']
  ['S', agent[1] + vp[1] + end_punctuation, agent[2] + vp[2] + end_punctuation]
end

10.times do
  s = choose_sentence
  l1 = to_sentence(s[1])
  l2 = to_sentence(s[2])
  puts sprintf('%-40s %-40s', l1, l2)
end
