# frozen_string_literal: true
require_relative "sealed_carrier"
include Distress

$fail = 0
def check(label)
  ok = begin; yield; rescue => e; "#{e.class}: #{e.message}"; end
  $fail += 1 unless ok == true
  puts format("  %-5s %s%s", ok == true ? "PASS" : "FAIL", label, ok == true ? "" : "  <- #{ok}")
end

carrier = Distress.seal

puts "\nInherited from the sealing design"
check("reopening the sealed carrier's singleton is refused") do
  begin; carrier.define_singleton_method(:transmit) { "C Q D" }; false
  rescue FrozenError, RuntimeError; true; end
end
check("prepend onto the carrier's singleton is refused") do
  begin; carrier.singleton_class.prepend(Module.new { def transmit; "C Q D"; end }); false
  rescue FrozenError, RuntimeError; true; end
end
check("the constant table rejects a replacement waveform") do
  begin; Sos.send(:const_set, :WAVEFORM, "C Q D"); false
  rescue FrozenError, RuntimeError; true; end
end
check("the waveform is 9 marks with no whitespace") { Sos::WAVEFORM.length == 9 && Sos::WAVEFORM !~ /\s/ }
check("transmit returns the identical frozen waveform") do
  carrier.transmit { :ignored }.equal?(Sos::WAVEFORM)
end
check("the block cannot substitute a token sequence") do
  carrier.transmit { "C Q D" }.equal?(Sos::WAVEFORM)
end
check("in-place mutation of the waveform raises, and tears down") do
  r = begin; carrier.transmit { |w| w << "·" }; false
      rescue FrozenError, RuntimeError; true; end
  r && carrier.state.zero?
end
check("raise tears down to State 0")  { begin; carrier.transmit { raise "noise" }; rescue RuntimeError; end; carrier.state.zero? }
check("throw tears down to State 0")  { catch(:fade) { carrier.transmit { throw :fade } }; carrier.state.zero? }

puts "\nInherited from the locking design"
check("State 1 is visible inside the lock, 0 after") do
  seen = nil
  carrier.transmit { seen = carrier.state }
  seen == 1 && carrier.state.zero?
end
check("re-entry is refused cleanly, not a ThreadError") do
  r = begin; carrier.transmit { carrier.transmit { nil } }; "allowed"
      rescue CarrierBusy; "refused"
      rescue ThreadError; "threaderror"; end
  r == "refused" && carrier.state.zero?
end
check("8 threads: no two transmissions overlap") do
  inside = 0; peak = 0; mx = Mutex.new
  8.times.map { Thread.new {
    begin
      carrier.transmit do
        mx.synchronize { inside += 1; peak = [peak, inside].max }
        sleep 0.005
        mx.synchronize { inside -= 1 }
      end
    rescue CarrierBusy; nil; end
  } }.each(&:join)
  peak == 1 && carrier.state.zero?
end
check("State 0 never reported while another thread transmits") do
  lied = false
  t = Thread.new { carrier.transmit { sleep 0.06 } }
  sleep 0.02
  lied = true if carrier.state.zero?
  t.join
  !lied
end

puts "\nNew: closed over the state instead of storing it"
check("the carrier object is frozen") { carrier.frozen? }
check("instance_variable_set cannot forge a seizure") do
  begin; carrier.instance_variable_set(:@seized, true); false
  rescue FrozenError, RuntimeError; true; end
end
check("the carrier holds no instance variables at all") { carrier.instance_variables.empty? }

puts(format("\n%s", $fail.zero? ? "All post-conditions held." : "#{$fail} FAILED"))
exit($fail.zero? ? 0 : 1)
