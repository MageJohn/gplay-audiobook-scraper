import { JSDOM } from "jsdom";

import type { ContentInfo, VolumeOverview } from "./types.ts";

export async function scrapeMetadata(url: string) {
  const dom = await JSDOM.fromURL(url, { runScripts: "dangerously" });

  const contentInfo = dom.window["_OC_contentInfo"] as ContentInfo | undefined;
  const volumeOverview = dom.window["_OC_volumeOverview"] as
    | VolumeOverview
    | undefined;

  dom.window.close();

  if (!contentInfo || !volumeOverview) {
    throw Error("Could not extract metadata from the page");
  }

  return { volumeOverview, contentInfo };
}
