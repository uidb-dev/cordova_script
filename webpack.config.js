const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

// Dev-only harness. The published artifact is produced by `npm run transpile`
// (babel src -> dist), not by webpack. This config exists so the side-effect
// script in src/index.js can be exercised in a real browser.
const htmlWebpackPlugin = new HtmlWebpackPlugin({
    title: "cordova_script dev harness",
    filename: "index.html"
});

module.exports = {
    entry: path.join(__dirname, "src/index.js"),
    // Must NOT be the default "dist/": that directory is the published
    // artifact, produced by `npm run transpile`. Emitting the dev bundle
    // there would ship main.js/index.html inside the npm tarball.
    output: {
        path: path.join(__dirname, ".dev-build"),
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    plugins: [htmlWebpackPlugin],
    resolve: {
        extensions: [".js", ".jsx"]
    },
    devServer: {
        port: 3001,
        static: {
            directory: path.join(__dirname, ".dev-build")
        }
    }
};
