require 'citrus'

Citrus.load('calc.citrus')

ARGV.each do |path|
  next if path.end_with?('B0530.txt')
  next if path.end_with?('B0679.txt')
  next if path.end_with?('B0698.txt')
  next if path.end_with?('B0702.txt')
  next if path.end_with?('C0418.txt')
  next if path.end_with?('C0470.txt')
  next if path.end_with?('C0529.txt')
  next if path.end_with?('C0589.txt')
  out = File.read(path)
#  out.gsub! "hang\nout", 'hang out'
#  out.gsub! "name\ncard.", 'name card.'
#  out.gsub! "sour\npork", 'sour pork'
  out.gsub! "doin’\n’?", "doin’?"
  out.gsub! "\x75\xcc\x88\x0a\x75\xcc\x8c", "üǔ"
  out.gsub! "Broken-Hearted\nSon", 'Broken-Hearted Son'
  out.gsub! "Peter\n\n(C0566)\n\n，欢迎参观我们工厂！\n\n",
    "(C0566)\n\nPeter，欢迎参观我们工厂！\n"

#  out.strip!
  begin
    Calc.parse(out).value
    puts "  #{path}"
  rescue Exception => e
    puts "* #{path}"
  end
end

