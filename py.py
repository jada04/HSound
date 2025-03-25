import yt_dlp

def get_audio_url(video_url):
    ydl_opts = {
        'format': 'bestaudio/best',
        'skip_download': True,
        'quiet': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=False)
        # info içinde birçok detay var. Direkt audio URL'sini almak için:
        audio_url = info.get('url')
        return audio_url

video_url = 'https://www.youtube.com/watch?v=NOyrTRdOM3s'
audio_url = get_audio_url(video_url)
print(audio_url)
