Aqui está um passo-a-passo atualizado e detalhado para configurar o **pyenv** corretamente e garantir que o **OpenWebUI** funcione sem problemas:

---

### **1. Verificar e Reinstalar o `pyenv`**

1. **Remova qualquer instalação antiga do `pyenv`:**
   ```bash
   rm -rf ~/.pyenv
   ```

2. **Instale o `pyenv` novamente usando o script oficial:**
   ```bash
   curl https://pyenv.run | bash
   ```

3. **Adicione o `pyenv` ao ambiente atual do shell:**
   Edite o arquivo de configuração do shell (`~/.bashrc` ou `~/.zshrc`):
   ```bash
   nano ~/.bashrc
   ```
   Adicione estas linhas ao final do arquivo:
   ```bash
   export PATH="$HOME/.pyenv/bin:$PATH"
   eval "$(pyenv init --path)"
   eval "$(pyenv init -)"
   ```

   **Recarregue o shell:**
   ```bash
   source ~/.bashrc
   ```

4. **Verifique a instalação do `pyenv`:**
   ```bash
   pyenv --version
   ```
   Isso deve retornar algo como `pyenv 2.x.x`.

---

### **2. Instalar e Configurar a Versão do Python**

1. **Liste as versões disponíveis do Python:**
   ```bash
   pyenv install --list
   ```

2. **Instale a versão necessária (ex: Python 3.11.0):**
   ```bash
   pyenv install 3.11.0
   ```

3. **Defina a versão do Python para o projeto (ou globalmente):**
   - **Para o ambiente global:**
     ```bash
     pyenv global 3.11.0
     ```
   - **Para o diretório do OpenWebUI:**
     Navegue até o diretório do OpenWebUI:
     ```bash
     cd /path/to/openwebui
     ```
     Defina a versão local:
     ```bash
     pyenv local 3.11.0
     ```

4. **Verifique a versão ativa do Python:**
   ```bash
   python --version
   ```
   O retorno deve ser `Python 3.11.0`.

---

### **3. Instalar e Configurar o OpenWebUI**

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/Open-WebUI/open-webui.git
   cd open-webui
   ```

2. **Criar um ambiente virtual:**
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

3. **Instalar dependências:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Iniciar o OpenWebUI:**
   ```bash
   open-webui serve
   ```

   Se precisar rodar com `sudo`, configure o ambiente corretamente:
   ```bash
   sudo env "PATH=$PATH" open-webui serve
   ```

---

### **4. Verificar o Funcionamento**

- Acesse o OpenWebUI pelo navegador em:
  ```
  http://localhost:8080
  ```

- Se a porta 8080 já estiver ocupada, use outra porta:
  ```bash
  PORT=8000 open-webui serve
  ```

---

### **5. Configuração Automática com `systemd` (Opcional)**

1. **Crie um arquivo de serviço:**
   ```bash
   sudo nano /etc/systemd/system/open-webui.service
   ```

2. **Adicione esta configuração:**
   ```ini
   [Unit]
   Description=OpenWebUI Service
   After=network.target

   [Service]
   User=your-username
   Group=your-group
   WorkingDirectory=/path/to/open-webui
   ExecStart=/path/to/open-webui/venv/bin/open-webui serve
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

   Substitua `your-username`, `your-group` e `/path/to/open-webui` com as informações reais do seu sistema.

3. **Ativar e iniciar o serviço:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable open-webui
   sudo systemctl start open-webui
   ```

4. **Verifique o status do serviço:**
   ```bash
   sudo systemctl status open-webui
   ```

---

### **6. Solução de Problemas**

- **Erro: `command not found` para `open-webui`:**
  Certifique-se de que o ambiente virtual está ativado e que o comando foi instalado com o `pip`.

- **Erro: `sudo export` não funciona:**
  Use o comando `sudo env` para passar as variáveis de ambiente.

- **Erro: Permissões ou dependências faltando:**
  Sempre execute os comandos no ambiente virtual ou confira se o `pyenv` está configurado corretamente.

Pronto! Agora o OpenWebUI deve estar configurado e rodando sem problemas. 🚀
