// gcc -o bin/main main.c
#include <sys/socket.h>
#include <time.h>
#include <stdio.h>

int main(int argc, char *argv[]) {
    char *arg_string = "args";
    if (argc == 1) {
        arg_string = "arg";
    }
    printf("we received %i %s", argc, arg_string);
    time_t t;
    struct tm *tm_info;
    char day_of_week[20];

    time(&t);
    tm_info = localtime(&t);

    strftime(day_of_week, 20, "%A", tm_info);
    printf("Today is %s.\n", day_of_week);

    return 0;
}
