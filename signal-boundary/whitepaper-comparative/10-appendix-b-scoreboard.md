# Appendix B — Property scoreboard

Each property was verified by execution, not by reading. "Seal" is the sealing
implementation, "Lock" the locking one, "Union" the merge in
`spec/sealed_carrier.rb`.

| Property | Seal | Lock | Union |
|---|---|---|---|
| Waveform frozen, 9 marks, no whitespace | yes | yes | yes |
| No token API on the guarded object | yes | yes | yes |
| Teardown on normal return | yes | yes | yes |
| Teardown on `raise` | yes | yes | yes |
| Teardown on `throw` | yes | not tested | yes |
| Teardown on `Thread#kill` | not tested | yes | not tested |
| In-place mutation of payload raises | yes | not tested | yes |
| Reference identity of payload asserted | yes | no | yes |
| Reopening the class refused | **yes** | no | yes |
| `prepend` / `include` refused | **yes** | no | yes |
| Constant substitution refused | **yes** | no | yes |
| Singleton override refused | **yes** | no | yes |
| `instance_variable_set` cannot forge state | no | no | **yes** |
| Carrier object itself frozen | no | no | **yes** |
| Mutual exclusion under contention | no | **yes** | yes |
| Re-entry refused as a domain error | no | **yes** | yes |
| Idle indicator honest while others transmit | no | **yes** | yes |
| Survives `exit!` | no | no | no |
| Resists same-privilege allocator bypass | no | no | no |

Bold marks a property present in only one column.

Two rows are worth re-reading together. The sealing implementation wins four
rows outright on method-table integrity. The locking implementation wins three
on carrier discipline. **Neither wins the two rows the union takes**, because
those became reachable only when both requirements were imposed at once.

The last two rows are unanimous, and they are the subject of the companion
paper: an in-process boundary cannot survive an abrupt death or a
same-privilege allocator, no matter how it is written. "Survives `exit!`" is
the narrow case — six of nine termination modes do run teardown — and what the
other three strand is external state, not memory.
