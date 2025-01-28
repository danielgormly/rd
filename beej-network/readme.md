# Beej's guide to Network Programming: Internet sockets!

https://beej.us/guide/bgnet/html/split/intro.html

## OSX `man send`
```c
#include <sys/socket.h>

// Normally used for sending tcp messages
// May only be used in a connected state
ssize_t
send(int socket, const void *buffer, size_t length, int flags);

// Normally used for udp datagrams
ssize_t
sendto(int socket, const void *buffer, size_t length, int flags,
    const struct sockaddr *dest_addr, socklen_t dest_len);
```

## Unix Sockets
Sockets are standard Unix file descriptors used for sending & receiving data between applications. You can write to sockets with read() & write(), but send() & receive() offer much more control. There are multiple types of sockets (Internet Sockets, Unix Sockets, x.25 sockets). This guide talks about Internet Sockets.

## File descriptors?
An integer associated with an open file; a file being basically anything.

## 2.1 Types of Internet Sockets
- Datagram sockets (SOCK_DGRAM) - UDP - stateless, shot in the dark
- Stream sockets (SOCK_STREAM) - TCP - stateful, reliable, ordered
- Raw sockets
- More... (out of scope)

## 3.1 Notes on IPv4
255 decimal = 11111111 binary
IPv4 = 255.255.255.255
192.0.2.12/30 = IPv4 address + 30 bits of network, so there are only 2 bits that represent the range of available addresses.
11111111.00000000.00000010.000011xx = 00, 01, 10, 11 (12,13,14,15)
(4 billion addresses)

## 3.1 IPv6
IPv4 as IPv6 = ::ffff:192.0.2.33
IPv6 with netmask 2001:db8:5413:4028::9db9/64
(2^128 address space)

## 3.1.2 Ports
UDP & TCP both have a 16-bit number (0-65535) that represents a local address for the connection.

## 3.2 Byte Order
Big-Endian is similar to decimal. Little-Endian reverses byte order within a word (RIP). Network is Big-Endian, but Host Byte Order varies. Assume you don't know & use conversion functions regardless:

htons() 	host to network short
htonl() 	host to network long
ntohs() 	network to host short
ntohl() 	network to host long

## 3.3 structs
