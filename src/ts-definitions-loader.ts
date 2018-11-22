import * as fs from 'fs';
import * as Path from 'path';
import {loader} from 'webpack';
import isKeyword = require('is-keyword-js');
import {getSpec, ElemSpec, ModMap} from './spec-extractor';

var localsContentsPattern = /exports\.locals = {([^}]*)/m;
var keyNamesPattern = /"([\w-]+)":/g;
var baseTypingsRequirePath = 'react-affected-style-loader/generic-definitions';

var loader: loader.Loader = function (source: string, map) {
    const callback = this.async()!; // fixme dts

    const { dir, base } = Path.parse(this.resourcePath);
    const definitionPath = Path.join(dir, `${base}.d.ts`);

    // this.addDependency(definitionPath);

    var classNames = extractClassNames(source);
    var elemSpec = getSpec(classNames);
    var definitionSource = generateModuleTypings(elemSpec);

    var write = () => fs.writeFile(definitionPath, definitionSource, 'utf-8', err => {
        if (err) {
            return callback(err);
        }
        callback(null, source, map);
    });

    fs.stat(definitionPath, (err, stats) => {
        if (err && err.code !== 'ENOENT') {
            return callback(err);
        }
        if (stats && stats.isFile()) {
            fs.readFile(definitionPath, 'utf-8', (err, content) => {
                if (err) {
                    return callback(err);
                }
                if (definitionSource !== content) {
                    return write();
                }
                callback(null, source, map);
            });
        } else {
            write();
        }
    });

};

module.exports = loader;


function generateModuleTypings(elemSpec: ElemSpec[]) {
    return concat(
        `import * as Definitions from '${baseTypingsRequirePath}';`,
        '',
        elemSpec.map(generateFactoryFunction)
    );
}

function generateFactoryFunction({tag, elem, mods}: ElemSpec) {
    var TAG = tag.toUpperCase();
    var modsType = mods ? getModsTypeName(elem) : 'null';
    return concat(
        `export var ${elem}: Definitions.Tag${TAG}<${modsType}>;`,
        mods ? generateModsTypeDeclaration(elem, modsType, mods) : [],
        ''
    );
}

function generateModsTypeDeclaration(elem: string, modsType: string, mods: ModMap) {
    return concat(
        `export type ${modsType} = {`,
        Object.keys(mods).map(mod =>
            `    ${mod}?: ${generateModType(mods[mod])};`
        ),
        '}'
    );
}

function getModsTypeName(elem: string) {
    return [
        elem.slice(0, 1).toUpperCase(),
        elem.slice(1),
        'Mods'
    ].join('')
}

function generateModType(modValue?: string[]) {
    if (!modValue) {
        return 'boolean';
    }
    return modValue.map(val => `'${val}'`).join(' | ');
}


function extractClassNames(source: string): string[] {
    var localsContentsMatch = localsContentsPattern.exec(source);
    if (!localsContentsMatch) {
        return [];
    }
    var localsContents = localsContentsMatch[1];
    var keyNamesMatch: RegExpExecArray | null;
    var result = [];
    while (keyNamesMatch = keyNamesPattern.exec(localsContents)) {
        var keyName = keyNamesMatch[1];
        if (keyName.indexOf('-') != -1) {
            console.warn(`Skipped class name with dash "${keyName}"`);
            continue;
        }
        if (isKeyword(keyName)) {
            console.warn(`Skipped class named as js keyword "${keyName}"`);
            continue;
        }
        result.push(keyName);
    }
    return result;
}

function concat(...args: (string | string[])[]): string;
function concat() {
    return Array.prototype.concat.apply([], arguments).join('\n');
}
