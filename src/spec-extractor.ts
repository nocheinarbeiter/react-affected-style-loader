import {JMap} from './vanilla-js-map';


var tokenSeparator = '_';

type TagSpec = {
    value:
        string |    // explicitly specified tag name
        undefined   // default tag name (div)
    ;
    valid: boolean; // false if more then one tag names were explicitly specified
};

type Mods = JMap<string | boolean>;

type ModSpec = {
    value:
        string[] |  // enum values
        undefined   // just a flag
    ;
    valid: boolean; // false if enum and flag mixed for same mod
};

type IntermediateSpec = [JMap<TagSpec>, JMap<JMap<ModSpec>>];


export type ModMap = JMap<string[] | undefined>;

export type ElemSpec = {
    tag: string;
    elem: string;
    mods?: ModMap;
};


export function getSpec(names: string[]): ElemSpec[] {
    var intermediateSpec = getIntermediateSpec(names);
    var spec = getResultSpec(intermediateSpec);
    return spec;
}


function getResultSpec(intermediateSpec: IntermediateSpec): ElemSpec[] {
    var [tagMap, modsetMap] = intermediateSpec;
    var result: ElemSpec[] = [];
    for (var elem of Object.keys(tagMap)) {
        var tagSpec = tagMap[elem];
        if (!tagSpec.valid) {
            continue;
        }
        var tag = tagSpec.value || 'div';
        var hasMods = false;
        var modsRaw = modsetMap[elem];
        if (modsRaw) {
            var mods = createMap() as ModMap;
            for (var modName of Object.keys(modsRaw)) {
                var modSpec = modsRaw[modName];
                if (modSpec.valid) {
                    mods[modName] = modSpec.value;
                    hasMods = true;
                }
            }
        }
        result.push({tag, elem, mods: hasMods ? mods! : undefined});
    }
    return result;
}


function getIntermediateSpec(names: string[]): IntermediateSpec {
    var tagMap = createMap<TagSpec>();
    var modsetMap = createMap<JMap<ModSpec>>();
    for (var name of names) {
        var [elem, modName, modValue] = name.split(tokenSeparator);
        var tagValue: string | undefined = undefined;
        if (modName) {
            if (modName == 'tag') {
                if (modValue) {
                    tagValue = modValue;
                } else {
                    console.warn(`Empty "tag" modifier value for element "${elem}"`);
                }
            } else {
                if (!(elem in modsetMap)) {
                    modsetMap[elem] = createMap<ModSpec>();
                }
                var modset = modsetMap[elem];
                if (modName in modset) {
                    var modSpec = modset[modName];
                    if (modSpec.valid) {
                        if (modValue && modSpec.value) {
                            modSpec.value.push(modValue);
                        } else {
                            // we are here because of:
                            //  !modValue || !modSpec.value
                            // this is incorrect
                            console.warn(`Modifier "${modName}" of element "${elem}" has mixed type, which not allowed`);
                            modSpec.valid = false;
                        }
                    }
                } else {
                    modset[modName] = {
                        value: modValue ? [modValue] : undefined,
                        valid: true
                    };
                }
            }
        }
        if (elem in tagMap) {
            var tagSpec = tagMap[elem];
            if (!tagSpec.valid) {
                continue;
            }
            if (tagValue) {
                if (!tagSpec.value) {
                    // now tag is explicitly defined
                    tagSpec.value = tagValue;
                } else {
                    console.warn(`Custom tag for element "${elem}" already defined`);
                    tagSpec.valid = false;
                }
            }
        } else {
            tagMap[elem] = {value: tagValue, valid: true};
        }
    }
    return [tagMap, modsetMap];
}


export function createMap<T>(): JMap<T> {
    return Object.create(null);
}
