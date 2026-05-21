import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arooj Arts Showroom",
    short_name: "Arooj Arts",
    description: "Prestige catalog showrooms and exclusive tactile curations. Spun Mulberry Silks, Geologic Accents, Fine Chronosphere Timekeepers, & Sandalwood Extraits.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f6",
    theme_color: "#151515",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
