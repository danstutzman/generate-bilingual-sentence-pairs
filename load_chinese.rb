require 'json'
require 'pp'
require './models_fast'

PINYIN_HEIGHT = 1
level = 1

connect_to_db! true

new_prompt 'vocab_l1', 'vocab_l2', 'Say in Mandarin:'
new_prompt 'vocab_l2', 'vocab_l1', 'Translate to English:'

hanzi_to_pinyin = {}
%q[
  我   wǒ
  你   nǐ
  他   tā
  她   tā
  你好 nǐhǎo
  说   shūo
  吗   ma
].split("\n").reject { |line| line == '' }.each do |line|
  _, hanzi, pinyin = line.split(/\s+/)
  hanzi_to_pinyin[hanzi] = pinyin
end

%q[
  我 I/me
  你 you
  他 he
  她 she
].split("\n").reject { |line| line == '' }.each do |line|
  _, hanzi, l1 = line.split(/\s+/)
  pinyin = hanzi_to_pinyin.fetch(hanzi)
  l1 = new_concept 'vocab_l1', l1, level, 'english'
  pinyin = new_concept 'vocab_l2', pinyin, level, 'pinyin'
  arc = new_arc PINYIN_HEIGHT, l1, pinyin, false
end

%q[
Hello.               你好hello
  Did you say hello? 你you 说say 你好hello 吗question-particle
*Yes.                说say
].split("\n\n").each do |paragraph|
  utterances = []
  paragraph.split("\n").reject { |line| line == '' }.each do |line|
    if match = line.match(/^(  )?(\*)?([A-Za-z.? ]+?) +(\p{Han}.*)$/)
      speaker_num = (match[1] == '  ') ? 2 : 1
      leave_out = (match[2] == '*')
      english = match[3]
      hanzi_gloss_pairs = match[4]
      #p [is_2nd_speaker, leave_out, english, hanzi_gloss_pairs]

      gloss_table = []
      hanzi_gloss_pairs.split(' ').each do |hanzi_gloss_pair|
        if match = hanzi_gloss_pair.match(/^(\p{Han}+)([a-z -]+)$/)
          hanzi = match[1]
          gloss = match[2]
          pinyin = hanzi_to_pinyin.fetch(hanzi)
          gloss_table.push [hanzi, pinyin, gloss]
        else
          raise "No match: #{hanzi_gloss_pairs}"
        end
      end

      # Look for english punctuation
      if match = english.match(/([.?])$/)
        punctuation = match[1]
        wide_punctuation = {'.'=>'。', '?'=>'？', '!'=>'！'}.fetch(punctuation)
        gloss_table.push [wide_punctuation, punctuation, punctuation]
      else
        raise "No match: #{english}"
      end

      utterance = {
        'speaker_num' => speaker_num,
        'english'     => english,
        'gloss_table' => gloss_table,
      }
      #puts gloss_table.map { |entry| entry[1] }.join(' ').gsub(/ ([.?])$/, '\1')
      puts JSON.dump(utterance)
    else
      raise "No match: #{line}"
    end
  end
end

persist_to_db!
