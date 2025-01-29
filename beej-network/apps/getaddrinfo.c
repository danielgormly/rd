// man getaddrinfo
// gcc -o ./bin/getaddrinfo apps/getaddrinfo.c
// ./bin/getaddrinfo

#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <stdio.h>
#include <arpa/inet.h>

int print_args(int argc, char *argv[]) {
    printf("argc=%i;", argc);
    int i;
    for (i = 0; i < argc; i++) {
        printf("arg%i=%s%s", i, argv[i], i < argc - 1 ? ";" : "");
    }
    printf("\n");
    return 0;
}

int main(int argc, char *argv[]) {
    print_args(argc, argv);
    if (argc != 2) {
        printf("usage: getaddrinfo hostname");
    }
    char *hostname = argv[1];
    char *servname = "http";
    struct addrinfo hints;
    memset(&hints, 0, sizeof(hints));
    hints.ai_family = PF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;
    struct addrinfo *res;
    printf("Attempting to getaddrinfo @ %s://%s\n", servname, hostname);
    int i = getaddrinfo(hostname, servname, &hints, &res);
    if (i > 0) {
        printf("Error: %i - %s\n", i, gai_strerror(i));
        exit(i);
    }
    struct addrinfo *cur;
    char ipstr[INET6_ADDRSTRLEN];
    int s; // socket
    for (cur = res; cur != NULL; cur = cur->ai_next) {
        void *addr;
        char *ipver;
        if (cur->ai_family == AF_INET) {
            struct sockaddr_in *ipv4 = (struct sockaddr_in *)cur->ai_addr;
            addr = &(ipv4->sin_addr);
            ipver = "IPv4";
        } else {
            struct sockaddr_in6 *ipv6 = (struct sockaddr_in6 *)cur->ai_addr;
			addr = &(ipv6->sin6_addr);
            ipver = "IPv6";
        }
        inet_ntop(cur->ai_family, addr, ipstr, sizeof ipstr);
        printf("Attempting to create socket %s: %s\n", ipver, ipstr);
        s = socket(cur->ai_family, cur->ai_socktype, cur->ai_protocol);
        if (s == -1) {
            printf("Socket creation failed\n");
            continue;
        } else {
            printf("Socket created - %i\n", s);
            break;
        }
    }
    // s
    int e = connect(s, cur->ai_addr, cur->ai_addrlen);
    if (e != 0) {
        printf("Connection failed!");
        exit(e);
    }
    char *req = "GET / HTTP/1.1\r\n"
    "Host: google.com\r\n"
    "Connection: close\r\n"
    "\r\n";
    char *response = (char *)malloc(10240);
    send(s, req, strlen(req), 0);
    recv(s, response, strlen(req), 0);
    printf("%s", response);
    memset(response, 0, 10240);
    freeaddrinfo(res);
    return i;
}
