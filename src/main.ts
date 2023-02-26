#!/usr/bin/env node
import { stdout } from "node:process";

import { Command } from "@commander-js/extra-typings";
import esMain from "es-main";

import { description, name, version } from "../package.json";

import { formatFFMetadata } from "./formatFFMetadata.ts";
import { scrapeMetadata } from "./scrapeMetadata.ts";

const program = new Command();

program
  .name(name)
  .version(version)
  .description(description)
  .argument("<file>")
  .action(async (file) => {
    const { volumeOverview, contentInfo } = await scrapeMetadata(file);
    stdout.write(formatFFMetadata(volumeOverview, contentInfo));
  });

export default async function main() {
  await program.parseAsync();
}

if (esMain(import.meta)) {
  await main();
}
