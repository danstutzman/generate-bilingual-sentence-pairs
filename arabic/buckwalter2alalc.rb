#!/usr/bin/ruby

# Contradiction: nwn -> nūn but nwm -> nawm; there must be a hidden vowel

def buckwalter_to_aralc buckwalter
  new = buckwalter
  new.gsub! /<y/, 'ī'
  new.gsub! /([fjs$m])y/, '\1ī' # not ^
  new.gsub! />w([jm])/, 'aw\1'
  new.gsub! />w/, 'ū'
  new.gsub! /([nS*])w/, '\1ū' # not ^
  new = new.tr('m>AHLDTSZYp', 'm’āḥlḍṭṣẓáh').tr("'", "’").gsub(/[_]/, '').gsub('v', 'th').gsub('x', 'kh').gsub('*', 'dh').gsub('$', 'sh').gsub('g', 'gh')
  new.gsub! 'E', '‘'
  new
end

File.read('ARA-LC-test-corpus.txt').split("\n").each_with_index do |line, i|
  next if line.strip == ''
  buckwalter, expected = line.split(/\s+/)
  expected = expected.tr('()', '‘’').gsub('~a', 'ā').gsub('~i', 'ī').gsub('.h', 'ḥ').gsub('.d', 'ḍ').gsub('.t', 'ṭ').gsub('.s', 'ṣ').gsub('.z', 'ẓ').gsub('~u', 'ū').gsub('/a', 'á')
  actual = buckwalter_to_aralc(buckwalter)
  if actual != expected
    raise "Line #{i + 1}: Expected #{expected} but got #{actual}"
  end
end
