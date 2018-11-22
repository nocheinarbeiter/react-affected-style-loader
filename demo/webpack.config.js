var path = require('path');


module.exports = {
    context: __dirname,
    mode: 'development',
    entry: path.resolve('index.ts'),
    output: {
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.css/,
                use: [
                    {
                        loader: '../',
                    },
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: '../ts-definitions-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            localIdentName: '[name]__[local]' // debug
                            // localIdentName: '[name]__[local]--[hash:base64:5]'
                        }
                    }
                ]
            },
            {
                test: /\.ts/,
                loader: 'ts-loader',
                options: {transpileOnly: true}
            }
        ]
    }
}
