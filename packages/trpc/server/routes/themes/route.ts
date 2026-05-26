import { z, zodUndefinedModel } from "../../schema";
import { publicProcedure, router } from "../../trpc";
import { db, themesTable, eq } from "@repo/database";
import { TRPCError } from "@trpc/server";

const themeSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  category: z.enum([
    "movie",
    "anime",
    "game",
    "startup",
    "tech",
    "os",
    "event",
    "community",
  ]),
  config: z.any(),
  previewImageUrl: z.string().nullable(),
  isDefault: z.boolean().nullable(),
  createdAt: z.date().nullable(),
});

export const themesRouter = router({
  list: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/themes",
        tags: ["Themes"],
        summary: "Get all themes",
      },
    })
    .input(zodUndefinedModel)
    .output(z.array(themeSchema))
    .query(async () => {
      const themes = await db.query.themesTable.findMany();
      return themes as any;
    }),

  getBySlug: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/themes/{slug}",
        tags: ["Themes"],
        summary: "Get theme by slug",
      },
    })
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .output(themeSchema)
    .query(async ({ input }) => {
      const theme = await db.query.themesTable.findFirst({
        where: eq(themesTable.slug, input.slug),
      });

      if (!theme) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Theme not found",
        });
      }

      return theme as any;
    }),
});