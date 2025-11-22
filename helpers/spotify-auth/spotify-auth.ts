import http, { IncomingMessage, ServerResponse } from "node:http";
import fs from "node:fs";
import { URL } from "node:url";

const spotifyScopes = [
  "playlist-modify-private",
  "playlist-modify-public",
  "user-read-email",
];

const hostname = "127.0.0.1";
const port = 3000;
const SITE_URL = `http://${hostname}:${port}`;
const REDIRECT_URI = `${SITE_URL}/success`;

const clientId = Deno.env.get("SPOTIFY_CLIENT_ID")!;
const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET")!;

function buildSpotifyAuthorizeUrl(
  clientId: string,
  redirectUri: string,
  scopes: string[],
  state = "xyz",
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scopes.join(" "),
    state,
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Hilfsfunktion: Tauscht Code → Token (Spotify OAuth)
async function exchangeCodeForTokens(code: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error("Token exchange failed: " + (await response.text()));
  }

  return await response.json();
}

const server = http.createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? "/";
    const urlObj = new URL(SITE_URL + url);

    // --- Callback (/success) ---
    if (url.startsWith("/success")) {
      res.writeHead(200, { "Content-Type": "text/html" });
      const code = urlObj.searchParams.get("code");

      if (!code) {
        res.write("Missing code.");
        res.end();
        return;
      }

      try {
        const tokenData = await exchangeCodeForTokens(code);

        fs.writeFileSync(
          "auth.json",
          JSON.stringify(
            {
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token,
              expires_in: tokenData.expires_in,
            },
            null,
            2,
          ),
        );

        console.log("auth.json written successfully");
        res.write("auth.json written successfully");
      } catch (err) {
        console.error("Error:", err);
        res.write("Error during authentication.");
      }

      res.end();
      return;
    }

    // --- Auth (/auth) ---
    if (url === "/auth") {
      // URL für Spotify-Login erstellen
      const authorizeURL = buildSpotifyAuthorizeUrl(
        clientId,
        REDIRECT_URI,
        spotifyScopes,
      );

      console.log(authorizeURL);

      res.writeHead(307, {
        Location: authorizeURL,
      });

      res.end();
      return;
    }

    // --- Default Page ---
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write('<a href="/auth"> Auth </a>');
    res.end();
  },
);

server.listen(port, hostname, () => {
  console.log(`Server running at ${SITE_URL}`);
});
