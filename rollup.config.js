// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/kiranbandi-hapmap.js',
        format: 'umd',
        name: 'HapMap'
    },
    plugins: [
        json(),
        resolve({ jsnext: true, preferBuiltins: true, browser: true }),
        babel({
            exclude: 'node_modules/**',
        }), commonjs()
    ]
};