import { Card, PillLink } from "@/components/Ui";
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
  if (webcams.cams.length === 0) {
    return (
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-[#c9d3dd]">
            {name} doesn&apos;t offer its webcams for embedding.
          </p>
          <PillLink href={webcams.page} filled>
            {name} webcams
          </PillLink>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-3">
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
            <figcaption className="px-4 py-3 text-sm font-semibold text-white lg:px-3 lg:py-2 lg:text-xs">
              {cam.name}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs text-[#7d8da1]">
          Live cams from {name}. If one isn&apos;t loading, try the resort&apos;s page.
        </p>
        <PillLink href={webcams.page}>{name} webcam page</PillLink>
      </div>
    </div>
  );
}
