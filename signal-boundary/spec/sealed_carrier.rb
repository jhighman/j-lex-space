# frozen_string_literal: true
#
# Synthesis of two independent answers to the distress-boundary prompt:
#   - boot-time sealing of the method table (Grok's contribution)
#   - mutual exclusion and clean re-entry refusal (this author's)
#   - state held in a closure local rather than an ivar, so the carrier
#     itself can be frozen and has nothing left to poke (neither party's;
#     it falls out of combining the two)

module Distress
  class BoundaryError < StandardError; end
  class CarrierBusy  < BoundaryError; end

  module Sos
    WAVEFORM = "···———···"

    # The carrier is built, not instantiated. Its state lives in closure
    # locals captured by the singleton methods below, so there is no
    # instance variable for instance_variable_set to reach, and the object
    # can therefore be frozen outright.
    def self.build_carrier
      gate   = Mutex.new
      seized = false

      carrier = Object.new

      carrier.define_singleton_method(:state) { seized ? 1 : 0 }

      carrier.define_singleton_method(:transmit) do |&payload|
        raise CarrierBusy, "re-entry from the owning thread" if gate.owned?

        gate.synchronize do
          seized = true
          begin
            payload.call(WAVEFORM)
            WAVEFORM                 # the block's return value is discarded
          ensure
            seized = false           # State 0 is unconditional
          end
        end
      end

      carrier.singleton_class.freeze
      carrier.freeze                 # safe: the object holds no ivars
      carrier
    end
  end

  class << self
    def seal
      raise BoundaryError, "carrier already sealed" if defined?(@carrier) && @carrier

      @carrier = Sos.build_carrier
      Sos.freeze
      freeze
      @carrier
    end

    def carrier
      raise BoundaryError, "carrier is not sealed" unless defined?(@carrier) && @carrier

      @carrier
    end
  end
end
