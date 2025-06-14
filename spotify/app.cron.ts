import { prisma } from "../app/config/db.ts";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const api = SpotifyApi.withClientCredentials(
  Deno.env.get("SPOTIFY_CLIENT_ID") as string,
  Deno.env.get("SPOTIFY_CLIENT_SECRET") as string,
);

async function compareDbAndSpotify(id: string): Promise<void> {
  const dbSongs = await prisma.song.findMany({
    where: {
      playlists: {
        every: {
          playlistId: id,
        },
      },
    },
  });

  const spotifyPlaylist = await api.playlists.getPlaylist(id);
  spotifyPlaylist.tracks.items.forEach(async (t) => {
    const track = {
      artists: t.track.artists.map((a) => a.name).join(", "),
      id: t.track.id,
      name: t.track.name,
      trackNumber: t.track.track_number,
    };

    const dbTrack = dbSongs.filter((s) => s.id = track.id).pop();
    if (dbTrack) {
      //update
      if (
        track.artists == dbTrack.artists ||
        track.name == dbTrack.name ||
        track.trackNumber == dbTrack.trackNumber
      ) {
        try {
          await prisma.song.update({
            where: {
              id: dbTrack.id,
            },
            data: track,
          });
          console.log("UPDATE", "Track:", track.name, "Artists", track.artists);
        } catch (err) {
          console.error(JSON.stringify(track), err);
        }
      }
    } else {
      //create
      try {
        await prisma.song.create({
          data: {
            ...track,
            playlists: {
              create: {
                playlistId: id,
              },
            },
          },
        });
        console.log("CREATE", "Track:", track.name, "Artists", track.artists);
      } catch (err) {
        console.error(JSON.stringify(track), err);
      }
    }
  });
}

// Deno.cron("Log a message", { hour: { every: 1 } }, async () => {
console.log("Start cron", (new Date()).toISOString());
const playlists = await prisma.playlist.findMany();
const playlistPromises: Promise<void>[] = playlists.map(async (p) =>
  await compareDbAndSpotify(p.id)
);

const results = await Promise.allSettled<void>(playlistPromises);
results.forEach((r) => {
  console.log("status:", r);
});
// });
