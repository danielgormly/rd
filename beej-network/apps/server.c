#include <stdio.h>
#include <netdb.h>

#define PORT "8080"
#define BACKLOG 10 // pending connection queue size

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
    print_args(argc, argv); // Debug
    int sockfd, new_fd; // Listen on sockfd, new connection on new_fd - why?
    struct addrinfo hints, *servinfo, *p;
    struct sockaddr_storage their_addr; // connector's address information
    socklen_t sin_size;
    struct sigaction sa;
    return 0;
}
