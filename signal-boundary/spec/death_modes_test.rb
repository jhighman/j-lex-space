# frozen_string_literal: true
#
# How far does "State 0 is unconditional" actually extend? Each mode kills the
# process a different way and reports what survived.

require "tmpdir"

CHILD = File.join(__dir__, "death_modes.rb")

# mode => [ensure runs?, at_exit runs?, lease released?]
EXPECTED = {
  "return"  => [true,  true,  true],
  "raise"   => [true,  true,  true],
  "throw"   => [true,  true,  true],
  "exit"    => [true,  true,  true],
  "exit!"   => [false, false, false],
  "sigterm" => [true,  true,  true],
  "sigint"  => [true,  true,  true],
  "sigkill" => [false, false, false],
  "sigsegv" => [false, false, false],
}.freeze

failed = 0

puts
puts format("  %-9s %-9s %-9s %-10s %s", "MODE", "ensure", "at_exit", "lease", "")
puts format("  %-9s %-9s %-9s %-10s %s", "-" * 9, "-" * 9, "-" * 9, "-" * 10, "")

Dir.mktmpdir("death-modes") do |dir|
  EXPECTED.each do |mode, expected|
    lease  = File.join(dir, "lease_#{mode}")
    marker = File.join(dir, "marker_#{mode}")

    pid = Process.spawn(RbConfig.ruby, CHILD, mode, lease, marker,
                        out: File::NULL, err: File::NULL)
    Process.wait(pid)

    actual = [File.exist?("#{marker}.ensure"),
              File.exist?("#{marker}.atexit"),
              !File.exist?(lease)]

    ok = actual == expected
    failed += 1 unless ok

    puts format("  %-9s %-9s %-9s %-10s %s",
                mode,
                actual[0] ? "ran"      : "SKIPPED",
                actual[1] ? "ran"      : "SKIPPED",
                actual[2] ? "released" : "STRANDED",
                ok ? "" : "  <- unexpected")
  end
end

puts
puts "  Teardown runs on 6 of 9 completion paths. The 3 that skip it are the"
puts "  ones that never return control to the Ruby runtime. Only the external"
puts "  lease strands; in-memory state is reclaimed by the OS."
puts
puts(failed.zero? ? "All death modes behaved as specified." : "#{failed} UNEXPECTED")
exit(failed.zero? ? 0 : 1)
