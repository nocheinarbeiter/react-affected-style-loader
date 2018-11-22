import {getSpec} from './spec-extractor';
import {JMap} from './vanilla-js-map';
import * as React from 'react';


type ClassNamesMap = JMap<string>;
type Mods = JMap<string | boolean>;


// this function used in generated code in loader.ts and NOT listed in usages (refactor with care)
export function createFactories(classNamesMap: ClassNamesMap) {
    var elemSpec = getSpec(Object.keys(classNamesMap));
    var result: JMap<Function> = {};
    for (var item of elemSpec) {
        result[item.elem] = createElement.bind(undefined, classNamesMap, item.tag, item.elem);
    }
    return result;
};


function createElement(dict: ClassNamesMap, tag: string, elem: string) {
    var i = 3;
    var propsArg = arguments[i];
    var propsPassed =
        !!propsArg &&
        typeof propsArg === 'object' &&
        !Array.isArray(propsArg) &&
        !React.isValidElement(propsArg)
    ;
    var resultProps;
    if (propsPassed) {
        if ('mods' in propsArg) {
            var {mods, ...props}: {mods: Mods, props: any[]} = propsArg;
            var classes = getNamesForElemWithMods(elem, mods).map(name => dict[name]);
            resultProps = {className: classes.join(' '), ...props};
        } else {
            resultProps = {className: dict[elem], ...propsArg};
        }
        i++;
    } else {
        resultProps = {className: dict[elem]};
    }
    var args = [tag, resultProps];
    while (i < arguments.length) {
        args.push(arguments[i]);
        i++;
    }
    return React.createElement.apply(React, args);
}


function getNamesForElemWithMods(elem: string, mods: Mods): string[] {
    var result = [elem];
    for (var modName of Object.keys(mods)) {
        var modValue = mods[modName];
        if (!modValue) {
            continue;
        }
        var className = `${elem}_${modName}`;
        if (typeof modValue == 'string') {
            className += `_${modValue}`;
        }
        result.push(className);
    }
    return result;
}
