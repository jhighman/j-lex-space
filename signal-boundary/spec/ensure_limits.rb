require_relative "sos_boundary"
include DistressProtocol

sos = BerlinSOS.new
mode = ARGV[0]

at_exit { $stdout.puts "  state at exit: #{sos.state}" ; $stdout.flush }

case mode
when "throw"
  begin; sos.transmit! { raise "x" }; rescue; end
when "exit!"
  begin
    sos.transmit! { $stdout.puts "  inside closure, calling exit!"; $stdout.flush; exit!(0) }
  rescue; end
when "kill"
  t = Thread.new { sos.transmit! { sleep 5 } }
  sleep 0.2
  t.kill; t.join
when "ivar"
  # never calls transmit! at all
  sos.instance_variable_set(:@state, 1)
end
