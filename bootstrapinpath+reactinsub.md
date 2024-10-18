// Objetivo
// Configurar um servidor para servir um site estático (ex: Bootstrap Studio) no domínio principal e uma aplicação React no subcaminho /app.

---

# Tutorial: Configuração de Site Bootstrap no Domínio Principal e Aplicação React em Subcaminho

## Objetivo
Configurar um servidor para servir um site estático (ex: Bootstrap Studio) no domínio principal e uma aplicação React no subcaminho `/app`.

## Pré-requisitos
- Site estático exportado do Bootstrap Studio ou qualquer outro gerador de sites estáticos.
- Aplicação React já buildada.
- Servidor web utilizando **Nginx**.

### 1. Estrutura dos Diretórios

A organização dos arquivos no servidor deve ser a seguinte:

```
/var/www/html/
  ├── static-site/  # Arquivos do site estático
  └── react-app/    # Build da aplicação React
```

- O site estático deve estar no diretório `static-site/`.
- A aplicação React deve estar no diretório `react-app/`.

### 2. Configurar o Nginx

Edite o arquivo de configuração do Nginx para o seu domínio, por exemplo:

```bash
sudo nano /etc/nginx/sites-available/meusite.com
```

Adicione as seguintes configurações para servir o site estático no domínio principal e o React no subcaminho `/app`:

```nginx
server {
    listen 80;
    server_name meusite.com www.meusite.com;

    # Servir o site estático (ex: Bootstrap Studio) no domínio principal
    root /var/www/html/static-site;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }

    # Servir a aplicação React no subcaminho /app
    location /app/ {
        alias /var/www/html/react-app/;
        try_files $uri /index.html;
    }
}
```

### 3. Reiniciar o Nginx

Após salvar as alterações no arquivo de configuração, reinicie o Nginx para aplicar as mudanças:

```bash
sudo systemctl restart nginx
```

### 4. Testar no Navegador

- O **site estático** estará acessível no domínio principal: `http://meusite.com`.
- A **aplicação React** estará acessível no subcaminho: `http://meusite.com/app`.

---

Este é um exemplo genérico para configuração de um servidor Nginx com um site estático no domínio principal e uma aplicação React em um subdiretório. Se o servidor web utilizado for diferente, a configuração pode variar um pouco, mas a lógica permanece a mesma.
