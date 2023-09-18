import { stripIndent, stripIndents } from "common-tags";

import type { ContentInfo, VolumeOverview } from "./types.ts";

const escapeString = (string: string): string =>
  string.replace(/[=;#\\\n]/g, "$&");

const formatChapterMetadata = (contentInfo: ContentInfo) =>
  contentInfo[0][0]
    .reduce<{ title: string; start: string; end?: string }[]>((arr, chap) => {
      const [title, start] = chap;
      if (start === undefined) {
        // The initial chapter
        return [{ title, start: "0" }];
      }

      const last = arr.pop();

      if (last === undefined) {
        throw Error("Unexpected chapters structure");
      }

      if (last.start === start) {
        // The last chapter and this chapter have the same timestamp, combine them
        return [...arr, { title: `${last.title} - ${title}`, start }];
      }

      // Append the chapter and update the end time of the last chapter
      return [...arr, { ...last, end: start }, { title, start }];
    }, [])
    .map(
      ({ title, start, end = contentInfo[1] }) => stripIndent`
        [CHAPTER]
        TIMEBASE=1/1000
        START=${start}
        END=${end}
        title=${escapeString(title)}
      `
    )
    .join("\n");

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
  )
    .map((entry) => `${entry[0]}=${escapeString(entry[1])}`)
    .join("\n");

export const formatFFMetadata = (
  volumeOverview: VolumeOverview,
  contentInfo: ContentInfo
) => stripIndents`
  ;FFMETADATA
  ${formatBookMetadata(volumeOverview)}

  ${formatChapterMetadata(contentInfo)}
`;
