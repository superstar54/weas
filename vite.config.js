import { defineConfig } from "vite";
import path from "path";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import dts from "vite-plugin-dts";

export default defineConfig({
  root: path.resolve(__dirname, "demo"), // dev server root
  plugins: [
    libInjectCss(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: "WEAS",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["three", "dat.gui"],
      output: {
        globals: {
          three: "THREE",
          "dat.gui": "dat",
        },
      },
    },
    outDir: path.resolve(__dirname, "dist"),
  },
});
