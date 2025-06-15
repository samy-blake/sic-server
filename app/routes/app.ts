import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { openAPISpecs } from "hono-openapi";
import { AuthRoutes } from "./auth.ts";
import { PlaylistRoutes } from "./playlist.ts";

const app = new Hono();

app.use(cors({
  origin: ["https://sic.spielwiese.ninja", "https://api.sic.spielwiese.ninja"],
}));
// app.use(csrf());

app.get("/api/", (c) => c.text("Aloa \nGreetings Samy!"));

// app.route("/api/auth", AuthRoutes);
app.route("/api/playlist", PlaylistRoutes);

app.get(
  "/docs",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Sharing is Caring Server",
        version: "0.0.1",
        description: "Author: Sören Balke",
      },
      // servers: [{ url: "http://localhost:3000", description: "Local Server" }],
    },
  }),
);
app.get("/ui", swaggerUI({ url: "/docs" }));

export default app;
