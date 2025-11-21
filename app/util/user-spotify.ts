import { AccessToken, SpotifyApi } from "@spotify/web-api-ts-sdk";
import { prisma } from "../config/db.ts";
import { JWToken } from "../interfaces/jwt.ts";

export async function getUserSpotifySdk(tokenData: JWToken) {
  const { spotifyAccessData } = await prisma.auth.findFirst({
    where: {
      id: tokenData.id,
    },
    select: {
      spotifyAccessData: true,
    },
  }) || { spotifyAccessData: null };

  if (!spotifyAccessData) {
    throw new Error("no spotify connection");
  }

  return SpotifyApi.withAccessToken(
    Deno.env.get("SPOTIFY_CLIENT_ID") as string,
    JSON.parse(spotifyAccessData) as AccessToken,
  );
}
