import app from "./app/routes/app.ts";

import "./spotify/app.cron.ts";

Deno.serve(
  {
    port: JSON.parse(Deno.env.get("PORT") || "3000") as number,
  },
  app.fetch,
);

console.log("finish loading");
