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
        return false; // Döngüden çık
      }
    });

    if (!videoUrl) {
      return res.status(404).json({ error: 'Stream URL bulunamadı' });
    }

    // Gelen video URL'sinin çalışıp çalışmadığını kontrol etmek için HEAD isteği gönderelim.
    let isWorking = false;
    let retryCount = 0;
    const maxRetries = 3;

    while (!isWorking && retryCount < maxRetries) {
      try {
        const headRes = await axios.head(videoUrl);
        if (headRes.status === 200) {
          isWorking = true;
        } else {
          retryCount++;
          console.log(`Retry ${retryCount}: Status ${headRes.status}`);
        }
      } catch (err) {
        retryCount++;
        console.log(`Retry ${retryCount}: Error in HEAD request: ${err.message}`);
      }
    }

    if (!isWorking) {
      // Eğer belirlenen denemelerde çalışmıyorsa, hata döndürüyoruz.
      return res.status(500).json({ error: 'Stream URL çalışmıyor, lütfen tekrar deneyin.' });
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
