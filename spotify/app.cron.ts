import { prisma } from "../app/config/db.ts";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { iDB } from "../app/interfaces/DB.ts";

const api = SpotifyApi.withClientCredentials(
  Deno.env.get("SPOTIFY_CLIENT_ID") as string,
  Deno.env.get("SPOTIFY_CLIENT_SECRET") as string,
);

async function compareDbAndSpotify(playlist: iDB.Playlist): Promise<void> {
  const dbSongs = await prisma.song.findMany({
    include: {
      playlists: {
        select: {
          addedAt: true,
        },
      },
    },
    where: {
      playlists: {
        some: {
          playlistId: playlist.id,
        },
      },
    },
  });
  // api.playlists.getPlaylistItems(playlist.id, "DE", "all", )
  const spotifyPlaylist = await api.playlists.getPlaylist(
    playlist.id,
    "DE",
    "href,images,tracks(total,items(added_at,track(id,name,artists(name),album(images))))",
  );
  const spotifyPlaylistSongIds: string[] = [];

  const tracks = [...spotifyPlaylist.tracks.items];

  while (spotifyPlaylist.tracks.total > tracks.length) {
    // load more tracks from playlist
    const spotifyPlayListItems = await api.playlists.getPlaylistItems(
      playlist.id,
      "DE",
      "items(added_at,track(id,name,artists(name),album(images)))",
      50,
      tracks.length - 1,
    );
    tracks.push(...spotifyPlayListItems.items);
  }

  tracks.sort((a: any, b: any) =>
    (new Date(a.track.added_at)).getTime() -
    (new Date(b.track.added_at)).getTime()
  );

  tracks.forEach(async (t) => {
    const track = {
      artists: t.track.artists.map((a) => a.name).join(", "),
      id: t.track.id,
      name: t.track.name,
      image: t.track.album?.images[0]?.url || "",
    };
    spotifyPlaylistSongIds.push(track.id);

    const dbTrack = dbSongs.filter((s) => s.id === track.id).pop();
    if (dbTrack) {
      //update
      if (
        track.artists !== dbTrack.artists ||
        track.name !== dbTrack.name ||
        track.image !== dbTrack.image
      ) {
        try {
          await prisma.song.update({
            where: {
              id: dbTrack.id,
            },
            data: track,
          });

          // TODO: rethinking!!!11elf

          // if (playlist.createUpdateLog) {
          //   await prisma.updateLog.create({
          //     data: {
          //       songId: dbTrack.id,
          //       playlistId: playlist.id,
          //       type: "UPDATE",
          //     },
          //   });
          // }
          console.log("UPDATE", "Track:", track.name, "Artists", track.artists);
        } catch (err) {
          console.error(JSON.stringify(track), err);
        }
      }
    } else {
      //create
      try {
        const newSong = await prisma.song.create({
          data: {
            ...track,
            playlists: {
              create: {
                playlistId: playlist.id,
                addedAt: t.added_at,
              },
            },
          },
        });
        if (playlist.createUpdateLog) {
          await prisma.updateLog.create({
            data: {
              songId: newSong.id,
              playlistId: playlist.id,
              type: "CREATE",
            },
          });
        }
        console.log("CREATE", "Track:", track.name, "Artists", track.artists);
      } catch (err: any) {
        if (err?.meta?.target === "PRIMARY") {
          // song in other playlist already exists
          const existingSong = await prisma.song.findFirst({
            where: { id: track.id },
          });

          if (existingSong) {
            try {
              await prisma.songInPlaylist.create({
                data: {
                  playlistId: playlist.id,
                  songId: existingSong.id,
                  addedAt: t.added_at,
                },
              });
            } catch (e) {
              console.error(e);
            }
            if (playlist.createUpdateLog) {
              await prisma.updateLog.create({
                data: {
                  songId: existingSong.id,
                  playlistId: playlist.id,
                  type: "CREATE",
                },
              });
            }
          } else {
            console.error(JSON.stringify(track), "not found in songs :(");
          }
        } else {
          console.error(JSON.stringify(track), err);
        }
      }
    }
  });

  // delete songs
  dbSongs.filter((v) => !spotifyPlaylistSongIds.includes(v.id)).forEach(
    async (s) => {
      await prisma.song.delete({
        where: {
          id: s.id,
        },
      });

      if (playlist.createUpdateLog) {
        await prisma.updateLog.create({
          data: {
            type: "DELETE",
            alternativeSong: JSON.stringify({
              id: s.id,
              artists: s.artists,
              name: s.name,
            }),
            playlistId: playlist.id,
          },
        });
      }
    },
  );

  const playListData = {
    id: playlist.id,
    image: spotifyPlaylist.images[0]?.url,
  };

  if (
    playlist.image !== playListData.image
  ) {
    // update playlist Data
    await prisma.playlist.update({
      where: {
        id: playListData.id,
      },
      data: playListData,
    });
  }
}

// Deno.cron("Log a message", { hour: { every: 1 } }, async () => {
console.log("Start cron", (new Date()).toISOString());
const playlists: iDB.Playlist[] = await prisma.playlist.findMany();
playlists.forEach(async (p) => await compareDbAndSpotify(p));
// });
