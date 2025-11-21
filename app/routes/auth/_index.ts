import { Hono } from "hono";

import login from "./login.ts";
import register from "./register.ts";
import check from "./check.ts";

const app = new Hono();

app.post("/login", ...login);
app.post("/register", ...register);
app.get("/check", ...check);

export { app as AuthRoutes };
