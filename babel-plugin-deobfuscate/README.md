# IlluminateJS Babel Plugin

[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/)

Implemented as [Babel](http://babeljs.io) plugin. Written in TypeScript. Babel's core package "babel-core" and its helpers "babylon" (parser) and "babel-types" (AST) provide useful functions for AST manipulation. Babel is written in JavaScript. This allows some transformations to be implemented without the need to emulate JavaScript behaviour. For example, instead of emulating `==` expressions which is error-prone since they can result in surprisingly un-intuitive results, the expression can simply be evaluated on the de-obfuscator virtual machine. Because only JavaScript primitives are executed, this is not a security problem.

Given that Babel's core functionality involves transforming modern JavaScript, it is incentivised to keep the AST definition and the parser up-to-date with new language syntax.

## Development 

### Setup

First, install [yarn](https://yarnpkg.com/en/docs/install).

```sh
# install dependencies and run tests
yarn install && yarn test
# build TypeScript sources
yarn build
```

Sources are found in `src/`; tests in `test/`. The test are a good demonstration of what this project does.

### APIs
- `evaluate`: evaluate a given **path** or **node** and return an evaluated **node**.
- `deobfuscate`: evaluate a given **path** and replace it. Returns nothing!


## CLI

The package contains a small CLI utility that can be used to deobfuscate javascript file right-away. The alias `illuminatejs` can be registered with `npm link`, otherwise you can use the `./cli.js` node script manually.

```
$ cat test.js 
var x=1;
console.log(x+1);

$ illuminatejs ./test.js
const x = 1;
console.log(2);
```