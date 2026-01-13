## Btc whitepaper notes

First read through of "Bitcoin: A Peer-to-Peer Electronic Cash System"
I will do a second read through later then understand protocol developments later

## Abstract

Bitcoin proposes a p2p network that solves the double-spending associated with decentralised payments. Each transaction is timestamped by hashing them into an ongoing chain of hash-based proof-of-work, forming a record that cannot be changed without proof-of-work. (What does this mean?)

The longest chain serves as proof of the sequence of events witnessed & proof that it came from the largest pool of CPU power. A majority of nodes in cooperation will generate the longest chain & outpace attackers. Messages are broadcast on a best-effort basis and new nodes will accept the longest chain.

## Context (Introduction)

All electronic payments in the past go through a centralised bank system and its trust guarantees are inseparable from the system. You must rely on a third-party system. All transactions in this system are theoretically reversible as banks must play the role of mediators (my note: in essence a kind of unofficial escrow).

BTC is a shared ledger based on cryptographic proof. Transactions are irreversible or at least impractical to reverse. Sellers are always protected. The system steams ahead. Escrow / trust mechanisms can be layered on top to protect buyers.

## Transactions
In BTC, an electronic coin is a chain of digital signatures. Transfer is done by signing a hash of the previous transaction with a public key of the new owner. A payee can verify the signatures to verify the ownership chain. This however, does not prevent double spending. A means to agree on a total order is required to decide which chain to take on. Otherwise, you could have competing chains with two different heads that do not converge.

## Timestamp server
Takes a hash of a block of items to be timestamped and widely publishing the hash

## Blocks are created by all participating nodes
Then they are solved and distributed, and they will build their subsequent hashes from this block. A block contains a group of transactions. A nonce is added and the timestamp network creates a hash based on it, increasing the nonce and hashing the block until you get a hash within a range that is a function of the timestamp diff of the 2 last blocks (this is also encoded in new blocks) - basically a bunch of leading 0s - this is the variable condition!

## First block
Special block that grabs some coin, how much coin:

Blocks 0–209,999: 50 BTC
Blocks 210,000–419,999: 25 BTC
Blocks 420,000–629,999: 12.5 BTC
Blocks 630,000–839,999: 6.25 BTC
Blocks 840,000+ (April 2024): 3.125 BTC

This is a "halving", and obviously effects market conditions.

## Reclaiming disk space
