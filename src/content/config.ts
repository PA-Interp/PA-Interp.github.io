import { defineCollection, z } from "astro:content";

const team = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    role: z.enum(["PI", "Postdoc", "PhD Student", "Visiting Student", "Research Assistant"]),
    affiliation: z.string(),
    period: z.string().default(""),
    website: z.string().default(""),
    photo: z.string().optional(),
    photoPosition: z.string().optional(),
    researchTags: z.array(z.string()).default([]),
    representativeWork: z.string().default(""),
    bio: z.string().default(""),
    order: z.number()
  })
});

export const collections = { team };
