import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Put any shared rules/plugins here
const common = {
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              // if you ever convert to TS:
              // "@babel/preset-typescript",
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".mjs", ".json"],
  },
  // any shared plugins…
};

export default [
  // 1) ESM build
  {
    ...common,
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "index.mjs",
      library: {
        type: "module",
      },
      globalObject: "this",
    },
    experiments: {
      outputModule: true,
    },
  },
  // 1b) ESM legacy alias (backward compatibility)
  {
    ...common,
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "weas.mjs",
      library: {
        type: "module",
      },
      globalObject: "this",
    },
    experiments: {
      outputModule: true,
    },
  },

  // 2) CJS build
  {
    ...common,
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "index.cjs.js",
      library: {
        type: "commonjs2",
      },
      globalObject: "this",
    },
    // no outputModule experiment here
  },
];
