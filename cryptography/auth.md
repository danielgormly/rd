# Notes on auth

## Session Ids

- Cryptographically secure random number (no repeats and guesses)
- Appropriate length/entropy (no collision and guesses)
- encoding (base64 or hex)

rand + base64, or just uuid?

## Why not UUID
- https://neilmadden.blog/2018/08/30/moving-away-from-uuids/
- 128 bits, 6 are fixed variant, so 122 random
- Oauth 2 access token spec says 2^-128, and less than 2^-160, so no dice
- Recommended to use CSPRNG (cryptographically secure psuedo random number) with 160 bits of entropy (20 * 8 bits)
