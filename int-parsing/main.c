#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

int parse_uint8_fastswar(const char *str, size_t len,
    uint8_t *num) {
  if(len == 0 || len > 3) { return 0; } // discard if nil or > 3
  union { uint8_t as_str[4]; uint32_t as_int; } digits; // union named digits with 4x8 bits and 1x32 bits
  memcpy(&digits.as_int, str, sizeof(digits)); // copies str to union
  printf("as_int: %#x\n", digits.as_int);
  // the next line effectively strips off the ascii encoding
  digits.as_int ^= 0x30303030lu; // 32bit representation XOR 4x8bit ASCII 0000 long unsigned
  printf("as_int, shifted: %#x\n", digits.as_int);
  digits.as_int <<= ((4 - len) * 8); // shift left, wrapping around, swapping padding to front
  uint32_t all_digits =
    ((digits.as_int | (0x06060606 + digits.as_int)) & 0xF0F0F0F0)
       == 0; // validation: is the number 0-9?, first buff every digit so 9 is close to 15, then shave off the top half
  *num = (uint8_t)((0x640a01 * digits.as_int) >> 24); // multiply by 100,10,1
  return all_digits
   & ((__builtin_bswap32(digits.as_int) <= 0x020505));
}

int main() {
  uint8_t num;
  // This is 123
  const char *r1 = "123";
  int res1 = parse_uint8_fastswar(r1, 3, &num);
  printf("%s: %s\n", r1, res1 ? "true" : "false");
  // This is 256
  // const char *r2 = "256";
  // int res2 = parse_uint8_fastswar(r2, 3, &num);
  // printf("%s: %s\n", r2, res2 ? "true" : "false");
  // This is 1000 (so why 0 - as opposed to 100?)
  // const char *r3 = "1000"; // returns 0, because 4 & 3 === 0, so loop is skipped!
  // int res3 = parse_uint8_fastswar(r3, 4, &num);
  // printf("%s: %s\n", r3, res3 ? "true" : "false");
  // This is actually 256
  // const char *r4 = "255012052525252512";
  // int res4 = parse_uint8_fastswar(r4, 3, &num);
  // printf("%s: %s\n", r4, res4 ? "true" : "false");
  return 0;
}
