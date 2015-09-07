require 'pp'

def one_of(list)
  list[rand(list.size)]
end

def to_l1(ast, features)
  case ast[0]
    when 'S'
      agent, vp = ast[1], ast[2]
      punctuation = ast[3][:question] ? '?' : '.'
      to_l1(agent, {}) + to_l1(vp, ast[3]) + [punctuation]
    when 'NP'
      ast[1]
    when 'VP'
      if features[:person] == 3 && features[:number] == 'S'
        [ast[1] + 's'] + to_l1(ast[3], {})
      else
        [ast[1]] + to_l1(ast[3], {})
      end
    else raise "Can't handle #{ast[0]}"
  end
end

def to_l2(ast, features)
  case ast[0]
    when 'S'
      agent, vp = ast[1], ast[2]
      punctuation = ast[3][:question] ? '?' : '.'
      to_l2(agent, {}) + to_l2(vp, ast[3]) + [punctuation]
    when 'NP'
      ast[2]
    when 'VP'
      selector = [features[:person], features[:number], ast[2][-2..-1]]
      base = ast[2][0...-2]
      unless features[:person] == 1 && features[:number] == 'P'
        base = case base
          when 'quer' then 'quier'
          else base
        end
      end
      conjugated_verb = case selector
        when [1, 'S', 'ar'] then base + 'o'
        when [2, 'S', 'ar'] then base + 'as'
        when [3, 'S', 'ar'] then base + 'a'
        when [1, 'P', 'ar'] then base + 'amos'
        when [3, 'P', 'ar'] then base + 'an'
        when [1, 'S', 'er'] then base + 'o'
        when [2, 'S', 'er'] then base + 'es'
        when [3, 'S', 'er'] then base + 'e'
        when [1, 'P', 'er'] then base + 'emos'
        when [3, 'P', 'er'] then base + 'en'
        else raise "Can't handle #{selector}"
      end
      [conjugated_verb] + to_l2(ast[3], {})
    else
      raise "Can't handle #{ast[0]}"
  end
end

def to_sentence(words)
  words[0] = words[0][0].upcase + words[0][1..-1]
  words[0...-1].join(' ') + words[-1]
end

def choose_agent(features)
  case [features[:person], features[:number]]
    when [1, 'S']
      one_of([
        ['NP', ['I'], ['yo']],
        ['NP', ['(I)'], []]
      ])
    when [2, 'S']
      one_of([
        ['NP', ['you'], ['tu']],
        ['NP', ['(you)'], []]
      ])
    when [3, 'S']
      one_of([
        ['NP', ['he'],  ['el']],
        ['NP', ['she'], ['ella']],
        ['NP', ['it(m)'], ['el']],
        ['NP', ['it(f)'], ['ella']],
        ['NP', ['(he/she/it)'], []],
        ['NP', ['who'], ['quien']],
      ])
    when [1, 'P']
      one_of([
        ['NP', ['we'], ['nosotros']],
        ['NP', ['(we)'], []],
      ])
    when [3, 'P']
      one_of([
        ['NP', ['they'], ['ellos']],
        ['NP', ['they(f)'], ['ellas']],
        ['NP', ['(they)'], []],
      ])
    else
      raise "Can't handle #{features}"
  end
end

OBJECTS = [
  ['NP', ['money'], ['dinero']],
  ['NP', ['a', 'jacket'], ['una', 'chaqueta']],
#  choose_agent(one_of([
#    {person:1, number:'S'},
#    {person:2, number:'S'},
#    {person:3, number:'S'},
#    {person:1, number:'P'},
#    {person:3, number:'P'},
#  ])),
]

VERB_PHRASES = [
  ['VP', 'need', 'necesitar', one_of(OBJECTS)],
  ['VP', 'want', 'querer',    one_of(OBJECTS)],
]

def choose_sentence
  features = one_of([
    {person:1, number:'S'},
    {person:2, number:'S'},
    {person:3, number:'S'},
    {person:1, number:'P'},
    {person:3, number:'P'},
  ])
  features[:question] = one_of([true, false])
  ['S', choose_agent(features), one_of(VERB_PHRASES), features]
end

10.times do
  s = choose_sentence
  l1 = to_sentence(to_l1(s, {}))
  l2 = to_sentence(to_l2(s, {}))
  puts sprintf('%-40s %-40s', l1, l2)
end
