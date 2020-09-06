import * as AbstractScanner from "https://raw.githubusercontent.com/littlelanguages/scanpiler-deno-lib/0.0.1/abstract-scanner.ts";

export type Token = AbstractScanner.Token<TToken>;

export class Scanner extends AbstractScanner.Scanner<TToken> {
  constructor(input: string) {
    super(input, TToken.ERROR);
  }

  next() {
    if (this.currentToken[0] != TToken.EOS) {
      while (0 <= this.nextCh && this.nextCh <= 32) {
        this.nextChar();
      }

      let state = 0;
      while (true) {
        switch (state) {
          case 0: {
            if (this.nextCh == 99) {
              this.markAndNextChar();
              state = 1;
              break;
            } else if (this.nextCh == 101) {
              this.markAndNextChar();
              state = 2;
              break;
            } else if (this.nextCh == 102) {
              this.markAndNextChar();
              state = 3;
              break;
            } else if (this.nextCh == 110) {
              this.markAndNextChar();
              state = 4;
              break;
            } else if (this.nextCh == 116) {
              this.markAndNextChar();
              state = 5;
              break;
            } else if (this.nextCh == 119) {
              this.markAndNextChar();
              state = 6;
              break;
            } else if (this.nextCh == 92) {
              this.markAndNextChar();
              state = 7;
              break;
            } else if (this.nextCh == 33) {
              this.markAndNextChar();
              state = 8;
              break;
            } else if (this.nextCh == 124) {
              this.markAndNextChar();
              state = 9;
              break;
            } else if (this.nextCh == 61) {
              this.markAndNextChar();
              state = 10;
              break;
            } else if (this.nextCh == 91) {
              this.markAndNextChar();
              state = 11;
              break;
            } else if (this.nextCh == 123) {
              this.markAndNextChar();
              state = 12;
              break;
            } else if (this.nextCh == 40) {
              this.markAndNextChar();
              state = 13;
              break;
            } else if (this.nextCh == 45) {
              this.markAndNextChar();
              state = 14;
              break;
            } else if (this.nextCh == 43) {
              this.markAndNextChar();
              state = 15;
              break;
            } else if (this.nextCh == 93) {
              this.markAndNextChar();
              state = 16;
              break;
            } else if (this.nextCh == 125) {
              this.markAndNextChar();
              state = 17;
              break;
            } else if (this.nextCh == 41) {
              this.markAndNextChar();
              state = 18;
              break;
            } else if (this.nextCh == 59) {
              this.markAndNextChar();
              state = 19;
              break;
            } else if (
              65 <= this.nextCh && this.nextCh <= 90 || this.nextCh == 97 ||
              this.nextCh == 98 || this.nextCh == 100 ||
              103 <= this.nextCh && this.nextCh <= 109 ||
              111 <= this.nextCh && this.nextCh <= 115 || this.nextCh == 117 ||
              this.nextCh == 118 || 120 <= this.nextCh && this.nextCh <= 122
            ) {
              this.markAndNextChar();
              state = 20;
              break;
            } else if (this.nextCh == 39) {
              this.markAndNextChar();
              state = 21;
              break;
            } else if (48 <= this.nextCh && this.nextCh <= 57) {
              this.markAndNextChar();
              state = 22;
              break;
            } else if (this.nextCh == 34) {
              this.markAndNextChar();
              state = 23;
              break;
            } else if (this.nextCh == -1) {
              this.markAndNextChar();
              state = 24;
              break;
            } else if (this.nextCh == 47) {
              this.markAndNextChar();
              state = 25;
              break;
            } else {
              this.markAndNextChar();
              this.attemptBacktrackOtherwise(TToken.ERROR);
              return;
            }
          }
          case 1: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 103 ||
              105 <= this.nextCh && this.nextCh <= 110 ||
              112 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 104) {
              this.nextChar();
              state = 26;
              break;
            } else if (this.nextCh == 111) {
              this.nextChar();
              state = 27;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 2: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 119 || this.nextCh == 121 ||
              this.nextCh == 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 120) {
              this.nextChar();
              state = 28;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 3: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 113 ||
              115 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 114) {
              this.nextChar();
              state = 29;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 4: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 100 ||
              102 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 101) {
              this.nextChar();
              state = 30;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 5: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 110 ||
              112 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 111) {
              this.nextChar();
              state = 31;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 6: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 103 ||
              105 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 104) {
              this.nextChar();
              state = 32;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 7: {
            this.setToken(8);
            return;
          }
          case 8: {
            this.setToken(9);
            return;
          }
          case 9: {
            this.setToken(10);
            return;
          }
          case 10: {
            this.setToken(11);
            return;
          }
          case 11: {
            this.setToken(12);
            return;
          }
          case 12: {
            this.setToken(13);
            return;
          }
          case 13: {
            this.setToken(14);
            return;
          }
          case 14: {
            this.setToken(15);
            return;
          }
          case 15: {
            this.setToken(16);
            return;
          }
          case 16: {
            this.setToken(17);
            return;
          }
          case 17: {
            this.setToken(18);
            return;
          }
          case 18: {
            this.setToken(19);
            return;
          }
          case 19: {
            this.setToken(20);
            return;
          }
          case 20: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 21: {
            if (
              0 <= this.nextCh && this.nextCh <= 38 ||
              40 <= this.nextCh && this.nextCh <= 255
            ) {
              this.nextChar();
              state = 33;
              break;
            } else {
              this.attemptBacktrackOtherwise(TToken.ERROR);
              return;
            }
          }
          case 22: {
            if (48 <= this.nextCh && this.nextCh <= 57) {
              this.nextChar();
              state = 22;
              break;
            } else {
              this.setToken(23);
              return;
            }
          }
          case 23: {
            if (
              0 <= this.nextCh && this.nextCh <= 33 ||
              35 <= this.nextCh && this.nextCh <= 255
            ) {
              this.nextChar();
              state = 23;
              break;
            } else if (this.nextCh == 34) {
              this.nextChar();
              state = 34;
              break;
            } else {
              this.attemptBacktrackOtherwise(TToken.ERROR);
              return;
            }
          }
          case 24: {
            this.setToken(25);
            return;
          }
          case 25: {
            if (this.nextCh == 42) {
              this.nextChar();
              state = 35;
              break;
            } else if (this.nextCh == 47) {
              this.nextChar();
              state = 36;
              break;
            } else {
              this.attemptBacktrackOtherwise(TToken.ERROR);
              return;
            }
          }
          case 26: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 113 ||
              115 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 114) {
              this.nextChar();
              state = 37;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 27: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 108 ||
              110 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 109) {
              this.nextChar();
              state = 38;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 28: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 115 ||
              117 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 116) {
              this.nextChar();
              state = 39;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 29: {
            if (this.nextCh == 97) {
              this.nextChar();
              state = 40;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              98 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 30: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 114 ||
              116 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 115) {
              this.nextChar();
              state = 41;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 31: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 106 ||
              108 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 107) {
              this.nextChar();
              state = 42;
              break;
            } else {
              this.setToken(5);
              return;
            }
          }
          case 32: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 104 ||
              106 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 105) {
              this.nextChar();
              state = 43;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 33: {
            if (this.nextCh == 39) {
              this.nextChar();
              state = 44;
              break;
            } else {
              this.attemptBacktrackOtherwise(TToken.ERROR);
              return;
            }
          }
          case 34: {
            this.setToken(24);
            return;
          }
          case 35: {
            let nstate = 0;
            let nesting = 1;
            while (true) {
              switch (nstate) {
                case 0: {
                  if (
                    0 <= this.nextCh && this.nextCh <= 41 ||
                    43 <= this.nextCh && this.nextCh <= 46 ||
                    48 <= this.nextCh && this.nextCh <= 255
                  ) {
                    this.nextChar();
                    nstate = 1;
                    break;
                  } else if (this.nextCh == 42) {
                    this.nextChar();
                    nstate = 2;
                    break;
                  } else if (this.nextCh == 47) {
                    this.nextChar();
                    nstate = 3;
                    break;
                  } else {
                    this.attemptBacktrackOtherwise(TToken.ERROR);
                    return;
                  }
                }
                case 1: {
                  nstate = 0;
                  break;
                }
                case 2: {
                  if (this.nextCh == 47) {
                    this.nextChar();
                    nstate = 4;
                    break;
                  } else {
                    nstate = 0;
                    break;
                  }
                }
                case 3: {
                  if (this.nextCh == 42) {
                    this.nextChar();
                    nstate = 5;
                    break;
                  } else {
                    nstate = 0;
                    break;
                  }
                }
                case 4: {
                  nesting -= 1;
                  if (nesting == 0) {
                    this.next();
                    return;
                  } else {
                    nstate = 0;
                    break;
                  }
                }
                case 5: {
                  nesting += 1;
                  nstate = 0;
                  break;
                }
              }
            }
          }
          case 36: {
            if (
              0 <= this.nextCh && this.nextCh <= 9 ||
              11 <= this.nextCh && this.nextCh <= 255
            ) {
              this.nextChar();
              state = 36;
              break;
            } else {
              this.next();
              return;
            }
          }
          case 37: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else {
              this.setToken(0);
              return;
            }
          }
          case 38: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 108 ||
              110 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 109) {
              this.nextChar();
              state = 45;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 39: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 100 ||
              102 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 101) {
              this.nextChar();
              state = 46;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 40: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 102 ||
              104 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 103) {
              this.nextChar();
              state = 47;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 41: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 115 ||
              117 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 116) {
              this.nextChar();
              state = 48;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 42: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 100 ||
              102 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 101) {
              this.nextChar();
              state = 49;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 43: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 115 ||
              117 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 116) {
              this.nextChar();
              state = 50;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 44: {
            this.setToken(22);
            return;
          }
          case 45: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 100 ||
              102 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 101) {
              this.nextChar();
              state = 51;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 46: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 109 ||
              111 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 110) {
              this.nextChar();
              state = 52;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 47: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 108 ||
              110 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 109) {
              this.nextChar();
              state = 53;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 48: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 100 ||
              102 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 101) {
              this.nextChar();
              state = 54;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 49: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 109 ||
              111 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 110) {
              this.nextChar();
              state = 55;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 50: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 100 ||
              102 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 101) {
              this.nextChar();
              state = 56;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 51: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 109 ||
              111 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 110) {
              this.nextChar();
              state = 57;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 52: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 99 ||
              101 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 100) {
              this.nextChar();
              state = 58;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 53: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 100 ||
              102 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 101) {
              this.nextChar();
              state = 59;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 54: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 99 ||
              101 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 100) {
              this.nextChar();
              state = 60;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 55: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 114 ||
              116 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 115) {
              this.nextChar();
              state = 61;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 56: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 114 ||
              116 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 115) {
              this.nextChar();
              state = 62;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 57: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 115 ||
              117 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 116) {
              this.nextChar();
              state = 63;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 58: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else {
              this.setToken(2);
              return;
            }
          }
          case 59: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 109 ||
              111 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 110) {
              this.nextChar();
              state = 64;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 60: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else {
              this.setToken(4);
              return;
            }
          }
          case 61: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else {
              this.setToken(6);
              return;
            }
          }
          case 62: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 111 ||
              113 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 112) {
              this.nextChar();
              state = 65;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 63: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 114 ||
              116 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 115) {
              this.nextChar();
              state = 66;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 64: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 115 ||
              117 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 116) {
              this.nextChar();
              state = 67;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 65: {
            if (this.nextCh == 97) {
              this.nextChar();
              state = 68;
              break;
            } else if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              98 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 66: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else {
              this.setToken(1);
              return;
            }
          }
          case 67: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 114 ||
              116 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 115) {
              this.nextChar();
              state = 69;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 68: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 || this.nextCh == 97 ||
              this.nextCh == 98 || 100 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 99) {
              this.nextChar();
              state = 70;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 69: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else {
              this.setToken(3);
              return;
            }
          }
          case 70: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 100 ||
              102 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else if (this.nextCh == 101) {
              this.nextChar();
              state = 71;
              break;
            } else {
              this.setToken(21);
              return;
            }
          }
          case 71: {
            if (
              48 <= this.nextCh && this.nextCh <= 57 ||
              65 <= this.nextCh && this.nextCh <= 90 ||
              97 <= this.nextCh && this.nextCh <= 122
            ) {
              this.nextChar();
              state = 20;
              break;
            } else {
              this.setToken(7);
              return;
            }
          }
        }
      }
    }
  }
}

export function mkScanner(input: string): Scanner {
  return new Scanner(input);
}

export enum TToken {
  Chr,
  Comments,
  Extend,
  Fragments,
  Nested,
  To,
  Tokens,
  Whitespace,

  Backslash,
  Bang,
  Bar,
  Equal,
  LBracket,
  LCurly,
  LParen,
  Minus,
  Plus,
  RBracket,
  RCurly,
  RParen,
  Semicolon,

  Identifier,
  LiteralCharacter,
  LiteralInt,
  LiteralString,

  EOS,
  ERROR,
}
