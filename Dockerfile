FROM node:18-bullseye

# Sistemi güncelle ve python-is-python3 paketini yükle.
RUN apt-get update && apt-get install -y python-is-python3

WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle (development bağımlılıklarını atlamak için --omit=dev kullanabilirsiniz)
RUN npm ci --omit=dev

# Projedeki tüm dosyaları kopyala
COPY . .

# Uygulamayı başlat (örneğin, index.js dosyası giriş noktasıysa)
CMD ["node", "index.js"]
