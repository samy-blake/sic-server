import { openApiAuthDescription } from "util/openapi.ts";
import { validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { prisma } from "config/db.ts";
import { Context, Env } from "hono";
import { JsonInputSchema } from "interfaces/routes.ts";
import { JWToken } from "interfaces/jwt.ts";
import { jwt } from "hono/jwt";

const schema = z.object({});

export default [
  openApiAuthDescription({
    description: "Own Playlists",
    tags: ["Own Playlist"],
    responses: {
      200: {
        description: "delete single own playlist item",
        content: {
          "application/json": {
            // schema: resolver(z.object({ token: z.string() })),
          },
        },
      },
    },
  }),
  jwt({
    secret: Deno.env.get("JWT_SECRET") || "",
  }),
  zValidator("query", schema),
  function <
    E extends Env,
    P extends string,
    I extends JsonInputSchema<typeof schema>,
  >() {
    return async (c: Context<E, P, I>) => {
      const tokenData: JWToken = c.get("jwtPayload");

      await prisma.ownPlaylistItem.delete({
        where: {
          id: c.req.param("itemId") as string,
          ownPlaylist: {
            id: c.req.param("id") as string,
            ownerId: tokenData.id,
          },
        },
      });

      return c.body(null, 204);
    };
  }(),
];
