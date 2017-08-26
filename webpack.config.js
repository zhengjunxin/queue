const webpack = require('webpack')
const path = require('path')

const isProduction = process.env.NODE_ENV === 'production'

const plugins = []

if (isProduction) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        output: {
            comments: false,
        }
    }))
}

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'index.js',
        library: "queue",
        libraryExport: 'default',
        libraryTarget: "umd",
    },
    plugins: plugins,
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }
        ]
    }
}
