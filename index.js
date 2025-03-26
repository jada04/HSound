
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 3000;

app.get('/getStreamUrl', async (req, res) => {
  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'videoId gerekli' });
  }

  const invidiousUrl = `https://inv.nadeko.net/watch?v=${videoId}`;

  try {
    const response = await axios.get(invidiousUrl);
    const $ = cheerio.load(response.data);

    let videoUrl = null;

    $('source').each((i, el) => {
      const src = $(el).attr('src');
      const type = $(el).attr('type');

      if (type && type.includes('video/mp4') && src.includes('latest_version')) {
        videoUrl = src;
        return false; // break
      }
    });

    if (!videoUrl) {
      return res.status(404).json({ error: 'Stream URL bulunamadı' });
    }

    return res.json({ videoUrl });
  } catch (err) {
    console.error('Hata:', err.message);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Invidious Stream API http://localhost:${PORT}`);
});
