import { all, translate } from "./dynamic.ts";
import { assertEquals } from "../testing/asserts.ts";
import {
  AlternativeRegEx,
  BlockComment,
  CharacterClassRegEx,
  Definition,
  LineComment,
  LiteralStringRegEx,
  ManyRegEx,
  OptionalRegEx,
  SequenceRegEx,
} from "./../la/definition.ts";
import { left, right } from "../data/either.ts";
import { mkCoordinate, range } from "./location.ts";
import { minus, rangeSet, setOf, union } from "../data/set.ts";

Deno.test("Dynamic - translate - empty", () => {
  assertEquals(translate(""), right(new Definition()));
});

Deno.test("Dynamic - translate - extend", () => {
  assertEquals(
    translate('extend "fred";'),
    left([{
      tag: "FeatureNotImplementedError",
      location: range(7, 1, 8, 12, 1, 13),
      nature: "Extending a lexical definition",
    }]),
  );
});

Deno.test("Dynamic - translate - add token", () => {
  assertEquals(
    translate('tokens n = "hello";'),
    right(new Definition().addToken("n", new LiteralStringRegEx("hello"))),
  );
});

Deno.test("Dynamic - translate - attempt to add a token with a duplicate name", () => {
  assertEquals(
    translate('tokens n = "hello"; n = "oops";'),
    left([{
      tag: "DuplicateTokenNameError",
      location: mkCoordinate(20, 1, 21),
      name: "n",
    }]),
  );
});

Deno.test("Dynamic - translate - line comment", () => {
  assertEquals(
    translate("comments '/' '/' {!chr(10)};"),
    right(new Definition().addComment(
      new LineComment(
        new SequenceRegEx([
          new CharacterClassRegEx(setOf(47)),
          new CharacterClassRegEx(setOf(47)),
          new ManyRegEx(
            new CharacterClassRegEx(
              minus(all, setOf(10)),
            ),
          ),
        ]),
      ),
    )),
  );

  assertEquals(
    translate("comments '/' '/' {x};fragments x = !chr(10);"),
    right(
      new Definition().addComment(
        new LineComment(
          new SequenceRegEx([
            new CharacterClassRegEx(setOf(47)),
            new CharacterClassRegEx(setOf(47)),
            new ManyRegEx(
              new CharacterClassRegEx(
                minus(all, setOf(10)),
              ),
            ),
          ]),
        ),
      ).addFragment(
        "x",
        minus(all, setOf(10)),
      ),
    ),
  );
});

Deno.test("Dynamic - translate - block comment", () => {
  assertEquals(
    translate('comments "/*" to "*/" nested;'),
    right(new Definition().addComment(
      new BlockComment(
        new LiteralStringRegEx("/*"),
        new LiteralStringRegEx("*/"),
        true,
      ),
    )),
  );

  assertEquals(
    translate('comments "/*" to "*/";'),
    right(new Definition().addComment(
      new BlockComment(
        new LiteralStringRegEx("/*"),
        new LiteralStringRegEx("*/"),
        false,
      ),
    )),
  );
});

Deno.test("Dynamic - translate - whitespace", () => {
  assertEquals(
    translate("whitespace chr(1)-chr(2);"),
    right(new Definition().setWhitespace(
      rangeSet(1, 2),
    )),
  );
});

Deno.test("Dynamic - translate - line comment error reference to unknown fragment", () => {
  assertEquals(
    translate("comments '/' '/' {!x};"),
    left([{
      tag: "UnknownFragmentIdentifierError",
      location: mkCoordinate(19, 1, 20),
      name: "x",
    }]),
  );
});

Deno.test("Dynamic - translate - fragment - duplicate name", () => {
  assertEquals(
    translate("fragments f = chr(32); f = chr(64);"),
    left([{
      tag: "DuplicateFragmentNameError",
      location: mkCoordinate(23, 1, 24),
      name: "f",
    }]),
  );
});

Deno.test("Dynamic - translate - chr - greater than 255", () => {
  assertEquals(
    translate("fragments f = chr(256);"),
    left([{
      tag: "ChrOutOfRangeError",
      location: range(18, 1, 19, 20, 1, 21),
      code: 256,
    }]),
  );
});

Deno.test("Dynamic - translate - chr", () => {
  assertEquals(
    translate("fragments f = chr(32);"),
    right(new Definition().addFragment("f", setOf(32))),
  );
});

Deno.test("Dynamic - translate - literal character", () => {
  assertEquals(
    translate("fragments f = 'x';"),
    right(new Definition().addFragment("f", setOf(120))),
  );
});

Deno.test("Dynamic - translate - literal string", () => {
  assertEquals(
    translate('fragments f = "hello"; g = "";'),
    right(
      new Definition()
        .addFragment("f", new LiteralStringRegEx("hello"))
        .addFragment("g", new LiteralStringRegEx("")),
    ),
  );
});

Deno.test("Dynamic - translate - parenthesis", () => {
  assertEquals(
    translate('fragments f = ("hello"); g = (chr(32));'),
    right(
      new Definition()
        .addFragment("f", new LiteralStringRegEx("hello"))
        .addFragment("g", setOf(32)),
    ),
  );
});

Deno.test("Dynamic - translate - many", () => {
  assertEquals(
    translate('fragments f = {"hello"}; g = {chr(32)};'),
    right(
      new Definition()
        .addFragment("f", new ManyRegEx(new LiteralStringRegEx("hello")))
        .addFragment(
          "g",
          new ManyRegEx(new CharacterClassRegEx(setOf(32))),
        ),
    ),
  );
});

Deno.test("Dynamic - translate - optional", () => {
  assertEquals(
    translate('fragments f = ["hello"]; g = [chr(32)];'),
    right(
      new Definition()
        .addFragment("f", new OptionalRegEx(new LiteralStringRegEx("hello")))
        .addFragment(
          "g",
          new OptionalRegEx(new CharacterClassRegEx(setOf(32))),
        ),
    ),
  );
});

Deno.test("Dynamic - translate - known regex identifier reference", () => {
  assertEquals(
    translate('fragments f = "hello"; g = [f];'),
    right(
      new Definition()
        .addFragment("f", new LiteralStringRegEx("hello"))
        .addFragment(
          "g",
          new OptionalRegEx(
            new LiteralStringRegEx("hello"),
          ),
        ),
    ),
  );
});

Deno.test("Dynamic - translate - known character class identifier reference", () => {
  assertEquals(
    translate("fragments f = chr(32); g = [f];"),
    right(
      new Definition()
        .addFragment("f", setOf(32))
        .addFragment(
          "g",
          new OptionalRegEx(
            new CharacterClassRegEx(setOf(32)),
          ),
        ),
    ),
  );
});

Deno.test("Dynamic - translate - unknown identifier reference", () => {
  assertEquals(
    translate("fragments g = [bob];"),
    left([{
      tag: "UnknownFragmentIdentifierError",
      location: range(15, 1, 16, 17, 1, 18),
      name: "bob",
    }]),
  );
});

Deno.test("Dynamic - translate - valid range", () => {
  assertEquals(
    translate("fragments g = 'a'-'z';"),
    right(
      new Definition().addFragment(
        "g",
        rangeSet(97, 122),
      ),
    ),
  );

  assertEquals(
    translate("fragments g = ('a')-('z');"),
    right(
      new Definition().addFragment(
        "g",
        rangeSet(97, 122),
      ),
    ),
  );
});

Deno.test("Dynamic - translate - range end point is not a character", () => {
  assertEquals(
    translate("fragments g = \"a\"-'z';"),
    left([{
      tag: "RangeOperandNotCharactersError",
      location: range(14, 1, 15, 16, 1, 17),
    }]),
  );

  assertEquals(
    translate("fragments g = 'a'-\"z\";"),
    left([{
      tag: "RangeOperandNotCharactersError",
      location: range(18, 1, 19, 20, 1, 21),
    }]),
  );

  assertEquals(
    translate('fragments g = "a"-"z";'),
    left([{
      tag: "RangeOperandNotCharactersError",
      location: range(14, 1, 15, 16, 1, 17),
    }, {
      tag: "RangeOperandNotCharactersError",
      location: range(18, 1, 19, 20, 1, 21),
    }]),
  );
});

Deno.test("Dynamic - translate - not character class", () => {
  assertEquals(
    translate("fragments g = !('a'-'z');"),
    right(
      new Definition().addFragment(
        "g",
        minus(all, rangeSet(97, 122)),
      ),
    ),
  );
});

Deno.test("Dynamic - translate - not regex error", () => {
  assertEquals(
    translate('fragments g = !"hello";'),
    left([{
      tag: "NotExpectsCharacterClassError",
      location: range(14, 1, 15, 21, 1, 22),
    }]),
  );
});

Deno.test("Dynamic - translate - minus character class", () => {
  assertEquals(
    translate("fragments g = 'a' \\ 'b';"),
    right(
      new Definition().addFragment(
        "g",
        minus(setOf(97), setOf(98)),
      ),
    ),
  );
});

Deno.test("Dynamic - translate - minus character class regex error", () => {
  assertEquals(
    translate("fragments g = \"hello\" \\ 'e';"),
    left([{
      tag: "MinusOperandNotCharacterClassError",
      location: range(14, 1, 15, 20, 1, 21),
    }]),
  );

  assertEquals(
    translate("fragments g = ('a'-'z') \\ \"e\";"),
    left([{
      tag: "MinusOperandNotCharacterClassError",
      location: range(26, 1, 27, 28, 1, 29),
    }]),
  );
});

Deno.test("Dynamic - translate - union character class", () => {
  assertEquals(
    translate("fragments g = 'a' + 'b';"),
    right(
      new Definition().addFragment(
        "g",
        union(setOf(97), setOf(98)),
      ),
    ),
  );
});

Deno.test("Dynamic - translate - union character class regex error", () => {
  assertEquals(
    translate("fragments g = \"hello\" + 'e';"),
    left([{
      tag: "UnionOperandNotCharacterClassError",
      location: range(14, 1, 15, 20, 1, 21),
    }]),
  );

  assertEquals(
    translate("fragments g = ('a'-'z') + \"e\";"),
    left([{
      tag: "UnionOperandNotCharacterClassError",
      location: range(26, 1, 27, 28, 1, 29),
    }]),
  );
});

Deno.test("Dynamic - translate - sequence regex", () => {
  assertEquals(
    translate("fragments g = 'a' \"hello\";"),
    right(
      new Definition().addFragment(
        "g",
        new SequenceRegEx([
          new CharacterClassRegEx(setOf(97)),
          new LiteralStringRegEx("hello"),
        ]),
      ),
    ),
  );
});

Deno.test("Dynamic - translate - alternative regex", () => {
  assertEquals(
    translate("fragments g = 'a' | \"hello\";"),
    right(
      new Definition().addFragment(
        "g",
        new AlternativeRegEx([
          new CharacterClassRegEx(setOf(97)),
          new LiteralStringRegEx("hello"),
        ]),
      ),
    ),
  );
});
