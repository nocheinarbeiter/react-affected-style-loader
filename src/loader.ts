import {resolve} from 'path';
import {loader} from 'webpack';
import {stringifyRequest} from 'loader-utils';


var loader: loader.Loader = function () {};

loader.pitch = function (remainingRequest): string {
    // todo fix dts for pich function:
    //      type of this must be LoaderContext
    //      return type must be the same as loader function
    var context = this as any as loader.LoaderContext;
    return [
        // !! and ! magic -> https://webpack.js.org/configuration/module/#rule-enforce
        // see also style-loder sources
        `var reactFactoriesCreator = require(${stringifyRequest(context, '!' + resolve(__dirname, 'react-factories-creator.js'))});`,
        `var classNamesMap = require(${stringifyRequest(context, '!!' + remainingRequest)});`,
        'module.exports = reactFactoriesCreator.createFactories(classNamesMap);'
    ].join('\n');
}

module.exports = loader;
