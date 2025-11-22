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

function calculateDays(start: Date, end: Date): number {
  const timeDifference: number = end.getTime() - start.getTime();
  const daysDifference: number = timeDifference / (1000 * 3600 * 24);
  return daysDifference;
}

function getWeekDifference(startDate: Date, endDate: Date): number {
  function getWeekNumber(d: Date): number {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      (((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7,
    );
    return weekNo;
  }
  const startWeek = getWeekNumber(startDate);
  const endWeek = getWeekNumber(endDate);
  const yearDiff = endDate.getUTCFullYear() - startDate.getUTCFullYear();

  return endWeek - startWeek + (yearDiff * 52);
}

function getMonthDifference(startDate: Date, endDate: Date): number {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();

  const yearDiff = endYear - startYear;
  const monthDiff = endMonth - startMonth;

  return yearDiff * 12 + monthDiff;
}

async function workItem(ownPlaylist: OwnPlaylist) {
  if (!ownPlaylist.owner.spotifyAccessData) return;
  const now = new Date();

  if (ownPlaylist.creationIntervalLastUpddate) {
    switch (ownPlaylist.creationInterval) {
      case "DAY": {
        const dayDiffs = calculateDays(
          ownPlaylist.creationIntervalLastUpddate,
          now,
        );
        if (dayDiffs < ownPlaylist.creationIntervalValue - 0.2) {
          return;
        }
        break;
      }
      case "WEEK": {
        if (now.getDay() !== 1) return;
        const weekDiffs = getWeekDifference(
          ownPlaylist.creationIntervalLastUpddate,
          now,
        );
        if (weekDiffs < ownPlaylist.creationIntervalValue) {
          return;
        }
        break;
      }
      case "MONTH": {
        if (now.getDate() !== 1) return;
        const monthDiff = getMonthDifference(
          ownPlaylist.creationIntervalLastUpddate,
          now,
        );
        if (monthDiff < ownPlaylist.creationIntervalValue) {
          return;
        }
      }
    }
  }

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

  await prisma.ownPlaylist.update({
    where: { id: ownPlaylist.id },
    data: {
      state: "SUCCESS",
      log: "",
      creationIntervalLastUpddate: new Date(),
    },
  });
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

Deno.cron("Own Playlist Cron", "0 2 * * *", async () => {
  await main();
});
