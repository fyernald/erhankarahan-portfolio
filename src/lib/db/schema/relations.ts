import { relations } from "drizzle-orm";
import { media } from "./media";
import { posts } from "./posts";
import { projectMedia, projects } from "./projects";

export const postsRelations = relations(posts, ({ one }) => ({
  cover: one(media, { fields: [posts.coverMediaId], references: [media.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  cover: one(media, { fields: [projects.coverMediaId], references: [media.id] }),
  gallery: many(projectMedia),
}));

export const projectMediaRelations = relations(projectMedia, ({ one }) => ({
  project: one(projects, { fields: [projectMedia.projectId], references: [projects.id] }),
  media: one(media, { fields: [projectMedia.mediaId], references: [media.id] }),
}));
