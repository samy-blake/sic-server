import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { openAPISpecs } from "hono-openapi";
import { AuthRoutes } from "./auth.ts";

const app = new Hono();

app.use(cors());
// app.use(csrf());

app.get("/", (c) => c.text("Huhu \nGreetings Sören!"));

app.route("/api/auth", AuthRoutes);

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
  })
);
app.get("/ui", swaggerUI({ url: "/docs" }));

export default app;
