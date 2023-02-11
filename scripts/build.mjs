#!/usr/bin/env node
import * as fs from "node:fs/promises";

import * as esbuild from "esbuild";
import { minVersion } from "semver";
import { Command } from "@commander-js/extra-typings";
import esMain from "es-main";

// @ts-ignore -- import assertion is fine in an mjs file
import manifest from "../package.json" assert { type: "json" };

const outDir = "dist";

const targets = Object.entries(manifest.engines).map(
  ([engine, range]) => `${engine}${minVersion(range)}`
);

/** @type {esbuild.BuildOptions} */
const buildOptions = {
  entryPoints: ["src/main.ts"],
  bundle: true,
  platform: "node",
  outdir: "dist",
  packages: "external",
  logLevel: "info",
  format: "esm",
  target: targets,
};

async function clean() {
  await fs.rm(outDir, { recursive: true, force: true });
}

/**
 * @param {Object} options
 * @param {boolean} options.metafile
 */
async function bundle({ metafile }) {
  await clean();
  return esbuild.build({ ...buildOptions, metafile });
}

async function watch() {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
}

const program = new Command();

program.command("clean").description("clean the built files").action(clean);

program
  .command("watch")
  .description("watch files and rebuild on change")
  .action(watch);

program
  .name("bundle")
  .description("bundle the application")
  .option(
    "-a, --analyse",
    "after bundling print an analysis of the bundle size to the screen",
    false
  )
  .action(async (args) => {
    const result = await bundle({ metafile: args.analyse });
    if (args.analyse && result.metafile) {
      console.log(await esbuild.analyzeMetafile(result.metafile));
    }
  });

// @ts-ignore -- import.meta was being incorrectly flagged
if (esMain(import.meta)) {
  await program.parseAsync();
}
