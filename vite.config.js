import { defineConfig } from "vite";
import path from "path";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import dts from "vite-plugin-dts";

const entry = path.resolve(__dirname, "src/index.js");
const outDir = path.resolve(__dirname, "dist");

export default defineConfig(({ mode }) => {
  const common = {
    root: path.resolve(__dirname, "demo"),
    plugins: [cssInjectedByJsPlugin()],
    build: {
      lib: { entry },
      outDir,
      emptyOutDir: false,
    },

    test: {
      environment: "jsdom",
      include: ["../tests/**/*.test.mjs"],
      globals: true, // so you can use test(), expect() without imports
    },
  };

  if (mode === "iife") {
    return {
      ...common,
      build: {
        ...common.build,
        lib: {
          ...common.build.lib,
          name: "weas",
          fileName: () => "index.iife.js",
          formats: ["iife"],
        },
      },
    };
  }
  return {
    ...common,
    plugins: [cssInjectedByJsPlugin(), dts({ insertTypesEntry: true })],
    build: {
      ...common.build,
      lib: {
        ...common.build.lib,
        fileName: () => "index.mjs",
        formats: ["es"],
      },
      rollupOptions: {
        external: ["three", "dat.gui"],
      },
      emptyOutDir: true,
    },
  };
});
