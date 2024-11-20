## 8-bit integer parsing performance

Making sense of blogs:
https://blog.loadzero.com/blog/parse-int-nerdsnipe/
https://lemire.me/blog/2023/11/28/parsing-8-bit-integers-quickly/

`make run`

## ASCII notes
0x30 = 48
str "0" = 48 = 0x00000030
str "1" = 49 = 0x00000031
str "2" = 50 = 0x0000002A
...

0x[30]303030

str "0" = 48d = 0x30 = 00110000

0 (ASCII) 00110000 ^= 00110000 = 00000000 = 0d
1 (ASCII) 00110001 ^= 00110000 = 00000001 = 1d
2 (ASCII) 00110010 ^= 00110000 = 00000010 = 2d
3 (ASCII) 00110011 ^= 00110000 = 00000100 = 3d

0123
flips into
00000001 00000010 00000011 00000000

shifts into

00000000 00000001 00000010 00000011

```c
// are they all digits?
uint32_t all_digits =
    ((digits.as_int | (0x06060606 + digits.as_int)) & 0xF0F0F0F0)
       == 0;
``` (big wtf)


i haven't read your response yet, because it took me about 4 hours to get through https://lemire.me/blog/2023/11/28/parsing-8-bit-integers-quickly/

but i enjoyed doing it, haven't spent enough time on bit/byte level stuff

and llm was ok conceptually at guiding, but couldn't beat working out by hand and confirming with printf("%#x", ...)

all those one op validation steps
