import { Card } from "@/components/Ui";
import { SNOW_LINE_OFFSET, fmt } from "@/lib/Conditions";
import type { FreezingSeries } from "@/lib/Forecast";

interface Props {
  freezing: FreezingSeries;
  precip: { name: string; precipitation: number }[];
  gusts: { name: string; gust: number }[];
  cloud: number | null;
}

const round10 = (n: number) => Math.round(n / 10) * 10;

export default function Summary({ freezing, precip, gusts, cloud }: Props) {
  const fl = freezing.current;
  const wet = precip.filter((p) => p.precipitation > 0.1);
  const windiest = gusts.reduce((a, b) => (b.gust > a.gust ? b : a));
  const delta = freezing.deltaNext24;

  const items: { title: string; body: string }[] = [];

  if (wet.length === 0) {
    items.push({
      title: "Dry",
      body: `No precipitation this hour on any of the three mountains.${
        cloud == null
          ? ""
          : cloud < 20
          ? " Mostly clear skies."
          : cloud < 60
          ? " Partly cloudy."
          : " Mostly cloudy."
      } Freezing level is ${fmt(fl)} m.`,
    });
  } else {
    items.push({
      title: "Precipitation",
      body: `${wet.map((w) => w.name).join(", ")} ${
        wet.length > 1 ? "are" : "is"
      } getting precipitation. Snow above about ${fmt(
        fl - SNOW_LINE_OFFSET
      )} m, rain below.`,
    });
  }

  items.push({
    title:
      windiest.gust < 20 ? "Light wind" : windiest.gust < 40 ? "Breezy" : "Windy",
    body: `Gusts up to ${windiest.gust} km/h at ${windiest.name}.`,
  });

  if (delta != null) {
    const later = round10(fl + delta);
    if (Math.abs(delta) < 100) {
      items.push({
        title: "Freezing level steady",
        body: `About ${fmt(fl)} m now and ${fmt(later)} m in 24 hours.`,
      });
    } else if (delta > 0) {
      items.push({
        title: "Freezing level rising",
        body: `${fmt(fl)} m now, up to about ${fmt(later)} m in 24 hours. The snow line climbs with it.`,
      });
    } else {
      items.push({
        title: "Freezing level falling",
        body: `${fmt(fl)} m now, down to about ${fmt(later)} m in 24 hours. The snow line drops with it.`,
      });
    }
  }

  return (
    <Card>
      <h2 className="text-sm font-medium text-[#9aa7b5]">
        North Shore summary
      </h2>
      <div className="mt-4 grid gap-5 md:auto-cols-fr md:grid-flow-col md:gap-0 md:divide-x md:divide-[#2f3840]">
        {items.map((it) => (
          <div key={it.title} className="md:px-5 md:first:pl-0 md:last:pr-0">
            <p className="font-display text-2xl font-bold uppercase tracking-wide text-white">
              {it.title}
            </p>
            <p className="mt-1 text-[#c9d3dd]">{it.body}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}