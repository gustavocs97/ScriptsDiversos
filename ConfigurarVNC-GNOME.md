### Tutorial: Como Configurar e Usar o Servidor VNC no Linux com GNOME

Este tutorial orienta na instalação, configuração e execução de um servidor VNC em um ambiente Linux, utilizando o GNOME como ambiente gráfico.

---

### **1. Pré-requisitos**
- Acesso ao servidor Linux com permissões de superusuário.
- Conexão SSH ou acesso direto ao terminal do servidor.

---

### **2. Instalar os pacotes necessários**
1. **Atualize os pacotes do sistema**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Instale o GNOME e o servidor VNC (TigerVNC)**:
   ```bash
   sudo apt install gnome-session gnome-shell tigervnc-standalone-server tigervnc-common -y
   ```

---

### **3. Criar um usuário dedicado (opcional)**
Para maior segurança, crie um usuário dedicado ao VNC:

```bash
sudo adduser gustavovnc
```

Siga as instruções para definir senha e informações do usuário.

---

### **4. Configurar o VNC**
1. **Acesse a conta do usuário**:
   ```bash
   su - gustavovnc
   ```

2. **Crie a senha do VNC**:
   Inicie o VNC pela primeira vez para criar a senha:
   ```bash
   vncpasswd
   ```
   - Defina uma senha para conexão VNC.
   - **Opcional**: Se não precisar de acesso somente para visualização, escolha **"n"** na segunda pergunta.

3. **Configure o ambiente gráfico**:
   Edite o arquivo de inicialização do VNC:
   ```bash
   nano ~/.vnc/xstartup
   ```
   Configure-o como abaixo:
   ```bash
   #!/bin/sh

   # Iniciar GNOME como ambiente gráfico
   export XDG_SESSION_TYPE=x11
   export XDG_CURRENT_DESKTOP=GNOME
   export DESKTOP_SESSION=gnome

   # Iniciar o GNOME
   dbus-launch --exit-with-session gnome-session &

   # Tentar iniciar um terminal simples se GNOME falhar
   [ -x /usr/bin/xterm ] && exec /usr/bin/xterm
   ```

4. **Torne o script executável**:
   ```bash
   chmod +x ~/.vnc/xstartup
   ```

---

### **5. Iniciar o Servidor VNC**
1. **Inicie o servidor com a resolução desejada**:
   ```bash
   vncserver -geometry 1280x720 -depth 32 :2 -localhost no
   ```

   - `-geometry 1280x720`: Define a resolução da tela.
   - `-depth 32`: Configura a profundidade de cores (32 bits para cores completas).
   - `:2`: Configura o display como `:2` (porta 5902).

   **Exemplo de saída:**
   ```
   New Xtigervnc server 'proxmox.tuamarca.com:2 (gustavovnc)' on port 5902 for display :2.
   ```

2. **Verifique se o servidor está rodando**:
   ```bash
   ss -tuln | grep 5902
   ```

---

### **6. Conectar ao Servidor VNC**
Use um cliente VNC como **TigerVNC Viewer**, **RealVNC**, ou qualquer outro, para conectar ao servidor.

1. Insira as informações de conexão no cliente:
   - Endereço: `IP_do_Servidor:2` (ou `IP_do_Servidor:5902`).
   - Senha: a senha configurada no passo anterior.

2. Conecte e utilize o GNOME remotamente.

---

### **7. Gerenciar o Servidor VNC**
- **Parar o servidor VNC**:
  ```bash
  vncserver -kill :2
  ```

- **Reiniciar o servidor com configurações atualizadas**:
  ```bash
  vncserver -geometry 1920x1080 -depth 32 :2 -localhost no
  ```

---

### **8. Segurança Adicional (Opcional)**
Configure um túnel SSH para proteger a conexão VNC:
```bash
ssh -L 5902:localhost:5902 usuario@IP_do_Servidor
```
Conecte no cliente VNC para `localhost:2`.

---

### **9. Resolução de Problemas**
- **Erro ao iniciar o GNOME no VNC**: Verifique o arquivo `~/.vnc/xstartup` e o ambiente gráfico instalado.
- **Erro de permissões**: Confirme que o script `~/.vnc/xstartup` está executável (`chmod +x`).

---

Pronto! Agora você tem um servidor VNC configurado com o GNOME e pode acessar remotamente com cores completas e alta resolução.
