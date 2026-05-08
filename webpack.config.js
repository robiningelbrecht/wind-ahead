const path = require('path');

module.exports = {
    mode: 'production',
    context: __dirname,
    entry: {
        'app.min': './js/app.js',
    },
    optimization: {
        minimize: true
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        chunkFilename: '[name].min.js',
        clean: true,
    },
    resolve: {
        fallback: {
            "https": false,
        }
    },
};