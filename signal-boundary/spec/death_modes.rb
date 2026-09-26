# frozen_string_literal: true
#
# Child process for death_modes_test.rb. Acquires an external resource (a lease
# file), enters the guarded closure, and then dies in the manner named by ARGV.
# The parent infers what ran from the marker files left behind.

require_relative "sealed_carrier"

mode, lease, marker = ARGV[0], ARGV[1], ARGV[2]
carrier = Distress.seal

at_exit { File.write("#{marker}.atexit", "1") }

begin
  File.write(lease, "held by #{Process.pid}")
  begin
    carrier.transmit do
      case mode
      when "return"  then nil
      when "raise"   then raise "carrier fault"
      when "throw"   then throw :fade
      when "exit"    then exit(0)
      when "exit!"   then exit!(0)
      when "sigterm" then Process.kill("TERM", Process.pid); sleep 3
      when "sigint"  then Process.kill("INT",  Process.pid); sleep 3
      when "sigkill" then Process.kill("KILL", Process.pid); sleep 3
      when "sigsegv" then Process.kill("SEGV", Process.pid); sleep 3
      else raise ArgumentError, "unknown mode #{mode}"
      end
    end
  ensure
    # Application-level teardown: release the external resource.
    File.write("#{marker}.ensure", "1")
    File.delete(lease) if File.exist?(lease)
  end
rescue SystemExit
  raise
rescue Exception # rubocop:disable Lint/RescueException — deliberately broad
  nil
end
