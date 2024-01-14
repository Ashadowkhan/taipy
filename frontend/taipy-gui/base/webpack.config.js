const path = require("path");
const webpack = require("webpack");

const moduleName = "TaipyGuiBase";

module.exports = {
    target: "web",
    entry: "./base/src/index.ts",
    output: {
        filename: "taipy-gui-base.js",
        path: path.resolve(__dirname, "dist"),
        globalObject: "this",
        library: {
            name: moduleName,
            type: "umd",
        },
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".tsx"],
    },
    // externals: {
    //     "socket.io-client": {
    //         commonjs: "socket.io-client",
    //         commonjs2: "socket.io-client",
    //         amd: "socket.io-client",
    //         root: "_",
    //     },
    // },
};
