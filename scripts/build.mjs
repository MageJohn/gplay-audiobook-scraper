#!/usr/bin/env node
import * as fs from "node:fs/promises";

import * as esbuild from "esbuild";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const outDir = "dist";

/** @type {esbuild.BuildOptions} */
const buildOptions = {
  entryPoints: ["src/main.ts"],
  bundle: true,
  platform: "node",
  outdir: "dist",
  packages: "external",
  logLevel: "info",
  format: "esm",
};

async function clean() {
  await fs.rm(outDir, { recursive: true, force: true });
}

/**
 * @param {{ metafile: boolean }} options
 */
async function bundle({ metafile }) {
  await clean();
  return esbuild.build({ ...buildOptions, metafile });
}

async function watch() {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
}

await yargs(hideBin(process.argv))
  .command("clean", "clean the built files", {}, clean)
  .command("watch", "watch files and rebuild on change", {}, watch)
  .command(
    "$0",
    "bundle the application",
    {
      analyse: {
        alias: "a",
        type: "boolean",
        default: false,
      },
    },
    async (argv) => {
      const result = await bundle({ metafile: argv.analyse });
      if (argv.analyse && result.metafile) {
        console.log(await esbuild.analyzeMetafile(result.metafile));
      }
    }
  )
  .help()
  .alias({ h: "help" })
  .version(false)
  .strict()
  .parseAsync();
