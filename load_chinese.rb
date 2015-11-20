require 'json'
require 'pp'
require 'wavefile'
require './models_fast'

PINYIN_HEIGHT = 1
SAMPLES_PER_BUFFER = 4096
level = 1
NONSILENCE_THRESHOLD = 200

def locate_nonsilent_span path
  reader = WaveFile::Reader.new path
  first_nonzero_sample_num = nil
  last_nonzero_sample_num = nil
  num_samples_so_far = 0
  reader.each_buffer(SAMPLES_PER_BUFFER) do |buffer|
    buffer.samples.each_with_index do |sample, sample_num_relative|
      sample_num = num_samples_so_far + sample_num_relative
      if first_nonzero_sample_num.nil? &&
        (sample < -NONSILENCE_THRESHOLD || sample > NONSILENCE_THRESHOLD)
        first_nonzero_sample_num = sample_num
      end
      if (sample < -NONSILENCE_THRESHOLD || sample > NONSILENCE_THRESHOLD)
        last_nonzero_sample_num = sample_num
      end
    end
    num_samples_so_far += buffer.samples.size
  end
  sample_rate = WaveFile::Reader.info(path).sample_rate.to_f
  [first_nonzero_sample_num / sample_rate,
   last_nonzero_sample_num / sample_rate,
   num_samples_so_far / sample_rate]
end

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
  你耗 nǐhào
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
*Hello?                  你耗bad-hello
  Incorrect.             不not 对correct
  *You don't say hello;  你you 不not 说say 你耗bad-hello
  You say hello.         你you 说say 你好hello
Okay.                    好的okay
Hello.                   你好hello
  Correct!               对correct
].split("\n\n").each_with_index do |dialog, dialog_num|
  utterances = []
  lines = dialog.split("\n").reject { |line| line == '' }
  wav_spans = []
  durations = []
  lines.each_with_index do |line, line_num|
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
            gloss_table.push [gloss, gloss, gloss]
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
      utterances.push utterance
      #puts gloss_table.map { |entry| entry[1] }.join(' ').gsub(/ ([.?])$/, '\1')

      all_hanzi = gloss_table.map { |entry| entry[0] }.join
      all_hanzi.gsub! /？/, '?' # bug with 'say' command
      if speaker_num == 1
        `say -v Ting-Ting -o temp.aiff '#{all_hanzi}' && sox -S temp.aiff -C 192 #{line_num}.wav pitch -400`
      else
        `say -v Ting-Ting -o temp.aiff '#{all_hanzi}' && sox temp.aiff #{line_num}.wav`
      end
      File.delete 'temp.aiff'

      path = "#{line_num}.wav"
      wav_spans.push locate_nonsilent_span("#{line_num}.wav")

      command_line = 'sox ' + \
        (0..line_num).map { |i| "#{i}.wav" }.join(' ') + ' total.wav'
      system command_line
      durations.push locate_nonsilent_span('total.wav')[2]
      File.delete "total.wav"
    else
      raise "No match: #{line}"
    end
  end # next utterance

  last_line_num = lines.size - 1
  if last_line_num > -1
    path_wav = "dialog#{dialog_num}.wav"
    path_m4a = "dialog#{dialog_num}.m4a"
    command_line = 'sox ' + \
      (0..last_line_num).map { |line_num| "#{line_num}.wav" }.join(' ') + \
      ' ' + path_wav
    puts command_line
    system command_line
    0.upto(last_line_num).each do |line_num|
      File.delete "#{line_num}.wav"
    end

    `/usr/local/Cellar/ffmpeg/2.8.2/bin/ffmpeg -i #{path_wav} -c:a libfdk_aac -b:a 8k -cutoff 20000 -movflags +faststart -y #{path_m4a}`
    File.delete path_wav

    `/usr/local/Cellar/ffmpeg/2.8.2/bin/ffmpeg -i #{path_m4a} #{path_m4a}.wav`
    m4a_all_span = locate_nonsilent_span("#{path_m4a}.wav")
    File.delete "#{path_m4a}.wav"
    p ['m4a_offset', m4a_all_span[0], wav_spans[0][0]]
    m4a_offset = m4a_all_span[0] - wav_spans[0][0]
    (0...wav_spans.size).each do |i|
      if i > 0
        this_span = wav_spans[i]
        this_span[0] += durations[i - 1]
        this_span[1] += durations[i - 1]
        this_span[2] += durations[i - 1]
      end
    end
    m4a_spans = wav_spans.map.with_index do |wav_span, i|
      utterances[i]['m4a_milliseconds'] = [
        ((wav_span[0] + m4a_offset) * 1000).floor,
        ((wav_span[1] + m4a_offset) * 1000).ceil
      ]
    end

    puts JSON.dump(utterances)
  end
end # next dialog

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
