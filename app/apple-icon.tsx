import { ImageResponse } from "next/og";

// iOS home-screen icon: the same line-drawn spruce as app/icon.svg. iOS rounds
// the corners itself, so the background here is a plain square.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0d10",
        }}
      >
        <svg width="150" height="150" viewBox="0 0 32 32">
          <path
            fill="none"
            stroke="#a3c49b"
            strokeWidth="1.6"
            strokeLinecap="round"
            d="M16 4V28M16 7Q15.4 9.7 12 10M16 7Q16.6 9.7 20 10M16 12Q15.1 15.15 10 15.5M16 12Q16.9 15.15 22 15.5M16 17Q14.8 20.6 8 21M16 17Q17.2 20.6 24 21M16 22Q14.5 26.05 6 26.5M16 22Q17.5 26.05 26 26.5"
          />
        </svg>
      </div>
    ),
    size
  );
}
