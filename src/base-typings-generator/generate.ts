import {readFileSync, writeFileSync} from 'fs';
import * as Path from 'path';

var pathFromRoot = (path: string) => Path.resolve(__dirname, '../..', path);
var load = (path: string) => readFileSync(pathFromRoot(path), 'utf8');
var save = (contents: string, path: string) => writeFileSync(pathFromRoot(path), contents);

var factoryInterfacePattern = /interface ReactHTML {([^}]+)/;
var factoryDeclarationPattern = /^"?(\w+)"?: DetailedHTMLFactory<(\w+)<(\w+)>, (\w+)>$/;

generateBaseTypings();


function generateBaseTypings() {
    var prologSource = load('src/base-typings-generator/prolog.d.ts');
    var reactTypingsSource = load('node_modules/@types/react/index.d.ts');
    var interfaceMembers = getFactoryInterfaceMembers(reactTypingsSource);
    var bodySource = generateBody(interfaceMembers);
    var result = [prologSource, bodySource, ''].join('\n');
    save(result, 'lib/base-typings.d.ts');
}

function getFactoryInterfaceMembers(reactTypingsSource: string) {
    var factoryInterfaceSource = factoryInterfacePattern.exec(reactTypingsSource);
    if (! factoryInterfaceSource) {
        throw new Error('Failed to match factory interface source');
    }
    return factoryInterfaceSource[1].split(';').map(s => s.trim()).filter(s => s.length);
}

function generateBody(factoryInterfaceMembers: string[]) {
    var processedAttrTypes: string[] = [];
    var modPropsInterfaceDeclarations: string[] = [];
    var factoryTypeDeclarations: string[] = [];
    factoryInterfaceMembers
        .map(decl => {
            var declarationParts = factoryDeclarationPattern.exec(decl);
            if (! declarationParts) {
                throw new Error(`Failed to match factory declaration:\n    ${decl}`);
            }
            var tag = declarationParts[1];
            var attrType = declarationParts[2];
            var elemType = declarationParts[3];
            if (declarationParts[4] !== elemType) {
                if (tag === 'head') {
                    // skip just one exception for <head> // todo: report issue
                } else {
                    throw new Error(`Unexpected type for factory ${tag}`);
                }
            }
            return {tag, attrType, elemType};
        })
        .forEach(({tag, elemType, attrType}) => {
            var modPropsInterfaceName = attrType.replace('Attributes', 'ModProps')
            if (processedAttrTypes.indexOf(attrType) == -1) {
                processedAttrTypes.push(attrType);
                modPropsInterfaceDeclarations.push(
                    `export interface ${modPropsInterfaceName}<T extends HTMLElement, M> extends React.${attrType}<T>, ClassAttributes<T> { mods?: M }`
                );
            }
            factoryTypeDeclarations.push(
                `export type Tag${tag.toUpperCase()}<M> = Factory<${modPropsInterfaceName}<${elemType}, M>, React.${attrType}<${elemType}>, ${elemType}>;`
            );
        })
    ;
    return ([] as string[]).concat(modPropsInterfaceDeclarations, '', factoryTypeDeclarations).join('\n');
};
