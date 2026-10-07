import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Appeldoffres.sn",
    short_name: "SoumissionPME",
    description: "Aide aux PME sénégalaises pour répondre aux marchés publics",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#063a20",
    icons: [
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
