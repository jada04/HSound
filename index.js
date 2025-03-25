const express = require('express');
const ytSearch = require('yt-search');
const cors = require('cors');
const { exec } = require('child_process');



const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;



app.get('/search', async (req, res) => {
  const searchTerm = req.query.search;
  
  if (!searchTerm) {
    return res.status(400).json({ error: 'search query parameter is required' });
  }
  
  try {
    // YouTube'da arama yapılıyor
    const results = await ytSearch(searchTerm);

    
    // İlk 10 video bilgisi alınıyor (başlık, URL, thumbnail, süre)
    const videoDetails = results.videos.slice(0, 10).map(video => ({
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnail,
      duration: video.duration // örn: "3:45"
    }));
    
    res.json(videoDetails);
  } catch (error) {
    console.error('Error during YouTube search:', error);
    res.status(500).json({ error: 'An error occurred while searching YouTube' });
  }
});




app.get('/play', async (req, res) => {
  let url = req.query.url || '';

  if (!url) {
    return res.status(400).json({ error: 'URL gerekli' });
  }

  // Eğer URL 'http' ile başlamıyorsa, video ID olarak kabul edip tam URL'ye dönüştürüyoruz.
  if (!url.startsWith('http')) {
    url = `https://www.youtube.com/watch?v=${url}`;
  }

  
  exec('python py.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`Hata: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    // stdout üzerinden audio URL'sini alıyoruz
    const audioUrl = stdout.trim();
    console.log("Audio URL:", audioUrl);
  });



});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




