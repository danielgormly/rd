# Cryptography 101 video
See https://www.youtube.com/watch?v=3rmCGsCYJF8
Precursor to follow-up book @ https://raw.githubusercontent.com/crypto101/crypto101.github.io/master/Crypto101.pdf

## One Time Pad
Basic cryptographic cipher equal (or greater) to the size of the data to be encrypted. Basically a one to one unique mapping per unit to encrypt, XOR in each direction with the pad to encrypt/decrypt the data. Can't crack, but obviously limited usefulness. The randomness better be pretty random!

## Block cipher
Deterministic algorithm operating on small blocks e.g. AES. If we just encrypted blocks with with AES and called it a day, the original data would leave its fingerprints pretty quickly.

## Stream cipher
Similar, sometimes a mode (e.g. CBC) of a block cipher, usually introduces some additional entropy by starting with a random string (or nonce) + incrementing counter. In a sense it extrapolates a pseudo one time pad. GCM is another type.

## Key exchange
Diffie-Hellman works on the principal that it's easy to computer `g^x mod p` (modular exponention) but very hard to find x given `g^x mod p` (discrete logarithm).

In reductive terms:

Public params = P
p1 = P,A,P+A
p2 = P,B,P+B

p1 sends P+A to p2, p2 sends P+B to p1

p1 = (P+B)+A = P+A+B
p2 = (P+A)+B = P+A+B

Easy to mix, hard to separate

## Authentication
- Is the source of the data and the contents of the data true to how it's represented?
- "Encryption without authentication" = "almost certainly wrong"

GCM = Authenticated encryption mode
Message Authentication Codes (i.e. HMAC)

## Cryptographic Hash function
hash(`lorem impsum`) -> state -> digest
- cheap to compute
- with some hash functions, the digest is the state so you can continue a hash like so `hash(previous_digest).update(new_data).digest()`, this is the basis for a hash extension attack!
- Hash = FAST, CHEAP = bad for password storage
- Even adding a salt do an MD5, SHA-2, SHA-3 hash not that useful! GPUs can smash through these - i.e. basis of bitcoin mining - strong economic incentive to do so and moore's law
- KDF = Key Derivation Function e.g. bcrypt, scrypt, argon2 = SLOW & tuneable = good for password hashing

## Public/Private key Cryptography
- Asymmetric keys (RSA, ECDSA)
- Basis of TLS (SSL)
- TLS
