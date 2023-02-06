import { JSDOM } from "jsdom";
import type { VolumeOverview, ContentInfo } from "./types";

export async function scrapeMetadata(file: string) {
  const dom = await JSDOM.fromFile(file, { runScripts: "dangerously" });

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
