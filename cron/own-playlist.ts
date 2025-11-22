import { prisma } from "config/db.ts";
import { AccessToken, SpotifyApi } from "@spotify/web-api-ts-sdk";
import { shuffleArrayStrings } from "util/random.ts";

interface OwnPlaylist {
  id: string;
  linkedPlaylistId: string;
  provider: "SPOTIFY";
  creationIntervalLastUpddate: Date | null;
  creationIntervalValue: number;
  creationInterval: any;
  owner: {
    id: string;
    spotifyAccessData: string | null;
  };
  ownPlaylistIncludes: {
    id: string;
  }[];
  ownPlaylistExcludes: {
    id: string;
  }[];
}

function setSpotifyApiClient(spotifyAccessData: string): SpotifyApi {
  const accessData = JSON.parse(spotifyAccessData) as AccessToken;
  return SpotifyApi.withAccessToken(
    Deno.env.get("SPOTIFY_CLIENT_ID") as string,
    accessData,
  );
}

async function workItem(ownPlaylist: OwnPlaylist) {
  if (!ownPlaylist.owner.spotifyAccessData) return;

  const spotifyApiClient = setSpotifyApiClient(
    ownPlaylist.owner.spotifyAccessData,
  );
  const ownerSettings = await prisma.user.findFirst({
    where: { id: ownPlaylist.owner.id },
    select: {
      likedSongs: {
        select: {
          id: true,
        },
      },
      dislikedSongs: {
        select: {
          id: true,
        },
      },
    },
  });

  const ownPlaylistItems = await prisma.ownPlaylistItem.findMany({
    where: {
      ownPlaylistId: ownPlaylist.id,
    },
    select: {
      playlistId: true,
      amount: true,
    },
  });
  const songIds: string[] = [];
  let notSongIds = [
    ...ownPlaylist.ownPlaylistExcludes.map((s) => s.id),
  ];
  if (ownerSettings?.dislikedSongs) {
    notSongIds.push(
      ...ownerSettings.dislikedSongs.map((s) => s.id),
    );
  }
  notSongIds = notSongIds.filter((v, i, a) => a.indexOf(v) === i);

  for (const opi of ownPlaylistItems) {
    const songsFromPlaylist = await prisma.songInPlaylist.findMany(
      {
        where: {
          playlistId: opi.playlistId,
          songId: {
            notIn: notSongIds,
          },
        },
        select: {
          songId: true,
        },
      },
    );

    const randomSongsFromPlaylist = shuffleArrayStrings(
      songsFromPlaylist.map((s) => s.songId),
    ).slice(
      0,
      opi.amount,
    );

    songIds.push(
      ...randomSongsFromPlaylist,
    );
  }

  await spotifyApiClient.playlists.updatePlaylistItems(
    ownPlaylist.linkedPlaylistId,
    {
      uris: songIds.map((s) => `spotify:track:${s}`),
    },
  );
  const accessToken = await spotifyApiClient.getAccessToken();

  if (accessToken) {
    await prisma.user.update({
      where: { id: ownPlaylist.owner.id },
      data: { spotifyAccessData: JSON.stringify(accessToken) },
    });
  }

  spotifyApiClient.logOut();
}

async function main() {
  const ownPlaylists = await prisma.ownPlaylist.findMany({
    where: {
      owner: {
        spotifyAccessData: {
          not: null,
        },
      },
    },
    select: {
      id: true,
      creationInterval: true, // TODO: fill me with love
      creationIntervalValue: true,
      creationIntervalLastUpddate: true,
      linkedPlaylistId: true,

      ownPlaylistExcludes: {
        select: { id: true },
      },
      ownPlaylistIncludes: {
        select: { id: true },
      },
      provider: true,
      owner: {
        select: {
          id: true,
          spotifyAccessData: true,
        },
      },
    },
  });
  ownPlaylists.forEach(async (p) => {
    try {
      await workItem(p);

      await prisma.ownPlaylist.update({
        where: { id: p.id },
        data: {
          state: "SUCCESS",
          log: "",
          creationIntervalLastUpddate: new Date(),
        },
      });
    } catch (e) {
      console.log(e);
      await prisma.ownPlaylist.update({
        where: { id: p.id },
        data: {
          state: "FAILED",
          log: typeof e === "string" ? e : (e as any).toString(),
        },
      });
    }
  });
}

Deno.cron("Spotify Cron", "0 1 * * *", async () => {
  await main();
});
