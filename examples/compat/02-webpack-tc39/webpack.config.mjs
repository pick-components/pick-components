import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  mode: "development",
  devtool: false,
  entry: resolve(__dirname, "src/main.ts"),
  experiments: { outputModule: true },
  output: {
    filename: "bundle.js",
    path: resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "pick-components": resolve(__dirname, "../../../dist/index.js"),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: resolve(__dirname, "tsconfig.json"),
          },
        },
      },
    ],
  },
};
