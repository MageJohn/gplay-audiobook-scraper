import { stdout } from "node:process";

import { Command } from "commander";
import { JSDOM } from "jsdom";
import dedent from "ts-dedent";

import { name, version, description } from "../package.json";

import type { VolumeOverview, ContentInfo, Chapter } from "./types";

const escapeString = (string: string): string =>
  string.replaceAll(/[=;#\\\n]/g, "$&");

const formatChapterMetadata = (chapters: Chapter[], endTimestamp: string) =>
  chapters
    .reduce<{ title: string; start: string; end?: string }[]>((arr, chap) => {
      const [title, start] = chap;
      if (start === undefined) {
        // The initial chapter
        return [{ title, start: "0" }];
      }

      const last = arr[arr.length - 1];

      if (last === undefined) {
        throw Error("Unexpected chapters structure");
      }

      if (last.start === start) {
        // The last chapter and this chapter have the same timestamp, combine them
        return [
          ...arr.slice(0, -1),
          { title: `${last.title} - ${title}`, start },
        ];
      }

      // Append the chapter and update the end time of the last chapter
      return [...arr.slice(0, -1), { ...last, end: start }, { title, start }];
    }, [])
    .map(
      ({ title, start, end = endTimestamp }) => dedent`
        [CHAPTER]
        TIMEBASE=1/1000
        START=${start}
        END=${end}
        title=${escapeString(title)}
      `
    );

const formatBookMetadata = (volumeOverview: VolumeOverview) =>
  (
    [
      ["title", volumeOverview[1][0]],
      ["artist", volumeOverview[1][1].join(", ")],
      ["publisher", volumeOverview[1][2]],
      ["date", volumeOverview[1][3]],
      ["description", volumeOverview[1][4]],
      ["composer", volumeOverview[1][16][3].join(", ")],
      ["genre", "Audiobook"],
    ] as const
  ).map((entry) => `${entry[0]}=${escapeString(entry[1])}`);

async function scrape(file: string) {
  const dom = await JSDOM.fromFile(file, { runScripts: "dangerously" });

  const contentInfo = dom.window['_OC_contentInfo'] as ContentInfo | undefined;
  const volumeOverview = dom.window['_OC_volumeOverview'] as VolumeOverview | undefined;

  dom.window.close();

  if (!contentInfo || !volumeOverview) {
    throw Error("Could not extract metadata from the page");
  }

  const chapterMetadata = formatChapterMetadata(contentInfo[0][0], contentInfo[1])
  const bookMetadata = formatBookMetadata(volumeOverview);

  stdout.write(dedent`
    ;FFMETADATA
    ${bookMetadata.join("\n")}
    ${chapterMetadata.join("\n")}
  `);
}

const program = new Command();

program
  .name(name)
  .version(version)
  .description(description)
  .argument("<file>")
  .action(scrape);

function main() {
  program.parseAsync().catch(
    (reason) => {
      throw Error(reason)
    }
  )
}

export default main;
