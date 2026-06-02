import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Dandelion Effect";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#18191B",
          color: "#F4EFE5",
          padding: 76,
          border: "1px solid #343437",
        }}
      >
        <div style={{ color: "#D6B77A", fontSize: 34, letterSpacing: 12 }}>
          DANDELION EFFECT
        </div>
        <div style={{ fontSize: 82, lineHeight: 1.08, letterSpacing: -2 }}>
          브랜드가 퍼지는
          <br />
          구조를 설계합니다.
        </div>
        <div style={{ color: "#8B8B86", fontSize: 24, letterSpacing: 5 }}>
          PREMIUM MARKETING GROWTH COMPANY
        </div>
      </div>
    ),
    size
  );
}
