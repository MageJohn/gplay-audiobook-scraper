import { stdout } from "node:process";

import { Command } from "@commander-js/extra-typings";

import { name, version, description } from "../package.json";
import { formatFFMetadata } from "./formatFFMetadata";
import { scrapeMetadata } from "./scrapeMetadata";

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

async function main() {
  await program.parseAsync();
}

export default main;
