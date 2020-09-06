# scanpiler

This project is an implementation of a backtracking lexical automaton designed specifically for specifying and generating scanners or lexical analysers for programming and domain languages.  The project has the following features:

- Provides a syntax to define a programming language's lexical structure,
- Parsers the input file into an internal structure
- Creates the automaton for the internal structure

## See Also

A number of projects together make up the entire `scanpiler` suite.  The following describes each of the projects, their purpose and how they relate to all of the other projects.

| Name | Descrpition | Related to |
|------|-------------|------------|
| scanpiler | Parsers a scanner definition and translates the definition into multiple DFAs for the purpose of building scanners in a target language. | [scanpiler-deno-lib](https://github.com/littlelanguages/scanpiler-deno-lib) |
| [scanpiler-deno-lib](https://github.com/littlelanguages/scanpiler-deno-lib) | A library that all Deno generated scanners will need to include.  `scanpiler` was built using `scanpiler` and therefore this project has a dependecy on this Deno library. | |
| [scanpiler-tool-deno](https://github.com/littlelanguages/scanpiler-tool-deno) | Given a scanner definition this tool will produce a scanner in Typescript that can be included into a Deno code base. | [scanpiler](https://github.com/littlelanguages/scanpiler), [scanpiler-deno-lib](https://github.com/littlelanguages/scanpiler-deno-lib) |
| [scanpiler-tool-viz](https://github.com/littlelanguages/scanpiler-tool-viz) | Given an FA (Finite State Automaton) this tool is able to produce a [Graphviz](https://graphviz.org) visualisation of the FA in the dot format.  This visualisation is useful when interpretting the generated code from `scanpliler`'s tools. | [scanpiler](https://github.com/littlelanguages/scanpiler) |
| [scanpiler-cli](https://github.com/littlelanguages/scanpiler-cli) | A single CLI that encompasses all of the `scanpiler` tools. | [scanpiler-tool-deno](https://github.com/littlelanguages/scanpiler-tool-deno), [scanpiler-tool-viz](https://github.com/littlelanguages/scanpiler-tool-viz) |


## Input Syntax

The following EBNF grammar defines the syntax of a lexical definition.

```
Definition: 
    ["extend" LiteralString ";"]
    ["tokens" {Identifier "=" Expr ";"}]
    ["comments" {Comment ";"}]
    ["whitespace" Expr ";"]
    ["fragments" {Identifier "=" Expr ";"}]

Comment: Expr ["to" Expr ["nested"]];

Expr: SequenceExpr {"|" SequenceExpr};

SequenceExpr: UnionExpr {UnionExpr};

UnionExpr: MinusExpr {"+" MinusExpr};

MinusExpr: NotExpr {"\" NotExpr};

NotExpr: ["!"] RangeExpr;

RangeExpr: Factor ["-" Factor];

Factor
  : "chr" "(" LiteralInt ")" 
  | LiteralCharacter 
  | LiteralString
  | "(" Expr ")"
  | "{" Expr "}"
  | "[" Expr "]"
  | Identifier
  ;
```

Using this grammar `scanpiler`'s lexical structure is defined as follows:

```
tokens
    LiteralCharacter = chr(39) !chr(39) chr(39);
    LiteralInt = digit {digit};
    LiteralString = '"' {!'"'} '"';
    Identifier = alpha {alpha | digit};

comments
    "/*" to "*/" nested;
    "//" {!cr};

whitespace
    chr(0)-' ';

fragments
    digit = '0'-'9';
    alpha = 'a'-'z' + 'A'-'Z';
    cr = chr(10);
```
