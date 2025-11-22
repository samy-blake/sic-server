import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { openAPISpecs } from "hono-openapi";
import { PlaylistRoutes } from "./playlist/_index.ts";
import { AuthRoutes } from "./auth/_index.ts";
import { UserRoutes } from "./user/_index.ts";
import { SpotifyRoutes } from "./spotify/_index.ts";
import { OwnPlaylistRoutes } from "./own-playlist/_index.ts";

const app = new Hono();

app.use(cors({
  origin: ["https://sic.spielwiese.ninja", "https://api.sic.spielwiese.ninja"],
}));
// app.use(csrf());

app.get("/", (c) => c.text("Aloa \nGreetings Samy!"));

app.route("/playlist", PlaylistRoutes);
app.route("/auth", AuthRoutes);
app.route("/user", UserRoutes);
app.route("/spotify", SpotifyRoutes);
app.route("/own-playlist", OwnPlaylistRoutes);

app.get(
  "/docs",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Sharing is Caring Server",
        version: "0.1.0",
        description: "Author: Sören Balke",
      },
      // servers: [{ url: "http://localhost:3000", description: "SiC Server" }],
    },
  }),
);
app.get("/ui", swaggerUI({ url: "/docs" }));

export default app;
