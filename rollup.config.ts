import { defineConfig } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import terser from "@rollup/plugin-terser";
import remove from "rollup-plugin-delete";

export default defineConfig({
  input: "src/index.ts",
  plugins: [
    remove({
      targets: "dist"
    }),
    esbuild(),
    terser()
  ],
  external: [
    "react"
  ],
  output: [
    {
      file: "dist/index.module.js",
      format: "esm"
    },
    {
      file: "dist/index.common.js",
      format: "cjs"
    },
    {
      file: "dist/index.browser.js",
      format: "iife",
      name: "@aminnairi/react-form",
      extend: true,
      globals: {
        react: "React"
      }
    }
  ]
});
