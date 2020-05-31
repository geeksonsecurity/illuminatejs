![CI](https://github.com/geeksonsecurity/illuminatejs/workflows/CI/badge.svg?branch=master)

# Intro
> IlluminateJs is a static javascript deobfuscator aimed to help analyst understand obfuscated and potentially malicious JavaScript Code. Consider it like JSDetox (the static part), but on steroids. 

# Usage

## CLI
You can use the deobfuscator straight away with the **babel-cli** node module (`npm install @babel/core @babel/cli`).
From the root project execute `babel.js` specifying the `plugins` parameter with the `babel-plugin-deobfuscate` path and the desired file to deobfuscate. For example:
```
$ cat test.js 
var x=1;
console.log(x+1);      

$ ./node_modules/babel-cli/bin/babel.js --plugins ./lib/illuminatejs.js  test.js
const x = 1;
console.log(2);
```

## React Webapp
The `playground` folder contains a simple React app that uses the deobfuscator plugin. Please refer to [playground/README.md](playground/README.md) to get it running.

There is an outdated version still archived at https://web.archive.org/web/20180701092040/https://illuminatejs.com/#/

# Contribute 
Please refer to the `babel-plugin-deobfuscate/README.md` file to start contributing . Pull requests are very welcome.

# Key Features

## Constant Propagation

Because type information is unavailable and often impossible to infer, expressions can often only be simplified when all operands have known values. Powerful constant propagation is therefore an essential part of de-obfuscation.
Given an identifier, the de-obfuscator tries to find the value referenced by the identifier. If the identifier is a declared variable, this reference relationship is called a binding.
It is useful to differentiate between the properties "constant" and "known" of a binding. "constant" being unchanging and "known" as having a value available in the context of an expression. For the purpose of de-obfuscation, a value being knowable is more useful than it being constant.
All objects are mutable. The only exceptions are the built-in objects of type `number` and `string`. There is therefore also a distinction to be made between a constant reference, and an immutable value.
Binding values can be recursively resolved:
* String and number literals always have a known and immutable value. This is the base case of this recursion.
* When a variable is declared, and the value of the right-side expression is known, the binding's value is known.
* When a variable is re-assigned, the inconstant binding's value changes and may become unknown.
* When a value is mutated, even constant bindings change their value.
Constant references can be propagated:
* If a binding is never re-assigned, it is constant.
* Through constant propagation, constant bindings referring to other constant bindings or immutable literals are transitively constant.

Examples of "known"/"constant" binding `a`:

|            | Known                    | Unknown |
|------------|-------                   |---------|
|Constant    | `const a = 2`            | `const a = x` |
|Not constant|`var a = 2`<br/>`a = 4`   |`var a = 2 // known` <br/>`a = x // now unknown`|

A known value must be updated and may become unknown after an assignment or a mutator function is called.

## Assignments

In JavaScript, all defined identifiers are references to some object, function, or `null`.
With the exception of variables declared with the `const` keyword, all variables can be re- assigned. Objects can hold references to members, which can also be re-assigned in a member assignment. In a member assignment, the reference does not change, but the binding's value does.

| | |
|-|-|
| Declaration of reference to immutable string | `var a = "some string"`| 
| Assignment to reference of mutable array | `a = ['1', 2]`| 
| Member assignment | `a[0] = 1`| 

Constant propagation fails when variables or member are re-assigned. Any of the following conditions may render static evaluation impossible.

| Description | Example | Consequence |
|-|-|-|
Assignment of unknown member `x` | `a[x] = b`	| All members of `a` must be assumed unknown.
Assignment to unknown value `x` | `a[b] = x` | Member `b` must be assumed unknown
Conditional assignment | `a = x ? 1 : 0` | `a` could be 1 or 0

Assignments must be considered when determining whether a value is known or unknown.
If the goal of the de-obfuscation is to extract as much information as possible, without keeping the observable behaviour of the program the same, an aggressive de-obfuscator could take risks and attempt de-obfuscation anyway.

## Mutators
Even for constant bindings, determining the correct value fails if the value is mutable and it is mutated between its declaration and its use as part of an expression.
For the built-in `Array` type, calls to the built-in mutator methods can be tracked:
`fill, pop, push, reverse, shift, sort, splice, unshift`

Having recognized a call to a mutator, the de-obfuscator may either:
* mark the value as unknown
* perform the same operation on the previously known value and update the binding

Applying all of the above and extending constant propagation to known value propagation, results are improved as exemplified below.

Input | Improved De-Obfuscator Output
---|---
`const a = [1, 2]`<br/>`a[0] + a[1]`| 3
`const a = [0]`<br/>`a[0] = 1`<br/>`a.toString()` | `'1'`
`var d = [];`<br/>`d.push("13");`<br/>`d.push("10");`<br/>`d.push("13");` | `const d = ["13", "10", "13"]`

## Evaluating Mixed-Type Expressions
Expressions with operand types other than `number` and `string` can also be simplified. Mixed-type binary expressions are also evaluable.
Some examples of what an improved de-obfuscator could evaluate:

Input | Output
---|---
[1] + [2] | '12'
'a' + [1] | 'a1'
[1] - [2] | -1
~[] | -1 
~true | -2
1 === 2 | false

## Using Operator Associativity

Given the following example with the `+` operator and its associative property, the following expressions are equivalent.
```
x + 1 + 2
(x + 1) + 2
x + (1 + 2)
````

Assuming the value of `x` is unknown, expressions involving it cannot be evaluated. `x + 1` not being evaluated, means that the parent expression as a whole cannot be simplified. But if `1 + 2` is evaluated first, partial simplification can be achieved, resulting in `x + 3`.
The `+` operator is left-associative. In the absence of parenthesis, this results in the following AST being generated:

```
    +
   / \
  +   2
 / \
x   1 
```

In order to simplify this expression, the tree nodes must be rotated, resulting in the following tree:
```
    +
   / \
  x   +
     / \
    1   2 
```

## De-Obfuscating Code in `eval` Statements
In many cases, `eval` statements are used in conjunction with dynamic strings. In those cases, static simplification is impossible.
For static `eval` strings, the de-obfuscator should parse the code within and apply the same de-obfuscation transformations as on the code outside the `eval` statement.
Input | Output
---|---
`eval(`<br/>  `'(function (x) { return x+1 }(2)'`<br/>`)` | 3

## Parse Modern JavaScript
JavaScript is a fast-evolving language. This means that tools must keep pace with the development of new syntax in order to stay useful. In practice, this is kept in check by the fact that not all clients support the new features and users may not be using the newest versions. To reach the most users possible, legitimate websites and attackers are incentivised to limit their use of the latest syntax. Some ES6 language features are useful when used to generate more readable code output. For example, marking inferred constant variables with the `const` keyword serves as an indicator to the reader of the de-obfuscated code. 

Input | Output
---|---
var a = 1; | const a = 1; 
var b = a + a; | const b = 2;

## Evaluating Function Calls
Given literals or inferred input/argument values, a de-obfuscator may evaluate function calls where the function being called (callee) is defined within the scope of the input code.
Functions are an effective tool for obfuscation. The main reasons are related to functions creating a new scope ([lexical environment](http://www.ecma-international.org/ecma-262/6.0/#sec-lexical-environments)).
* New variable bindings are only valid inside the function body.
* Bindings from the outer scope are available inside the function scope. (capturing)
* Given multiple bindings with the same name, the inner-most bindings take precedence. (shadowing)
* If the same function is called multiple times, the binding values may differ on each call.

Given a static context, not all function calls can be inlined. This can be caused by global state or inputs/arguments being unknowable. An implementation of static function call evaluation must therefore apply a set of rules to the call expression. Only if those rules are met, can the expression be simplified. The difficulty in implementing function call evaluation lies in deciding when a function can be inlined, without breaking the program or changing its observable behaviour.

## Evaluating Calls to Built-in Functions
Even though they are not part of the input source, the implementation of built-ins is known. This allows a de-obfuscator to evaluate those function calls. To find additional candidates for static evaluation, a histogram of all words contained in the [malicious dataset samples](https://github.com/geeksonsecurity/js-malicious-dataset) can be used: 

Count | Word
---|---
183513 | function
180949 | var
71331 | if
27917 | push
24111 | Array
8528 | replace
4352 | fromCharCode
4223 | indexOf
4221 | charAt
3337 | substring

Because they are used often, these functions are ideal candidates for static evaluation:
`replace, indexOf, charAt, substring`

Combing function call evaluation with the known specification of the built-in `replace` function, even the complex case where the "replacement" argument is itself a function expression, can be evaluated:

Input | Output
---|---
'abc_ABC'.replace(/[a-z]/gi, function (s) {<br/>  return s + s<br/>}) | 'aabbcc_AABBCC'

## Evaluating Loops
In order to evaluate loops, the static de-obfuscator must be able to evaluate all statements within the loop. The iteration count must also be definite and known.

The iteration count in a typical `for` loop statements is determined by a variable, the loop control variable.
```js
for (var i = 0; i < 10; i++) // control variable = i
```
For reference, the following terms are used for the sub-expressions:
```js
for ([init expression]; [test expression]; [update expression]) {
  [statements]
}
```
Given a function `d`, which given an expression `e`, returns the statically evaluated value of `e`, the for loop can be emulated.
```js
var result = [];
// Ommited for brevity: updating variable binding values 
while (d(test)) {
    result = statements.map(d)
    control = d(update) 
}
forLoop.replaceWith(result)
```

Example of a simple geometric series calculation:

Input | Output
---|---
var c = 1<br/>for (var i = 0; i<3; i++) {<br/>  c = c * 2<br/>} | var c = 1;<br/>c = 8;

Loops meeting these criteria can be statically evaluated:
* Control variable value must be known at all times during the iteration
* Iteration count must be definite

The following kinds of statements are accepted inside the loop body:
* Assignment with pure init expression
* Variable declaration with pure init expression
* Call to procedure (function body must meet the same criteria as loop body)

# Acknowledgements
This work have been possible thanks to the collaboration with [ZHAW](https://www.zhaw.ch/en/engineering/institutes-centres/init/) and [Lucas Neivas](https://twitter.com/chilloutman)
