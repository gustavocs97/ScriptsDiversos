Entendi! O objetivo é ter um guia genérico para instalar **qualquer projeto PHP + MySQL** no Docker Swarm, usando **Traefik** para gerenciamento de domínio.  

Vou estruturar um passo a passo para que você possa usar **qualquer script do CodeCanyon** (ou outro) com a mesma base.  

---

# 📌 **Tutorial Completo: Implantando Projetos PHP + MySQL no Docker Swarm com Traefik**  

> **Objetivo:** Instalar qualquer aplicação PHP que utilize MySQL, permitindo que rode no Docker Swarm com **Traefik** para gerenciamento de domínios.

---

## **1️⃣ Estrutura de Pastas**
Cada projeto terá sua própria pasta dentro de:  
```
/home/ubuntu/TuaMarca/ProjetosVarios/{nome_do_projeto}
```

### **Exemplo de dois projetos rodando juntos:**
```
/home/ubuntu/TuaMarca/ProjetosVarios/chatpionserver-1
/home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2
```
🔹 Cada projeto tem **seus próprios arquivos da aplicação**, banco de dados e configurações.

---

## **2️⃣ Passo a Passo da Instalação**
### **1️⃣ Criar a Estrutura do Novo Projeto**
Se for um novo projeto, crie a pasta:
```bash
mkdir -p /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/{app,db_data,docker}
```
Isso cria:
```
novoprojeto2/
├── app/        # Aqui ficarão os arquivos do projeto (extraídos do ZIP)
├── db_data/    # Banco de dados MySQL
└── docker/     # Arquivos Docker (docker-compose.yml e Dockerfile)
```

---

### **2️⃣ Extrair os Arquivos do ZIP**
Se o arquivo ZIP já estiver na pasta `/home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/app`, extraia:
```bash
unzip /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/app/seu_projeto.zip -d /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/app/
```
Se precisar mover arquivos para a raiz, use:
```bash
mv /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/app/{nome_da_pasta_extraida}/* /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/app/
rm -rf /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/app/{nome_da_pasta_extraida}
```

---

### **3️⃣ Ajustar Permissões**
Depois de extrair, ajuste permissões:
```bash
sudo chown -R ubuntu:www-data /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/app
sudo chmod -R 775 /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/app
```
Caso o projeto use diretórios de cache, logs e uploads, execute:
```bash
sudo chmod -R 777 /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/app/application/config
sudo chmod -R 777 /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/app/application/cache
sudo chmod -R 777 /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/app/application/logs
sudo chmod -R 777 /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/app/upload
```

---

### **4️⃣ Criar o Arquivo `docker-compose.yml`**
Agora, crie o `docker-compose.yml` dentro de `/home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/docker/`:
```bash
nano /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/docker/docker-compose.yml
```
📌 **Conteúdo:**
```yaml
version: "3.9"

networks:
  minha_rede:
    external: true  # Rede do Traefik

volumes:
  novoprojeto2-db_data:
    name: novoprojeto2-db_data

services:
  novoprojeto2-mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootSenhaSegura123
      MYSQL_DATABASE: novoprojeto2db
      MYSQL_USER: novoprojeto2_admin
      MYSQL_PASSWORD: senhaSegura123
    command: --default-authentication-plugin=mysql_native_password --bind-address=0.0.0.0
    volumes:
      - /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/db_data:/var/lib/mysql
    networks:
      - minha_rede
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"

  novoprojeto2-php:
    image: php8.1personalizado:novoprojeto2
    volumes:
      - /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/app:/var/www/html
    environment:
      PROJECT_EMAIL: admin@tuamarca.com
      PROJECT_PASSWORD: senhaAdmin123
      DB_HOST: novoprojeto2-mysql
      DB_PORT: 3306
      DB_NAME: novoprojeto2db
      DB_USER: novoprojeto2_admin
      DB_PASS: senhaSegura123
    networks:
      - minha_rede
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.novoprojeto2.rule=Host(`novoprojeto2.tuamarca.com`)"
        - "traefik.http.services.novoprojeto2.loadbalancer.server.port=80"
        - "traefik.http.routers.novoprojeto2.tls=true"
        - "traefik.http.routers.novoprojeto2.tls.certresolver=default"
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
```

---

### **5️⃣ Criar o `Dockerfile`**
Crie o `Dockerfile` dentro da pasta `/home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/docker/`:
```bash
nano /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/docker/Dockerfile
```
📌 **Conteúdo:**
```dockerfile
FROM php:8.1-apache

RUN apt-get update \
  && apt-get install -y libmariadb-dev \
  && docker-php-ext-install mysqli pdo_mysql

RUN a2enmod rewrite remoteip

RUN echo 'ServerName novoprojeto2.tuamarca.com' >> /etc/apache2/apache2.conf \
  && echo 'RemoteIPHeader X-Forwarded-For' >> /etc/apache2/apache2.conf \
  && echo 'RemoteIPTrustedProxy 10.0.1.0/24' >> /etc/apache2/apache2.conf \
  && echo '<IfModule mod_setenvif.c>' >> /etc/apache2/apache2.conf \
  && echo '    SetEnvIf X-Forwarded-Proto "https" HTTPS=on' >> /etc/apache2/apache2.conf \
  && echo '</IfModule>' >> /etc/apache2/apache2.conf \
  && sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

CMD ["apache2-foreground"]
```

---

## **3️⃣ Implantação e Teste**
Agora, dentro da pasta do projeto:
```bash
cd /home/ubuntu/TuaMarca/ProjetosVarios/novoprojeto2/docker/
```

**1️⃣ Construir a imagem PHP personalizada**
```bash
docker build -t php8.1personalizado:novoprojeto2 .
```

**2️⃣ Implantar no Docker Swarm**
```bash
docker stack deploy -c docker-compose.yml novoprojeto2
```

**3️⃣ Verificar logs**
```bash
docker service logs novoprojeto2_novoprojeto2-php --tail 50
docker service logs novoprojeto2_novoprojeto2-mysql --tail 50
```

---

## **4️⃣ Conectar ao Banco de Dados**
Dentro do container PHP:
```bash
docker exec -it $(docker ps -qf "name=novoprojeto2-php") bash
apt-get update && apt-get install -y default-mysql-client
mysql -h novoprojeto2-mysql -u novoprojeto2_admin -p
```

---

## **5️⃣ Testar no Navegador**
Acesse:
```
https://novoprojeto2.tuamarca.com
```

Se houver página de instalação, configure **hostname = `novoprojeto2-mysql`**.

---

## **Conclusão**
✅ Esse modelo permite instalar **qualquer projeto PHP + MySQL** no Docker Swarm com **Traefik**.  
Basta **copiar a estrutura, trocar os nomes e rodar os comandos!** 🚀
