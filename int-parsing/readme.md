## 8-bit integer parsing performance

Making sense of blogs:
https://blog.loadzero.com/blog/parse-int-nerdsnipe/
https://lemire.me/blog/2023/11/28/parsing-8-bit-integers-quickly/

`make run`

## ASCII notes
0x30 = 48
str "0" = 48 = 0x00000030
str "1" = 49 = 0x00000031
str "2" = 50 = 0x00000032
...

0x[30]303030

str "0" = 48d = 0x30 = 00110000

0 (ASCII) 00110000 ^= 00110000 = 00000000 = 0D
1 (ASCII) 00110001 ^= 00110000 = 00000001 = 1D
2 (ASCII) 00110010 ^= 00110000 = 00000010 = 2D
3 (ASCII) 00110011 ^= 00110000 = 00000100 = 3D

0123
flips into
00000001 00000010 00000011 00000000

shifts into

00000000 00000001 00000010 00000011
