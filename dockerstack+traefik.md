Aqui está um tutorial completo em formato `.md` para facilitar a configuração de um serviço genérico com Docker Compose e Traefik. Esse documento explica cada etapa e como ajustar o template para seu próprio serviço.

---

# Tutorial: Configurando um Serviço com Docker Compose e Traefik

Este tutorial ensina a configurar um serviço qualquer usando Docker Compose e Traefik como proxy reverso, com suporte a HTTPS e redirecionamento automático de HTTP para HTTPS. O objetivo é facilitar a adaptação para diferentes serviços, bastando alterar variáveis como o nome do serviço, a imagem e o domínio.

## Pré-requisitos

1. **Docker e Docker Compose** instalados.
2. **Rede externa Docker** já criada para uso do Traefik e dos serviços:
   ```bash
   docker network create minha_rede
   ```
3. **Domínio configurado** e apontado para o IP do servidor, se desejar acesso via HTTPS.

## Estrutura do Arquivo Docker Compose e Configuração do Traefik

### Arquivo `docker-compose.yml`

Este arquivo define:
- O serviço que você deseja executar.
- Configurações específicas para o Traefik atuar como proxy reverso e aplicar HTTPS.

### Configuração do `Traefik`

O Traefik é configurado com uma configuração dinâmica que inclui:
- Roteamento baseado em domínio/subdomínio.
- Certificado SSL automático (usando Let's Encrypt).
- Redirecionamento automático de HTTP para HTTPS.

---

## Passo 1: Estrutura Básica do `docker-compose.yml`

Aqui está a estrutura básica do arquivo `docker-compose.yml` para o seu serviço genérico.

```yaml
version: "3.7"

services:
  # Serviço genérico - Substitua `nome_servico` e `PORTA_INTERNA` conforme necessário
  nome_servico:
    image: NOME_DA_IMAGEM  # Exemplo: dpage/pgadmin4
    environment:
      - ENV_VAR1=valor1  # Substitua por variáveis específicas do serviço, se necessário
      - ENV_VAR2=valor2
    networks:
      - minha_rede  # Rede externa para comunicação com Traefik e outros serviços
    ports:
      - "PORTA_EXTERNA:PORTA_INTERNA"  # Exemplo: "8080:80"
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
    labels:
      - "traefik.enable=true"  # Habilita o serviço no Traefik
      - "traefik.http.routers.nome_servico-router.rule=Host(`subdominio.dominio.com`)"  # Exemplo: myapp.mydomain.com
      - "traefik.http.routers.nome_servico-router.entryPoints=web,websecure"
      - "traefik.http.routers.nome_servico-router.tls.certResolver=default"
      - "traefik.http.services.nome_servico-service.loadbalancer.server.port=PORTA_INTERNA"  # Porta interna do contêiner
      - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"  # Redireciona HTTP para HTTPS

networks:
  minha_rede:
    external: true
    name: minha_rede
```

### Explicação das Configurações

- **Substitua `nome_servico`**: Este é o identificador do seu serviço. Escolha um nome representativo.
- **Imagem do Serviço (`NOME_DA_IMAGEM`)**: A imagem Docker que o serviço usará (ex.: `nginx`, `dpage/pgadmin4`, etc.).
- **Variáveis de Ambiente (`ENV_VAR1`, `ENV_VAR2`)**: Variáveis específicas do serviço. Adicione ou remova conforme necessário.
- **Portas (`PORTA_EXTERNA:PORTA_INTERNA`)**: Mapeie as portas conforme seu serviço. `PORTA_EXTERNA` é a porta do host; `PORTA_INTERNA` é a porta interna do serviço.
- **Traefik Labels**:
  - `traefik.http.routers.nome_servico-router.rule=Host("subdominio.dominio.com")`: Substitua `subdominio.dominio.com` pelo domínio ou subdomínio do seu serviço.
  - `traefik.http.routers.nome_servico-router.entryPoints`: Define as entradas (HTTP e HTTPS).
  - `traefik.http.routers.nome_servico-router.tls.certResolver=default`: Gera certificado SSL automaticamente com o resolver configurado.
  - `traefik.http.services.nome_servico-service.loadbalancer.server.port`: Porta interna do serviço para o Traefik rotear.

---

## Passo 2: Configuração Dinâmica do Traefik

Para permitir o roteamento e redirecionamento de HTTP para HTTPS, adicione a configuração dinâmica para o Traefik. Você pode incluir diretamente no `docker-compose.yml`, mas para modularidade, pode criar um arquivo `dynamic_conf.yml`:

```yaml
http:
  routers:
    nome_servico-router:
      rule: "Host(`subdominio.dominio.com`)"  # Substitua pelo subdomínio e domínio desejado
      entryPoints:
        - web
        - websecure
      tls:
        certResolver: default  # Certificado SSL automático (ACME)
      middlewares:
        - redirect-to-https  # Middleware para redirecionar HTTP para HTTPS
      service: nome_servico-service

  services:
    nome_servico-service:
      loadBalancer:
        servers:
          - url: "http://nome_servico:PORTA_INTERNA"  # Substitua `PORTA_INTERNA` pela porta interna do serviço

  middlewares:
    redirect-to-https:
      redirectScheme:
        scheme: https
```

### Explicação das Configurações Dinâmicas do Traefik

1. **Router**:
   - **Nome do Router**: Substitua `nome_servico-router` pelo nome do seu serviço.
   - **Regra (`rule`)**: Configure `subdominio.dominio.com` com o domínio ou subdomínio desejado para acessar o serviço.
   - **Certificado SSL**: `certResolver: default` usa o resolver configurado no Traefik para emitir certificados SSL automaticamente (via Let's Encrypt).

2. **Service**:
   - **LoadBalancer**: Defina `nome_servico` e `PORTA_INTERNA` para o nome e porta interna do contêiner, respectivamente. Isso permite que o Traefik direcione o tráfego para o serviço correto.

3. **Middleware**:
   - **Redirecionamento HTTPS**: `redirect-to-https` redireciona automaticamente o tráfego HTTP para HTTPS, garantindo a segurança da conexão.

---

## Passo 3: Executar o Docker Compose

Para iniciar o serviço, execute o comando:

```bash
docker-compose up -d
```

Esse comando:
- Inicia o contêiner do seu serviço.
- Configura o Traefik para atuar como proxy reverso com HTTPS.
- Expõe o serviço no domínio/subdomínio configurado.

---

## Passo 4: Teste a Configuração

1. Acesse o serviço usando o domínio ou subdomínio configurado (ex.: `https://subdominio.dominio.com`).
2. Verifique se o Traefik aplicou corretamente o redirecionamento e o certificado SSL.

---


### Estrutura dos Arquivos

Para rodar o `pgAdmin` com Traefik, precisamos de dois arquivos:

1. **docker-compose.yml**: Define o serviço `pgAdmin`, incluindo configurações de rede, variáveis de ambiente, portas e labels específicas para o Traefik.
2. **dynamic_conf.yml**: Configuração dinâmica de Traefik, especificando regras de roteamento, middlewares e serviços.



## Exemplo de Serviço com `pgAdmin`

Para configurar o `pgAdmin` usando este template, o `docker-compose.yml` ficaria assim:

```yaml
version: "3.7"

services:
  pgadmin:
    image: dpage/pgadmin4
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@example.com
      - PGADMIN_DEFAULT_PASSWORD=securepassword
    networks:
      - minha_rede
    ports:
      - "8080:80"
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.pgadmin-router.rule=Host(`pgadmin.example.com`)"
      - "traefik.http.routers.pgadmin-router.entryPoints=web,websecure"
      - "traefik.http.routers.pgadmin-router.tls.certResolver=default"
      - "traefik.http.services.pgadmin-service.loadbalancer.server.port=80"
      - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"

networks:
  minha_rede:
    external: true
    name: minha_rede
```








#### Explicação:

- **`services.pgadmin`**: Define o contêiner `pgAdmin`.
  - **`image`**: A imagem `dpage/pgadmin4` é usada para criar o serviço.
  - **`environment`**: Configura variáveis de ambiente para o pgAdmin. Altere para seu email e senha.
  - **`networks`**: Conecta o `pgAdmin` à rede `minha_rede` para comunicação com o Traefik.
  - **`ports`**: Expõe a porta interna `80` do `pgAdmin` na porta `8080` do host.
  - **`deploy`**: Define o modo `replicated` e aloca limites de CPU e memória.
  - **`labels`**: Configurações específicas para o Traefik:
    - `"traefik.enable=true"`: Habilita o serviço no Traefik.
    - `"traefik.http.routers.pgadmin-router.rule=Host('pgadmin.example.com')"`: Define que o serviço responde a `pgadmin.example.com`.
    - `"traefik.http.routers.pgadmin-router.entryPoints=web,websecure"`: Configura o roteador para HTTP e HTTPS.
    - `"traefik.http.routers.pgadmin-router.tls.certResolver=default"`: Solicita certificados SSL via Let's Encrypt.
    - `"traefik.http.services.pgadmin-service.loadbalancer.server.port=80"`: Configura o Traefik para rotear o tráfego para a porta `80` interna do `pgAdmin`.
    - `"traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"`: Redireciona HTTP para HTTPS.











## Exemplo de Serviço com `pgAdmin` exemplo do arquivo dynamic_conf.yml completo para o serviço pgAdmin, usando as configurações do tutorial.


```yaml
http:
  routers:
    pgadmin-router:
      rule: "Host(`pgadmin.example.com`)"  # Substitua com o domínio/subdomínio desejado
      entryPoints:
        - web
        - websecure
      tls:
        certResolver: default  # Resolver SSL para certificado HTTPS
      middlewares:
        - redirect-to-https  # Middleware para redirecionar HTTP para HTTPS
      service: pgadmin-service

  services:
    pgadmin-service:
      loadBalancer:
        servers:
          - url: "http://pgadmin:80"  # Porta interna do serviço pgAdmin

  middlewares:
    redirect-to-https:
      redirectScheme:
        scheme: https
```

### Explicação:

- **Router (`pgadmin-router`)**:
  - **`rule`**: Define a regra de domínio/subdomínio para acessar o serviço.
  - **`entryPoints`**: Define os pontos de entrada para HTTP (`web`) e HTTPS (`websecure`).
  - **`tls`**: Configura o Traefik para solicitar um certificado SSL.
  - **`middlewares`**: Inclui o middleware de redirecionamento para HTTPS.
  - **`service`**: Roteia o tráfego para o `pgadmin-service`.

- **Service (`pgadmin-service`)**:
  - **`url`**: Define o URL interno para o serviço `pgAdmin`, acessando-o pela porta 80.

- **Middlewares**:
  - **`redirect-to-https`**: Força o redirecionamento de HTTP para HTTPS para garantir que todas as conexões sejam seguras.

Esse exemplo de `dynamic_conf.yml` pode ser adaptado para outros serviços, alterando o nome do serviço, domínio e portas conforme necessário.


---

## Conclusão

Esse template facilita a configuração de serviços usando Docker e Traefik com suporte para HTTPS. Basta ajustar as variáveis principais no `docker-compose.yml` e no `dynamic_conf.yml` para adaptar a qualquer serviço que precise de um domínio, SSL, e proxy reverso.

--- 

Este tutorial fornece uma base sólida para usar Docker Compose e Traefik em diferentes cenários, e cada seção foi pensada para que você possa adaptar a qualquer necessidade específica do seu serviço.
