import { openApiAuthDescription } from "util/openapi.ts";
import { validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { jwt } from "hono/jwt";
import { prisma } from "config/db.ts";
import { Context, Env } from "hono";
import { JsonInputSchema } from "interfaces/routes.ts";
import { AccessToken, SpotifyApi } from "@spotify/web-api-ts-sdk";
import { JWToken } from "interfaces/jwt.ts";

const schema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
  expires: z.number().optional(),
});

export default [
  openApiAuthDescription({
    description: "Spotify",
    tags: ["Spotify"],
    responses: {
      204: {
        description: "set user spotify access data",
      },
    },
  }),
  zValidator("json", schema),
  jwt({
    secret: Deno.env.get("JWT_SECRET") || "",
  }),
  function <
    E extends Env,
    P extends string,
    I extends JsonInputSchema<typeof schema>,
  >() {
    return async (c: Context<E, P, I>) => {
      const data: AccessToken = c.req.valid("json");

      const sdk = SpotifyApi.withAccessToken(
        Deno.env.get("SPOTIFY_CLIENT_ID") as string,
        data,
      );

      try {
        const profile = await sdk.currentUser.profile();
        if (!profile) throw new Error("unauth");
      } catch (err) {
        console.log(err);

        c.status(401);
        return c.json({});
      }

      const tokenData: JWToken = c.get("jwtPayload");
      await prisma.user.update({
        where: {
          id: tokenData.id,
        },
        data: {
          spotifyAccessData: JSON.stringify(data),
        },
      });

      return c.body(null, 204);
    };
  }(),
];
