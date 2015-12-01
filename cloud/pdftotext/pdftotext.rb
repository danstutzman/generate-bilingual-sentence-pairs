require 'citrus'

Citrus.load('calc.citrus')

base = "/mnt/transmission-daemon/downloads/Chinesepod Collection/ChinesePod Newbie/"
Dir.entries(base).each do |path|
  next if path == '.' || path == '..'
  next unless path.match(/.pdf$/)
  next if [
    'A0784 - The Fourth Tone.pdf',
    'A0775 - The Second Tone.pdf',
  ].include?(path)
  puts path

  `pdftotext "#{base}/#{path}" out.txt | head -1`
  out = File.read('out.txt')
  out.gsub! "hang\nout", 'hang out'
  out.gsub! "name\ncard.", 'name card.'
  out.gsub! "sour\npork", 'sour pork'
  out.gsub! "doin’\n’?", "doin’?"
  out.gsub! "\x75\xcc\x88\x0a\x75\xcc\x8c", "üǔ"
  out.strip!
  Calc.parse(out).value
end

