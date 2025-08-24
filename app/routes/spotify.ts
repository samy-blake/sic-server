import { Hono } from "hono";
import { validator as zValidator } from "hono-openapi/zod";
import { jwt, type JwtVariables } from "hono/jwt";
import { z } from "zod";
import { AccessToken, SpotifyApi } from "@spotify/web-api-ts-sdk";
import { prisma } from "../config/db.ts";

// @ts-types="generated/index.d.ts"
import { Prisma } from "generated/index.js";

import { SpotifyDoc } from "../docs/spotify.docs.ts";
import { JWToken } from "../interfaces/JWT.interface.ts";
import { getUserSpotifySdk } from "../util/user-spotify.ts";
type Variables = JwtVariables;

const app = new Hono<{ Variables: Variables }>();
app.use(
  "*",
  jwt({
    secret: Deno.env.get("JWT_SECRET") || "",
  }),
);

const userTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
  expires: z.number().optional(),
});

// src: https://www.npmjs.com/package/@spotify/web-api-ts-sdk#mixed-server-and-client-side-authentication
app.post(
  "/user-token",
  SpotifyDoc.userToken,
  zValidator("json", userTokenSchema),
  async (c) => {
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
    await prisma.auth.update({
      where: {
        id: tokenData.id,
      },
      data: {
        spotifyAccessData: JSON.stringify(data),
      },
    });

    return c.json({});
  },
);

const schema = z.object({});
app.post(
  "/",
  SpotifyDoc.userToken,
  zValidator("json", schema),
  async (c) => {
    const tokenData: JWToken = c.get("jwtPayload");
    const sdk = await getUserSpotifySdk(tokenData);
    // sdk.player.
  },
);

export { app as SpotifyRoutes };
