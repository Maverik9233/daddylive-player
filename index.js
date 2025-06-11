const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/proxy", async (req, res) => {
  const src = req.query.src;
  if (!src) return res.status(400).send("Missing ?src= parameter");

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.goto(src, { waitUntil: "networkidle2", timeout: 20000 });
    const html = await page.content();
    await browser.close();

    const match = html.match(/['"]([^'"]+\.m3u8[^'"]*)['"]/);
    if (match) {
      const m3u8 = match[1];
      return res.redirect(m3u8);
    } else {
      return res.status(404).send("Stream .m3u8 non trovato");
    }
  } catch (e) {
    console.error(e);
    res.status(500).send("Errore proxy");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server in ascolto su port", PORT));
