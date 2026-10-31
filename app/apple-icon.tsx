import { ImageResponse } from "next/og";

// Placeholder Apple touch icon (generated at build time) until a real logo is provided.
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
          background: "#000000",
          color: "#FFD60A",
          fontSize: 120,
          fontWeight: 800,
        }}
      >
        S
      </div>
    ),
    size,
  );
}
