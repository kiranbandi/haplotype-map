'use strict';
var webpack = require("webpack");
var path = require("path");
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Allow the build process to pass in the location of this app relative to the
// web root. The default is haplotype-map-tree/. To pass in something else use
// npm run build --webPath="/subdirectory"
// or you can run the following if the app is installed at the web root
// npm run build --webPath="/"
var webpath = process.env.npm_config_webpath || 'haplotype-map-tree/';
// Remove single leading "/" if it is present.
if (webpath.charAt( 0 ) === '/') { webpath = webpath.substring(1); }

module.exports = {
    entry: ['babel-polyfill', './src/app.jsx'],
    output: {
        path: path.resolve("dist/bundle"),
        filename: "[name].bundle.haplotype-map.[chunkhash].js",
        chunkFilename: "[name].haplotype-map.js"
    },
    plugins: [new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify('production'),
            DATADIR_PATH: JSON.stringify(webpath)
        }
    }),
    new TerserPlugin({
        parallel: true,
        terserOptions: {
            ecma: 6
        }
    }),
    new HtmlWebpackPlugin({
        filename: '../index.html',
        template: './src/assets/index.template.html'
    })
    ],
    module: {
        rules: require("./rules.config"),
    },
    resolve: {
        extensions: ['.js', '.jsx']
    }
}
