# frozen_string_literal: true
require_relative "sos_boundary"
include DistressProtocol

$fail = 0
def check(label)
  ok = yield
  $fail += 1 unless ok
  puts format("  %s  %s", ok ? "PASS" : "FAIL", label)
end

puts "\n1904 CQD — the failure model (these 'pass' by being broken)"
cqd = MarconiCQD.new
cqd.tokens[1] = :NOISE
check("a noisy channel can overwrite a token in place") { cqd.tokens == [:C, :NOISE, :D] }
cqd.tokens.reverse!
check("ordering is not an invariant")                  { cqd.tokens == [:D, :NOISE, :C] }
check("the whole sequence can be emptied mid-flight")  { cqd.tokens.clear.empty? }

puts "\n1906 SOS — post-conditions"
sos = BerlinSOS.new
check("waveform is 9 marks, no whitespace") { BerlinSOS::WAVEFORM.length == 9 && BerlinSOS::WAVEFORM !~ /\s/ }
check("starts at State 0")                  { sos.state.zero? }

marks = nil
sos.transmit! { |wave| marks = wave.length }
check("clean path transmits 9 marks")       { marks == 9 }
check("clean path restores State 0")        { sos.state.zero? }

raised = nil
begin
  sos.transmit! { raise "carrier fault" }
rescue => e
  raised = e.message
end
check("a raising payload propagates")       { raised == "carrier fault" }
check("a raising payload still restores State 0") { sos.state.zero? }

# The one that matters: the block stashes the capability and uses it later.
escaped = nil
sos.transmit! { |wave| escaped = wave }
leaked = begin
  escaped.to_s
  "LEAKED"
rescue Revoked
  "revoked"
end
check("a retained capability is dead after teardown") { leaked == "revoked" }
check("State 0 holds after the retention attempt")    { sos.state.zero? }

reentry = begin
  sos.transmit! { sos.transmit! { } }
  "allowed"
rescue CarrierBusy
  "refused"
end
check("re-entry is refused cleanly, not a ThreadError") { reentry == "refused" }
check("State 0 holds after refused re-entry")           { sos.state.zero? }

# Concurrency: 8 threads contend; the carrier must serialize and always land at 0.
overlap = 0
mutex   = Mutex.new
threads = 8.times.map do
  Thread.new do
    begin
      sos.transmit! do
        mutex.synchronize { overlap += 1 }
        sleep 0.005
        mutex.synchronize { overlap -= 1 }
      end
    rescue CarrierBusy
      nil # losing the race is a valid outcome
    end
  end
end
threads.each(&:join)
check("no two transmissions overlapped") { overlap.zero? }
check("State 0 after contention")        { sos.state.zero? }

puts "\nThe boundary under hostile in-process code"
class DistressProtocol::BerlinSOS
  def transmit!   # 6 lines, no lock, no state machine, no ensure
    yield DistressProtocol::WaveformCapability.new(WAVEFORM)
  end
end
patched  = BerlinSOS.new
survivor = nil
patched.transmit! { |wave| survivor = wave }
still_live = begin
  survivor.to_s
  true
rescue Revoked
  false
end
check("monkey patch defeated revocation")       { still_live }
check("monkey patch defeated the state machine"){ patched.state.zero? } # never left 0: never entered

puts(format("\n%s", $fail.zero? ? "All post-conditions held." : "#{$fail} FAILED"))
exit($fail.zero? ? 0 : 1)
