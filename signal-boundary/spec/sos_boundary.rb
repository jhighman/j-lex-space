# frozen_string_literal: true
# Distress-protocol boundary: 1904 CQD (negative spec) vs 1906 SOS (invariant).

module DistressProtocol
  # ── 1904 ─ Marconi CQD ────────────────────────────────────────────────
  # Modelled honestly as a NEGATIVE specification. The mutation surface is
  # public and deliberate: this is what we are arguing against, so it must be
  # testable, not strawmanned.
  class MarconiCQD
    attr_accessor :tokens

    def initialize
      @tokens = [:C, :Q, :D]
    end

    def transmit(channel)
      tokens.each { |token| channel << token }
      channel
    end
  end

  # ── 1906 ─ Berlin SOS ─────────────────────────────────────────────────
  class Revoked < StandardError; end
  class CarrierBusy < StandardError; end

  # A revocable capability (caretaker/membrane pattern). This is the part the
  # usual `isolated = nil` idiom gets wrong: nilling your own local cannot
  # revoke a reference the block already retained. Revocation has to happen at
  # a proxy the holder is forced to go through.
  class WaveformCapability
    def initialize(value)
      @value = value
    end

    def to_s
      raise Revoked, "waveform capability was revoked at teardown" if @value.nil?
      @value
    end

    def length
      to_s.length
    end

    def revoke!
      @value = nil
    end

    # Never raise from inspect; debugging must not detonate.
    def inspect
      @value.nil? ? "#<WaveformCapability revoked>" : "#<WaveformCapability live>"
    end
  end

  class BerlinSOS
    WAVEFORM = "···———···"

    attr_reader :state

    def initialize
      @gate  = Mutex.new
      @state = 0
    end

    # One entry point. One exit path. No token API exists at all.
    def transmit!
      # Mutex is not reentrant: a recursive lock raises ThreadError ("deadlock;
      # recursive locking"). Detect it and refuse cleanly instead of crashing.
      raise CarrierBusy, "re-entry from the owning thread" if @gate.owned?

      @gate.synchronize do
        raise CarrierBusy, "carrier not at State 0" unless @state.zero?

        @state = 1
        capability = WaveformCapability.new(WAVEFORM.dup.freeze)

        begin
          yield capability
        ensure
          capability.revoke!   # actually revokes, even if the block kept it
          @state = 0           # State 0 is unconditional
        end
      end
    end
  end
end
