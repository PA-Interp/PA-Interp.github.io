import { defineCollection, z } from "astro:content";

const team = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    role: z.enum(["PI", "Postdoc", "PhD Student", "Master Student", "Visiting Student", "Research Assistant"]),
    affiliation: z.string(),
    period: z.string().default(""),
    website: z.string().default(""),
    photo: z.string().optional(),
    photoPosition: z.string().optional(),
    researchTags: z.array(z.string()).default([]),
    representativeWork: z.string().default(""),
    bio: z.string().default(""),
    order: z.number(),
    // Former members keep their original role and are listed under Alumni.
    alumni: z.boolean().default(false),
    nowAt: z.string().default(""),
    nowAtUrl: z.string().default("")
  })
});

export const collections = { team };
