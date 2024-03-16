import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  entry: "./src/index.js",
  output: {
    filename: "weas.mjs", // Use .mjs extension
    path: path.resolve(__dirname, "dist"),
    library: {
      type: "module", // Set type as module
    },
    globalObject: "this",
  },
  experiments: {
    outputModule: true, // Enable ECMAScript module output
  },
  // ... other configurations like module rules for Babel, plugins, etc.
};
