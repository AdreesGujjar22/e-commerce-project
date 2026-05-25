import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arooj Arts Showroom",
    short_name: "Arooj Arts",
    description: "A premium online store for clothing, accessories, and lifestyle products. Shop quality designs with modern style and trusted delivery across Pakistan.",
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
