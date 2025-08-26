# Macros

## Major types
- macros = Declarative macros with macro_rules!
- proc_macros = Procedural macros

## Procedrual macro types
- Custom #[derive] macros on structs & enums
- Attribute-like macros that define custom attributes usable on any time
- Function-like macros that look like function calls but operate on the tokens specified as their args

## Macros
- METAPROGRAMMING
- can take variable number of arguments
- macros expand prior to compiler interpretation
- compile time indirection
- increases compilation complexity
- reduce the amount of code you have to write & maintain
- expands to potentially simpler runtime
- macros must be brought into scope before use

## Declarative Macros with macro_rules!
Aka "macros by example" or "macros".

## Procedural Macros for Generating Code from Attributes
