import dotenvx from "@dotenvx/dotenvx";
dotenvx.config();

import { prisma } from "config/db.ts";
import { generateHash } from "util/hash.ts";
// @ts-types="generated/index.d.ts"
import { Prisma } from "generated/index.js";

if (!await prisma.user.count()) {
  const auth = {
    username: "samyblake",
    password: generateHash("soerenbalke"),
  };
  await prisma.user.create({ data: auth });
}

const playlists: Prisma.PlaylistCreateManyInput[] = [
  {
    id: "3zYqsTxJcnQk2ntt7xfLYp",
    genre: "Chill",
    name: "Sharing is Caring",
    image: "",
    order: 1,
  },
  {
    id: "0vFhJvpSw22jYQFtp5lHBm",
    genre: "Chill",
    name: "Sharing is Caring vol. 2",
    image: "",
    order: 2,
  },
  {
    id: "08i6fXYAAXcvG0EiBERuzC",
    genre: "Rap",
    name: "Sharing is Caring - Feel Good Rap",
    image: "",
    order: 4,
  },
  {
    id: "160L2lUBAn6xHpdxwneuYe",
    genre: "ChilliMilli",
    name: "Sharing is Caring - ChilliMilli Edition",
    image: "",
    order: 5,
  },
  {
    id: "51kBNVSj0onP4HBB6lBblB",
    genre: "Tekk",
    name: "Sharing is Caring - TekkMekk Edition",
    image: "",
    order: 6,
  },
  {
    id: "1hORL79vJlpPCfoFbdwOaO",
    genre: "Techno",
    name: "Sharing is Caring - Techno Edition",
    image: "",
    order: 7,
  },
  {
    id: "2PtbYneEB5ecaQf9uZlZ1Q",
    genre: "Hardstyle, Rawstyle",
    name: "Sharing is Caring - Power Edition",
    image: "",
    order: 8,
  },
  {
    id: "2FycJWRH5AganIgWbbkvrp",
    genre: "Hardcore, Frenchcore",
    name: "Sharing is Caring - Superpower Edition",
    image: "",
    order: 9,
  },
  {
    id: "3cCj6LiWZ09nldw1uUrsvb",
    genre: "Drum and Bass",
    name: "Sharing is Caring - DnB Edition",
    image: "",
    order: 10,
  },
];

for (const playlist of playlists) {
  const dbPlaylist = await prisma.playlist.findFirst({
    where: {
      id: playlist.id,
    },
  });
  if (dbPlaylist) {
    await prisma.playlist.update({
      where: {
        id: playlist.id,
      },
      data: playlist,
    });
  } else {
    await prisma.playlist.create({
      data: playlist,
    });
  }
}

await prisma.$disconnect();
