const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 3000;

// Belirli sayıda denemede uygun streaming URL'sini almaya çalışır
const getValidStreamUrl = async (videoId, maxAttempts = 5) => {
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt++;
    console.log(`Deneme ${attempt}`);
    try {
      // Invidious sayfasını çekiyoruz
      const response = await axios.get(`https://inv.nadeko.net/watch?v=${videoId}`);
      const $ = cheerio.load(response.data);
      let videoUrl = null;
      $('source').each((i, el) => {
        const src = $(el).attr('src');
        const type = $(el).attr('type');
        if (type && type.includes('video/mp4') && src.includes('latest_version')) {
          videoUrl = src;
          return false; // döngüden çık
        }
      });

      if (!videoUrl) {
        console.log(`Deneme ${attempt}: Video URL bulunamadı.`);
        continue; // Denemeyi tekrarla
      }

      // URL'nin streaming verebilip vermediğini kontrol etmek için range isteği gönderiyoruz
      let isWorking = false;
      let retryCount = 0;
      const maxRetries = 3;
      while (!isWorking && retryCount < maxRetries) {
        try {
          const rangeRes = await axios.get(videoUrl, {
            headers: { Range: 'bytes=0-1' },
            responseType: 'arraybuffer'
          });
          if (rangeRes.status === 206 || rangeRes.status === 200) {
            isWorking = true;
          } else {
            retryCount++;
            console.log(`Deneme ${attempt}, Retry ${retryCount}: Status ${rangeRes.status}`);
          }
        } catch (err) {
          retryCount++;
          console.log(`Deneme ${attempt}, Retry ${retryCount}: Error ${err.message}`);
        }
      }

      if (isWorking) {
        console.log(`Deneme ${attempt}: Uygun video URL bulundu: ${videoUrl}`);
        return videoUrl;
      } else {
        console.log(`Deneme ${attempt}: Video URL range kontrolünden geçemedi.`);
      }
    } catch (err) {
      console.log(`Deneme ${attempt}: Hata ${err.message}`);
    }
  }
  return null;
};

app.get('/getStreamUrl', async (req, res) => {
  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'videoId gerekli' });
  }

  const validUrl = await getValidStreamUrl(videoId);
  if (!validUrl) {
    return res.status(500).json({ error: 'Stream URL çalışmıyor, lütfen tekrar deneyin.' });
  }
  return res.json({ videoUrl: validUrl });
});

app.listen(PORT, () => {
  console.log(`✅ Invidious Stream API http://localhost:${PORT}`);
});
