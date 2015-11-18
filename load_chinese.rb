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
  不   bù
  什么 shénme
  怎么 zěnme
  对   duì
  好的 hǎode
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

Hello.               你好hello
  Did you say hello? 你you 说say 不not 说say 你好hello
*Yes.                说say

Hello.               你好hello
  What did you say?  你you 说say 什么what
I said hello.        我I 说say 你好hello

*How do I say hello?     我I 怎么how 说say -hello
  *You say hello.        你you 说say 你好hello
*Hello?                  你好hello
  Incorrect.             不not 对correct
  *You don't say hello;  你you 不not 说say 你好hello
  You say hello.         你you 说say 你好hello
Okay.                    好的okay
Hello.                   你好hello
  Correct!               对correct
].split("\n\n").each do |paragraph|
  utterances = []
  paragraph.split("\n").reject { |line| line == '' }.each do |line|
    if match = line.match(/^(  )?(\*)?([A-Za-z.?';! ]+?) +(\p{Han}.*)$/)
      speaker_num = (match[1] == '  ') ? 2 : 1
      leave_out = (match[2] == '*')
      english = match[3]
      hanzi_gloss_pairs = match[4]
      #p [is_2nd_speaker, leave_out, english, hanzi_gloss_pairs]

      gloss_table = []
      hanzi_gloss_pairs.split(' ').each do |hanzi_gloss_pair|
        if match = hanzi_gloss_pair.match(/^(\p{Han}+|-)([A-Za-z -]+)$/)
          hanzi = match[1]
          gloss = match[2]
          if hanzi == '-' # code-switching so it was an english word not chinese
            gloss_table.push ['', '', gloss]
          else
            pinyin = hanzi_to_pinyin.fetch(hanzi)
            gloss_table.push [hanzi, pinyin, gloss]
          end
        else
          raise "No match: #{hanzi_gloss_pairs}"
        end
      end

      # Look for english punctuation
      if match = english.match(/([.?;!])$/)
        punctuation = match[1]
        wide_punctuation = {
          '.'=>'。',
          '?'=>'？',
          '!'=>'！',
          ';'=>'；',
        }.fetch(punctuation)
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

=begin
what comes before say: I, you, how
what comes after say: hello, what
what comes before how-to: say, _____
what comes after how-to: say, _______
what comes before bu: nothing, ni
what comes after bu: correct, say
what comes before correct: nothing, bu, ____
what comes before okay: nothing
what comes after okay: nothing
=end

persist_to_db!
