"""
Alexicon / Semantic Grounding & Harmonic Decay Prototype
--------------------------------------------------------
1. Harmonic Vector Frequencies: Plucking angular velocities at octave ratios
   (sin(theta), sin(2*theta), sin(theta/2) -> 440 Hz, 880 Hz, 220 Hz).
2. Staged Asymptotic Grounding: Soft damping transition
   [0.0 -> 0.9 -> 0.99 -> 0.999 -> 0.9999 -> 0.99999 -> 0.999999 -> 1.0]
   Eliminating Zeno's livelock via bounded decay windows and absorbing terminal state.
"""

import math


def evaluate_harmonic_frequencies(theta):
    """
    Computes harmonic heights on the unit circle across octaves.
    """
    base_freq = math.sin(theta)          # Fundamental (440 Hz)
    octave_high = math.sin(2.0 * theta)  # 1st Overtone (880 Hz)
    octave_low = math.sin(theta / 2.0)   # Sub-octave (220 Hz)

    return {
        "sub_octave_220": octave_low,
        "fundamental_440": base_freq,
        "overtone_880": octave_high
    }


def staged_grounding_decay(steps_limit=6, tolerance=1e-5):
    """
    Simulates bounded asymptotic grounding chain towards terminal state 1.0.
    Chain sequence: 0 -> 0.9 -> 0.99 -> ... -> 0.999999 -> 1.0
    """
    print("\n=== Executing Staged Asymptotic Grounding Chain ===")
    
    current_state = 0.0
    chain = [current_state]

    for k in range(1, steps_limit + 1):
        # Step value sitting exactly 10^-k below 1.0
        current_state = 1.0 - (10.0 ** -k)
        chain.append(current_state)
        delta = 1.0 - current_state
        print(f"Stage {k}: State = {current_state:.6f} | Delta = {delta:.6e}")

    # Final absorption into terminal invariant (Quantum jump to 1.0)
    if (1.0 - current_state) <= tolerance:
        current_state = 1.0
        chain.append(current_state)
        print(f"Final Stage: Absorption threshold reached (<= {tolerance}). Locked at state = {current_state:.1f}")

    return chain


def run_prototype():
    print("=== Testing Harmonic Frequency Mapping ===")
    test_angles = [0.0, math.pi / 4, math.pi / 2, math.pi]
    for angle in test_angles:
        harmonics = evaluate_harmonic_frequencies(angle)
        print(
            f"Theta {angle:5.2f} rad | "
            f"220Hz: {harmonics['sub_octave_220']:6.3f} | "
            f"440Hz: {harmonics['fundamental_440']:6.3f} | "
            f"880Hz: {harmonics['overtone_880']:6.3f}"
        )

    decay_chain = staged_grounding_decay()
    return decay_chain


if __name__ == "__main__":
    result = run_prototype()
    assert result[-1] == 1.0, "Invariant violation: Terminal state must absorb into 1.0"
    print("\n=== Invariant Validation ===")
    print("Grounding invariant holds: Smooth deceleration resolved into deterministic termination.")