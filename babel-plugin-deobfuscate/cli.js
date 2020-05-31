#!/usr/bin/env node
var fs = require('fs');
const Babel = require('babel-standalone');
const IlluminateJs = require('.')

Babel.registerPlugin('illuminatejs', IlluminateJs.default);

if(process.argv.length < 3){
    console.warn(`IlluminateJS Deobfuscator`); 
    console.warn(`Usage: ${process.argv[1]} file-to-deobfuscate.js`)
} else {
    var args = process.argv.slice(2);
    fs.readFile(args[0], 'utf8', function(err, body) {
        console.log(Babel.transform(
            body,
            {plugins: ['illuminatejs']}
        ).code);
    });
}

