"use server";

import fs from "fs/promises";
import path from "path";
import { getSupabaseServerClient } from "../lib/supabase/server";

const SLIDES_FILE_PATH = path.join(process.cwd(), "src", "data", "hero_slides.json");

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  overlay_opacity: number;
}

// In-memory default fallback
const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600",
    title: "L'ÉCORCE Silencieuse",
    subtitle: "An extraordinary collection pairing structured silk outerwear with hand-thrown mineral earth ceramics. Designed to transcend the seasons.",
    overlay_opacity: 35
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1600",
    title: "LA SOIE D'ÉTERNITÉ",
    subtitle: "Spun Mulberry Silks and double-breasted dynamic outer coats designed for effortless draping and comfort.",
    overlay_opacity: 40
  }
];

async function verifyAdmin() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication status required.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Only administrator can perform this action.");
  }
}

export async function getHeroSlidesAction(): Promise<{ success: boolean; slides: HeroSlide[]; error?: string }> {
  try {
    const data = await fs.readFile(SLIDES_FILE_PATH, "utf-8");
    const slides = JSON.parse(data) as HeroSlide[];
    return { success: true, slides };
  } catch (err: any) {
    console.warn("Could not read hero slides file. Falling back to defaults:", err.message);
    return { success: true, slides: DEFAULT_SLIDES };
  }
}

export async function addHeroSlideAction(slide: Omit<HeroSlide, "id">): Promise<{ success: boolean; slide?: HeroSlide; error?: string }> {
  try {
    await verifyAdmin();

    const fetchRes = await getHeroSlidesAction();
    const slides = fetchRes.slides;

    const newSlide: HeroSlide = {
      id: crypto.randomUUID(),
      image: slide.image,
      title: slide.title,
      subtitle: slide.subtitle,
      overlay_opacity: Number(slide.overlay_opacity || 35),
    };

    slides.push(newSlide);
    await fs.writeFile(SLIDES_FILE_PATH, JSON.stringify(slides, null, 2), "utf-8");

    return { success: true, slide: newSlide };
  } catch (err: any) {
    console.error("Failed adding hero slide:", err);
    return { success: false, error: err.message || "Failed to add hero slide." };
  }
}

export async function updateHeroSlideAction(id: string, updatedFields: Partial<Omit<HeroSlide, "id">>): Promise<{ success: boolean; slides?: HeroSlide[]; error?: string }> {
  try {
    await verifyAdmin();

    const fetchRes = await getHeroSlidesAction();
    let slides = fetchRes.slides;

    slides = slides.map((slide) => {
      if (slide.id === id) {
        return {
          ...slide,
          ...updatedFields,
          overlay_opacity: updatedFields.overlay_opacity !== undefined ? Number(updatedFields.overlay_opacity) : slide.overlay_opacity,
        };
      }
      return slide;
    });

    await fs.writeFile(SLIDES_FILE_PATH, JSON.stringify(slides, null, 2), "utf-8");
    return { success: true, slides };
  } catch (err: any) {
    console.error("Failed updating hero slide:", err);
    return { success: false, error: err.message || "Failed to update hero slide." };
  }
}

export async function deleteHeroSlideAction(id: string): Promise<{ success: boolean; slides?: HeroSlide[]; error?: string }> {
  try {
    await verifyAdmin();

    const fetchRes = await getHeroSlidesAction();
    let slides = fetchRes.slides;

    slides = slides.filter((slide) => slide.id !== id);

    await fs.writeFile(SLIDES_FILE_PATH, JSON.stringify(slides, null, 2), "utf-8");
    return { success: true, slides };
  } catch (err: any) {
    console.error("Failed deleting hero slide:", err);
    return { success: false, error: err.message || "Failed to delete hero slide." };
  }
}
