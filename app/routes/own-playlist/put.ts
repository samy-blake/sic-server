import { jwt } from "hono/jwt";
import { validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { prisma } from "config/db.ts";
// @ts-types="generated/index.d.ts"
import { Prisma } from "generated/index.js";
import { Context, Env } from "hono";
import { JsonInputSchema } from "../../interfaces/routes.ts";
import { JWToken } from "../../interfaces/jwt.ts";

const schema = z.object({
  name: z.string(),
  creationInterval: z.enum(["DAY", "WEEK", "MONTH"]),
  creationIntervalValue: z.number().gt(0).int(),
  linkedPlaylistId: z.string(),
  linkedPlaylistName: z.string(),
});

export default [
  jwt({
    secret: Deno.env.get("JWT_SECRET") || "",
  }),
  zValidator("json", schema),
  function <
    E extends Env,
    P extends string,
    I extends JsonInputSchema<typeof schema>,
  >() {
    return async (c: Context<E, P, I>) => {
      const tokenData: JWToken = c.get("jwtPayload");

      const data: Prisma.OwnPlaylistCreateInput = {
        ...c.req.valid("json"),

        provider: "SPOTIFY",
        owner: {
          connect: {
            id: tokenData.id,
          },
        },
      };

      const playlist = await prisma.ownPlaylist.create({
        data,
        omit: {
          ownerId: true,
        },
      });
      return c.json(playlist);
    };
  }(),
];
