# babel-plugin-deobfuscate

[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/)

JavaScript de-obfuscator.

Implemented as [Babel](http://babeljs.io) plugin. Written in TypeScript.

## Setup

First, install [yarn](https://yarnpkg.com/en/docs/install).

```sh
# install dependencies and run tests
yarn install && yarn test
# build TypeScript sources
yarn build
```

Sources are found in `src/`; tests in `test/`. The test are a good demonstration of what this project does.

## Terminology

### Function Names

- `evaluate`: evaluate a given **path** or **node** and return an evaluated **node**.
- `deobfuscate`: evaluate a given **path** and replace it. Returns nothing!
