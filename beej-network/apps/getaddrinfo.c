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
        printf("%s: %s\n", ipver, ipstr);
    }
    freeaddrinfo(res);
    return i;
}
