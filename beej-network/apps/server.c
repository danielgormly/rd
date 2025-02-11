#include <arpa/inet.h>
#include <asm-generic/socket.h>
#include <signal.h>
#include <string.h>
#include <stdio.h>
#include <netdb.h>
#include <errno.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <sys/wait.h>
#include <unistd.h>

#define PORT "8080"
#define BACKLOG 10 // pending connection queue size

void sigchld_handler(int s)
{
    // waitpid() might overwrite errno, so we save and restore it:
    int saved_errno = errno; // HUH
    while(waitpid(-1, NULL, WNOHANG) > 0); // HUH
    errno = saved_errno; // HUH
}

// get sockaddr, IPv4 or IPv6:
void *get_in_addr(struct sockaddr *sa) { // sockaddr is a struct that can hold ipv4 or v6
    if (sa->sa_family == AF_INET) { // ipv4
        return &(((struct sockaddr_in*)sa)->sin_addr); // returns ipv4
    }
    return &(((struct sockaddr_in6*)sa)->sin6_addr); // ipv6
}

int main(int argc, char *argv[]) {
    int sockfd, new_fd; // listen on sock_fd, new connection on new_fd
    struct addrinfo hints, *servinfo, *p;
    struct sockaddr_storage their_addr; // connector's address information
    socklen_t sin_size;
    struct sigaction sa;
    int yes=1;
    char s[INET6_ADDRSTRLEN];
    int rv;

    memset(&hints, 0, sizeof hints);
    hints.ai_family = AF_UNSPEC; // either ipv4 or 6
    hints.ai_socktype = SOCK_STREAM; // TCPish
    hints.ai_flags = AI_PASSIVE; // My IP, we're going to bind to this

    // Getting our own address to listen on
    if ((rv = getaddrinfo(NULL, PORT, &hints, &servinfo)) != 0) {
        fprintf(stderr, "getaddrinfo: %s\n", gai_strerror(rv));
        return 1;
    }
    // loop through & bind asap
    for (p = servinfo; p != NULL; p = p->ai_next) {
        if ((sockfd = socket(p->ai_family, p->ai_socktype, p->ai_protocol)) == -1) {
            perror("server:socket");
            continue;
        }
        if (setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &yes, sizeof(int)) == -1) {
            exit(1);
        }
        if (bind(sockfd, p->ai_addr, p->ai_addrlen) == -1) {
            close(sockfd);
            perror("server:bind");
            continue;
        }
        break;
    }
    freeaddrinfo(servinfo);
    if (p == NULL) {
        fprintf(stderr, "server: failed to bind\n");
        exit(1);
    }
    if (listen(sockfd, BACKLOG) == -1) {
        perror("listen");
        exit(1);
    }
    sa.sa_handler = sigchld_handler; // reap dead processes
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART;
    if (sigaction(SIGCHLD, &sa, NULL) == -1) {
        perror("sigaction");
        exit(1);
    }
    printf("server: listening on port %s\n", PORT);
    // main loop
    while(1) {
        sin_size = sizeof their_addr;
        new_fd = accept(sockfd, (struct sockaddr *)&their_addr, &sin_size);
        if (new_fd == -1) {
            perror("accept");
            continue;
        }

        inet_ntop(their_addr.ss_family, get_in_addr((struct sockaddr *)&their_addr), s, sizeof s);
        printf("server: got connection from %s\n", s);

        if (!fork()) { // child process:
            close(sockfd); // child doesn't need the listener
            if (send(new_fd, "Hello, World", 13, 0) == -1) perror("send");
            close(new_fd);
            exit(0);
        }
        close(new_fd); // parent can discard
    }
    return 0;
}
