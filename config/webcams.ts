import type { MountainId } from "@/config/mountains";

export interface Webcam {
  name: string;
  // Embed URL exactly as the resort's own webcam page uses it. Camstreamer links
  // redirect to whichever YouTube live stream is current, so they survive restarts.
  src: string;
}

export interface MountainWebcams {
  page: string; // the resort's webcam page, linked for when an embed is down
  cams: Webcam[];
}

// Taken from each resort's webcam page on 2026-11-05. If a cam goes blank, re-check
// that page: resorts swap providers and stream IDs between seasons.
// Grouse's wildlife-refuge bear cams are left out because they don't show the slopes.
export const WEBCAMS: Record<MountainId, MountainWebcams> = {
  cypress: {
    page: "https://www.cypressmountain.com/webcams",
    cams: [
      { name: "Eagle Chair", src: "https://camstreamer.com/embed/5e01894243e8115/S-54381" },
      { name: "Lions Chair", src: "https://camstreamer.com/embed/coUmF7P2InhuwcFcDus84j6LnbpQobaZBfJI5e37" },
      { name: "Sky Chair", src: "https://www.skaping.com/cypress-mountain/mount-strachan" },
      { name: "Plaza", src: "https://camstreamer.com/embed/eRzI4m4I7DVVaPqHWCVvlHERvHviYEmqOI3yXz3Q" },
      { name: "Nordic area", src: "https://camstreamer.com/embed/640e2ad0d403ee0/S-47753" },
    ],
  },
  grouse: {
    page: "https://www.grousemountain.com/web-cams",
    cams: [
      { name: "Peak", src: "https://www.skaping.com/grouse-mountain/peak-cam" },
      { name: "Chalet", src: "https://relay.ozolio.com/pub.api?cmd=embed&oid=EMB_KCRL0000012E" },
      { name: "Zips", src: "https://www.skaping.com/grouse-mountain/zips-cam/live" },
      { name: "Gravity", src: "https://www.skaping.com/grouse-mountain-gravity-cam/live" },
    ],
  },
  seymour: {
    page: "https://mtseymour.ca/the-mountain/todays-conditions-hours",
    cams: [
      // YouTube live streams; the IDs change if Seymour restarts a stream.
      { name: "Mystery Peak", src: "https://www.youtube-nocookie.com/embed/vLawo-FrBKk?autoplay=1&mute=1&playsinline=1" },
      { name: "Stoke-O-Meter snow stake", src: "https://www.youtube-nocookie.com/embed/yQdKq9NuEa0?autoplay=1&mute=1&playsinline=1" },
    ],
  },
};
