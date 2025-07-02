const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use((req,res,next)=> {console.log(`${req.method} ${req.url}`);
next();
});
let token = "";
let tokenExpires = 0;

async function getAccessToken() {
  const now = Date.now();
  if (token && now < tokenExpires) return token;

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: "Basic " + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  token = response.data.access_token;
  tokenExpires = now + response.data.expires_in * 1000;
  return token;
}

// Route 1: Search artist
app.get("/search", async (req, res) => {
  const { artist } = req.query;
  const accessToken = await getAccessToken();

  const result = await axios.get(`https://api.spotify.com/v1/search?q=${artist}&type=artist`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  res.json(result.data);
});

// Route 2: Get albums by artist ID
app.get("/albums", async (req, res) => {
  const { artistId } = req.query;
  const accessToken = await getAccessToken();

  const result = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums?limit=5`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  res.json(result.data);
});

// Route 3: Get top tracks by artist ID
app.get("/top-tracks", async (req, res) => {
  const { artistId } = req.query;
  const accessToken = await getAccessToken();

  const result = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=IN`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  res.json(result.data);
});

app.listen(3000, () => {
  console.log("✅ Backend server running on http://localhost:3000");
});