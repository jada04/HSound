# Node.js 20 içeren temel imaj
FROM node:20

# Gerekli sistem paketlerini kur: python3, pip ve ffmpeg
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg

# Pip'i python3 modülü üzerinden güncelle
# RUN python3 -m pip install --upgrade pip

# Çalışma dizinini oluştur
WORKDIR /app

# Node.js bağımlılıklarını yükle
COPY package*.json ./
RUN npm install

# Python bağımlılıklarını yüklemek için requirements.txt dosyasını kopyala
COPY requirements.txt ./
RUN python3 -m pip install -r requirements.txt

# Uygulama kaynak kodunu kopyala
COPY . .

# Uygulamayı çalıştır
CMD ["node", "index.js"]
