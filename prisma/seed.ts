import dotenvx from "@dotenvx/dotenvx";
dotenvx.config();

import { prisma } from "../app/config/db.ts";
import { generateHash } from "../app/util/hash.ts";
// @ts-types="generated/index.d.ts"
import { Prisma } from "generated/index.js";

const auth = {
  username: "sbalke",
  password: generateHash("soerenbalke"),
};

const playlists: Prisma.PlaylistCreateManyInput[] = [
  {
    id: "3zYqsTxJcnQk2ntt7xfLYp",
    genre: "Chill",
    name: "Sharing is Caring",
  },
  {
    id: "0vFhJvpSw22jYQFtp5lHBm",
    genre: "Chill",
    name: "Sharing is Caring vol. 2",
  },
  {
    id: "08i6fXYAAXcvG0EiBERuzC",
    genre: "Rap",
    name: "Sharing is Caring - Feel Good Rap",
  },
  {
    id: "160L2lUBAn6xHpdxwneuYe",
    genre: "ChilliMilli",
    name: "Sharing is Caring - ChilliMilli Edition",
  },
  {
    id: "51kBNVSj0onP4HBB6lBblB",
    genre: "Tekk",
    name: "Sharing is Caring - TekkMekk Edition",
  },
  {
    id: "2PtbYneEB5ecaQf9uZlZ1Q",
    genre: "Hardstyle, Rawstyle",
    name: "Sharing is Caring - Power Edition",
  },
  {
    id: "2FycJWRH5AganIgWbbkvrp",
    genre: "Hardcore, Frenchcore",
    name: "Sharing is Caring - Superpower Edition",
  },
  {
    id: "3cCj6LiWZ09nldw1uUrsvb",
    genre: "Drum and Bass",
    name: "Sharing is Caring - DnB Edition",
  },

  {
    id: "3f1Kqad1rYCIRuMukyeOVe",
    genre: "Hardstyle, Hardcore",
    name: "Sharing is Caring - Schubrakete Daily",
  },
]



await prisma.auth.create({ data: auth });

await prisma.playlist.createMany({
  data: playlists
})


await prisma.$disconnect();
