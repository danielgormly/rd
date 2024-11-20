#include <stddef.h>
#include <stdint.h>
#include <stdio.h>

int parse_uint8_naive(const char *str, size_t len, uint8_t *num) {
  uint32_t n = 0;
  // oop strips out longer characters, only deals with final 3
  for (size_t i = 0, r = len & 0x3; i < r; i++) {
    printf("%c\n", str[i]);
    uint8_t d = (uint8_t)(str[i] - '0'); // convert str[i] - ASCII '0', then cast as an uint8_t
    if (d > 9)
     return 0; // NaN
    n = n * 10 + d; // promote existing place, add current integer
  }
  *num = (uint8_t)n; // cast *num back to uint8_t, 256 max
  printf("%d\n", n);
  return n < 256 && len && len < 4; // n is less than 256 (uint8 max) & has a length of less than 4
}

int main() {
  uint8_t num;
  // This is 123
  const char *r1 = "123";
  int res1 = parse_uint8_naive(r1, 3, &num);
  printf("%s: %s\n", r1, res1 ? "true" : "false");
  // This is 256
  const char *r2 = "256";
  int res2 = parse_uint8_naive(r2, 3, &num);
  printf("%s: %s\n", r2, res2 ? "true" : "false");
  // This is 1000 (so why 0 - as opposed to 100?)
  const char *r3 = "1000"; // returns 0, because 4 & 3 === 0, so loop is skipped!
  int res3 = parse_uint8_naive(r3, 4, &num);
  printf("%s: %s\n", r3, res3 ? "true" : "false");
  // This is actually 256
  const char *r4 = "255012052525252512";
  int res4 = parse_uint8_naive(r4, 3, &num);
  printf("%s: %s\n", r4, res4 ? "true" : "false");
  return 0;
}
