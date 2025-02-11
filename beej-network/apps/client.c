#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <netdb.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>

#define MAX_REQ_SIZE 100 // max number of bytes we can get at once
#define PORT "8080" // port client connects to

// get sockaddr, IPv4 or IPv6:
void *get_in_addr(struct sockaddr *sa) { // sockaddr is a struct that can hold ipv4 or v6
    if (sa->sa_family == AF_INET) { // ipv4
        return &(((struct sockaddr_in*)sa)->sin_addr); // returns ipv4
    }
    return &(((struct sockaddr_in6*)sa)->sin6_addr); // ipv6
}


int main(int argc, char *argv[]) {
    int sockfd, numbytes;
    char buf[MAX_REQ_SIZE];
    struct addrinfo hints, *servinfo, *p; // hints = subset of what kind of socket etc
    int rv; // HUH?
    char s[INET6_ADDRSTRLEN];

    if (argc != 2) {
        fprintf(stderr, "usage: client hostname\n");
        exit(1);
    }

    memset(&hints, 0, sizeof hints); // wipe out hints with 0s
    hints.ai_family = AF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;

    if ((rv = getaddrinfo(argv[1], PORT, &hints, &servinfo)) != 0) {
        fprintf(stderr, "getaddrinfo: %s\n", gai_strerror(rv));
        return 1;
    }

    // Loop through getaddrinfo results
    for (p = servinfo; p != NULL; p = p->ai_next) {
        if ((sockfd = socket(p->ai_family, p->ai_socktype, p->ai_protocol)) == -1) {
            perror("client: socket");
            continue;
        }
        if (connect(sockfd, p->ai_addr, p->ai_addrlen) == -1) {
            close(sockfd);
            perror("client: connect");
            continue;
        }
        break;
    }
    if (p == NULL) {
        fprintf(stderr, "client: failed to connect\n");
        return 2;
    }
    inet_ntop(p->ai_family, get_in_addr((struct sockaddr *)p->ai_addr), s, sizeof s);
    printf("client: connecting to %s", s);
    freeaddrinfo(servinfo);
    if ((numbytes = recv(sockfd, buf, MAX_REQ_SIZE-1, 0)) == -1) {
        perror("recv");
        exit(1);
    }
    buf[numbytes] = '\0';
    printf("client: received '%s' \n", buf);
    close(sockfd);
    return 0;
}
