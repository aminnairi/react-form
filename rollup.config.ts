import { defineConfig } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import terser from "@rollup/plugin-terser";
import remove from "rollup-plugin-delete";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default defineConfig({
  input: "src/index.ts",
  plugins: [
    remove({
      targets: "dist"
    }),
    esbuild(),
    terser(),
    nodeResolve(),
    commonjs()
  ],
  external: [
    "react"
  ],
  output: [
    {
      file: "dist/index.js",
      format: "esm"
    }
  ]
});
