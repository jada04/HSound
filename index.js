const express = require('express');
const ytSearch = require('yt-search');
const youtubedl = require('youtube-dl-exec');


const app = express();
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
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'url query parameter is required' });
  }

  try {
    const output = await youtubedl(url, {
      dumpJson: true,
      format: 'bestaudio',
      skipDownload: true
    });

    const audioUrl = output.url || null;
    const thumbnailUrl = output.thumbnail || null;
    const title = output.title || null;
    const durationSeconds = output.duration || 0;
    const durationMinutes = (durationSeconds / 60).toFixed(2);

    res.json({
      title,
      audioUrl,
      thumbnailUrl,
      duration: durationMinutes
    });

    // İstersen konsola da yazdırmaya devam edebilirsin:
    console.log({
      title,
      audioUrl,
      thumbnailUrl,
      duration: durationMinutes
    });

  } catch (err) {
    console.error('Video bilgisi alınırken hata oluştu:', err);
    res.status(500).json({ error: 'Video bilgisi alınamadı.' });
  }
});





app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
