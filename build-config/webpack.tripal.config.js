const path = require('path');
var webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

'use strict';

module.exports = {
    mode: 'development',
    entry: ['babel-polyfill', './src/app.jsx'],
    output: {
        path: __dirname + '/dist/bundle',
        filename: "hapmap.js",
        publicPath: "/bundle"
    },
    devServer: {
        inline: true,
        contentBase: './dist',
        port: 8080,
        compress: true,
        watchOptions: {
            ignored: [
                path.resolve(__dirname, 'dist'),
                path.resolve(__dirname, 'node_modules')
            ]
        }
    },
    plugins: [new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify('development'),
            DATADIR_PATH: JSON.stringify('sites/all/libraries/haplotype-map/dist/')
        }
    }),
    new HtmlWebpackPlugin({
        filename: '../../../dist/index.html',
        template: './src/assets/index.template.html',
        alwaysWriteToDisk: true
    }),
    new HtmlWebpackHarddiskPlugin()
    ],
    module: {
        rules: require("./rules.config"),
    },
    resolve: {
        extensions: ['.js', '.jsx']
    }
}