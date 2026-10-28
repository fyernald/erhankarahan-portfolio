import { count } from "drizzle-orm";
import { experiences, siteSettings, skills } from "../src/lib/db/schema";
import { connect } from "./lib/db";

/**
 * Seeds starter content so the website isn't empty on first launch.
 * Safe to run repeatedly: it only fills tables that are still empty.
 */
const ABOUT = `I'm Erhan, a photographer and film maker drawn to quiet moments, honest light and the people who bring a place to life.

For more than a decade I have worked with brands, magazines and couples, telling stories through portraits, documentary series and short films. Every project starts with listening — understanding what makes a story worth telling before a single frame is captured.

When I'm not on a shoot you'll find me travelling with a film camera, chasing golden hour and collecting small stories for my journal.`;

async function main() {
  const { db, close } = connect();
  try {
    await db
      .insert(siteSettings)
      .values({
        id: 1,
        heroSubtitle: "Based in Istanbul",
        aboutBody: ABOUT,
        email: "hello@erhankarahan.com",
        location: "Istanbul, Türkiye",
        socials: { instagram: "https://instagram.com/", youtube: "https://youtube.com/", vimeo: "https://vimeo.com/" },
        seoDescription: "Portfolio of Erhan Karahan — photographer and film maker capturing portraits, travel and documentary stories.",
      })
      .onConflictDoNothing();

    const [{ value: experienceCount }] = await db.select({ value: count() }).from(experiences);
    if (experienceCount === 0) {
      await db.insert(experiences).values([
        { kind: "work", title: "Freelance Photographer & Director", organization: "Erhan Karahan Studio", location: "Istanbul", startDate: "2019-03-01", endDate: null, description: "Editorial, commercial and documentary work for brands and publications across Europe." },
        { kind: "work", title: "Director of Photography", organization: "Atlas Films", location: "Istanbul", startDate: "2015-06-01", endDate: "2019-02-01", description: "Shot commercials, music videos and two short documentaries." },
        { kind: "education", title: "BA Photography & Video", organization: "Mimar Sinan Fine Arts University", location: "Istanbul", startDate: "2011-09-01", endDate: "2015-06-01", description: "" },
        { kind: "award", title: "Honourable Mention — Documentary", organization: "Istanbul Photo Awards", location: "", startDate: "2022-05-01", endDate: "2022-05-01", description: "" },
      ]);
    }

    const [{ value: skillCount }] = await db.select({ value: count() }).from(skills);
    if (skillCount === 0) {
      await db.insert(skills).values([
        { name: "Portrait photography", group: "Craft", level: 95, sortOrder: 0 },
        { name: "Documentary film", group: "Craft", level: 85, sortOrder: 1 },
        { name: "Lighting", group: "Craft", level: 90, sortOrder: 2 },
        { name: "Adobe Lightroom", group: "Tools", level: 95, sortOrder: 3 },
        { name: "DaVinci Resolve", group: "Tools", level: 80, sortOrder: 4 },
        { name: "Premiere Pro", group: "Tools", level: 85, sortOrder: 5 },
      ]);
    }
    console.log("✓ Seed data in place");
  } finally {
    await close();
  }
}

main().catch((error) => {
  console.error("✗ Seed failed:", error);
  process.exit(1);
});
