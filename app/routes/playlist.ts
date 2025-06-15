import { Hono } from "hono";
import { validator as zValidator } from "hono-openapi/zod";
import type { JwtVariables } from "hono/jwt";
import { z } from "zod";
import { prisma } from "../config/db.ts";
// @ts-types="generated/index.d.ts"
import { Prisma } from "generated/index.js";
import { PlaylistDoc } from "../docs/playlist.docs.ts";
type Variables = JwtVariables;

const app = new Hono<{ Variables: Variables }>();
// app.use(
//   "*",
//   jwt({
//     secret: Deno.env.get("JWT_SECRET") || "",
//   }),
// );

const getAllQuerySchema = z.object({
  // name: z.string().optional(),
});
app.get(
  "/",
  PlaylistDoc.getAll,
  zValidator("query", getAllQuerySchema),
  async (c) => {
    const params: Prisma.PlaylistWhereInput = {};

    // if (c.req.query("name")) {
    //   params["name"] = {
    //     search: c.req.query("name"),
    //   };
    // }

    const playlists = await prisma.playlist.findMany({
      select: {
        createdAt: true,
        genre: true,
        id: true,
        image: true,
        name: true,
        updatedAt: true,
        url: true,
        _count: {
          select: {
            songs: true,
          },
        },
      },
      where: params,
    });

    return c.json(playlists);
  },
);

app.get(
  "/:id",
  PlaylistDoc.getSingle,
  async (c) => {
    const params: Prisma.PlaylistWhereInput = {
      id: c.req.param("id"),
    };

    const playlist = await prisma.playlist.findFirst({
      where: params,
      include: {
        songs: {
          select: {
            addedAt: true,
            song: true,
          },
        },
      },
      omit: {
        createUpdateLog: true,
      },
    });

    return c.json(playlist);
  },
);

export { app as PlaylistRoutes };
