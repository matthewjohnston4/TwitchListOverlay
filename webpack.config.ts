/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
import { Compiler, Configuration } from "webpack";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

class WatchTimerPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.afterDone.tap('Watch Timer Plugin', () => {
      console.log(`============[Finished at ${new Date().toLocaleString()}]============`);
    });
  }
}

const config: Configuration = {
  mode: "production",
  entry: "./src/app.tsx",
  output: {
    path: path.resolve(__dirname, "bin"),
    filename: "[name].js",
    publicPath: "",
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/i,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-typescript",
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: false,
    }),
    new ESLintPlugin({
      extensions: ["js", "jsx", "ts", "tsx"],
    }),
    new CleanWebpackPlugin(),
    new WatchTimerPlugin(),
  ],
};

export default config;
