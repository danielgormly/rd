Honestly not 100% sure on this but sure enough...

## Version Vectors

Version vectors are a set of versions tracking the last state contribution by each actor - typically assuming all state is included, they do not include all local events.

e.g. [a:3, b:6, c:1]

It can be used to track happened-before, happened-after or "purpotedly happened without explicit knowledge of" (concurrent and possibly conflicting).

## Version Clocks

Version clocks are basically the same but they over events themselves.
