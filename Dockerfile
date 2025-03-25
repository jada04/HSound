# Temel olarak Node.js içeren bir imaj seçiyoruz
FROM node:20

# Python kurulumu için gerekli paketleri ekleyelim (Node.js imajında Python genellikle yüklü değil)
RUN apt-get update && apt-get install -y python3 python3-pip

# Uygulamanın çalışma dizinini oluşturuyoruz
WORKDIR /app

# Node.js bağımlılıklarını kopyala ve yükle
COPY package*.json ./
RUN npm install

# Python bağımlılıklarını yüklemek için requirements.txt dosyasını kopyala
COPY requirements.txt ./
RUN pip3 install -r requirements.txt

# Uygulama kaynak kodunu kopyala
COPY . .

# Uygulamayı çalıştırmak için komutu belirleyelim
CMD ["node", "index.js"]
