import type { MountainWebcams } from "@/config/webcams";

// Each cam is the resort's own embed, loaded lazily so cams below the fold
// don't start streaming until they're scrolled into view.
export default function WebcamGallery({
  name,
  webcams,
}: {
  name: string;
  webcams: MountainWebcams;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {webcams.cams.map((cam) => (
          <figure
            key={cam.src}
            className="plate border border-[#232a31] bg-[#13181d]"
          >
            <div className="relative aspect-video bg-[#0d1115]">
              <iframe
                src={cam.src}
                title={`${name} ${cam.name} webcam`}
                loading="lazy"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
            <figcaption className="px-4 py-3 text-sm font-semibold text-white">
              {cam.name}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="text-xs text-[#7d8da1]">
        Live cams from {name}.{" "}
        <a
          href={webcams.page}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          Open the resort&apos;s webcam page
        </a>{" "}
        if one isn&apos;t loading.
      </p>
    </div>
  );
}
