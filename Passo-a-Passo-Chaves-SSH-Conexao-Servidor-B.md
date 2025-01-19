# Introdução ao Tutorial de Configuração SSH com Chave Pública

A autenticação por chave SSH é uma das formas mais seguras e recomendadas de acessar servidores remotamente. Ela elimina a necessidade de senhas durante o login, reduzindo o risco de ataques de força bruta e outros tipos de vulnerabilidades associadas ao uso de senhas.

Este tutorial guia você na configuração de acesso SSH utilizando chaves públicas e privadas, desde a geração no servidor até a autenticação no cliente. Também inclui dicas importantes para evitar problemas de acesso e recomendações de segurança.

⚠️ **Nota Importante:**  
Tenha cuidado ao configurar seu servidor para acesso exclusivo por chave pública. Antes de desativar a autenticação por senha, certifique-se de que:  
- A conexão com a chave está funcionando corretamente.  
- Você mantém backups das chaves privadas em local seguro.  
- Existe um método alternativo de recuperação, como um console web oferecido pela sua hospedagem.

Vamos começar! 🚀



**Observações importantes:**
- **MUDE** `127.0.0.1` pelo IP desejado (público, interno ou do Tailscale).
- **MUDE** `ubuntu` pelo usuário desejado, como `seuusuario`.
- **MUDE** `conecaoautorizadaB` pelo nome de sua preferência.

---

### **1. Preparação no Servidor B**

#### **1.1. Gerar as Chaves SSH no Servidor B**
1. Acesse o Servidor B como `root`:
   ```bash
   ssh root@127.0.0.1
   ```

2. Garanta que o diretório `.ssh` existe:
   ```bash
   mkdir -p /root/.ssh
   chmod 700 /root/.ssh
   ```

3. Gere o par de chaves SSH no Servidor B:
   ```bash
   ssh-keygen -t rsa -b 4096 -C "root@conecaoautorizadaB"
   ```
   - Quando solicitado, salve a chave no arquivo `/root/.ssh/conecaoautorizadaB` (ou pressione Enter para o caminho sugerido).
   - Não insira senha (pressione Enter para uma passphrase vazia).

4. Confirme que os arquivos foram gerados:
   ```bash
   ls -l /root/.ssh/
   ```
   Você verá algo como:
   ```plaintext
   -rw------- 1 root root 3381 jan 19 21:01 conecaoautorizadaB
   -rw-r--r-- 1 root root  739 jan 19 21:01 conecaoautorizadaB.pub
   ```

#### **1.2. Adicionar a Chave Pública ao `authorized_keys`**
1. Adicione a chave pública `conecaoautorizadaB.pub` ao arquivo `authorized_keys`:
   ```bash
   cat /root/.ssh/conecaoautorizadaB.pub >> /root/.ssh/authorized_keys
   ```

2. Verifique o conteúdo do arquivo `authorized_keys`:
   ```bash
   cat /root/.ssh/authorized_keys
   ```

3. Ajuste as permissões para maior segurança:
   ```bash
   chmod 600 /root/.ssh/authorized_keys
   chmod 700 /root/.ssh
   ```

---

### **2. Configuração do SSH no Servidor B**

1. Edite o arquivo de configuração do SSH:
   ```bash
   nano /etc/ssh/sshd_config
   ```

2. Certifique-se de que estas linhas estão configuradas:
   ```plaintext
   PubkeyAuthentication yes
   PermitRootLogin prohibit-password
   PasswordAuthentication yes
   ```

3. Reinicie o serviço SSH para aplicar as mudanças:
   ```bash
   systemctl restart ssh
   ```




### **Atenção Importante Sobre o `PasswordAuthentication`**

- **`PasswordAuthentication yes` deve permanecer ativado inicialmente.**
  Isso garante que você possa usar a senha para acessar o servidor caso algo dê errado durante a configuração da chave pública.

- ⚠️ **Risco de Bloqueio Permanente:**
  Se você desativar o `PasswordAuthentication` (definindo como `no`) e perder a chave privada, **o acesso ao servidor será bloqueado para sempre.**  
  Antes de desativar este parâmetro:
  - **Certifique-se de que:**
    - A autenticação por chave pública está funcionando corretamente.
    - Você possui uma cópia segura da chave privada.
    - Sua hospedagem oferece algum método de recuperação, como um console web.
    - Um usuário de emergência está configurado com senha (opcional).


---

### **3. Preparação no macOS**

#### **3.1. Garantir que o Diretório `.ssh` Existe**
1. No macOS, abra o terminal e crie o diretório `.ssh` (se não existir):
   ```bash
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   ```

2. Verifique o conteúdo do diretório `.ssh`:
   ```bash
   ls -l ~/.ssh
   ```

   Saída típica:
   ```plaintext
   total 0
   ```

---

### **4. Configurar a Chave Privada no macOS**

1. **No Servidor B**, exiba o conteúdo da chave privada:
   ```bash
   cat /root/.ssh/conecaoautorizadaB
   ```

2. **No macOS**, crie o arquivo da chave privada:
   ```bash
   nano ~/.ssh/conecaoautorizadaB
   ```

3. **Cole o conteúdo da chave privada** copiado do Servidor B no arquivo.

4. Ajuste as permissões da chave privada no macOS:
   ```bash
   chmod 600 ~/.ssh/conecaoautorizadaB
   ```

5. Verifique se o arquivo foi criado corretamente:
   ```bash
   ls -l ~/.ssh/conecaoautorizadaB
   ```
   Saída esperada:
   ```plaintext
   -rw------- 1 ubuntu staff 3381 jan 19 21:01 /Users/ubuntu/.ssh/conecaoautorizadaB
   ```

---

### **5. Testar a Conexão**

1. No macOS, teste o acesso ao Servidor B com a chave privada:
   ```bash
   ssh -i ~/.ssh/conecaoautorizadaB root@127.0.0.1
   ```
   - Substitua `127.0.0.1` pelo IP do Servidor B.

2. Se funcionar, você será conectado sem a necessidade de senha.

---

### **6. Depuração (se necessário)**

Se a conexão falhar, use o modo verbose para identificar o problema:
```bash
ssh -v -i ~/.ssh/conecaoautorizadaB root@127.0.0.1
```

- **Mensagens importantes a observar:**
  - **`Authentication succeeded (publickey)`**: Conexão bem-sucedida.
  - **`Permission denied (publickey,password)`**: A chave pública não está configurada corretamente no servidor.

- **Soluções comuns:**
  1. Certifique-se de que a chave pública foi adicionada ao `authorized_keys` no Servidor B:
     ```bash
     cat /root/.ssh/authorized_keys
     ```
     Verifique se contém algo como:
     ```plaintext
     ssh-rsa AAAAB3Nza... root@conecaoautorizadaB
     ```

  2. Verifique as permissões no Servidor B:
     ```bash
     chmod 700 /root/.ssh
     chmod 600 /root/.ssh/authorized_keys
     ```

  3. Garanta que o serviço SSH está ativo:
     ```bash
     systemctl status ssh
     ```

---

### **7. Configurar no Termius ou Similar (Opcional)**

1. Abra o Termius e vá para **Settings** > **Keys**.
2. Adicione a chave privada:
   - Clique em **New Key**.
   - Escolha **Paste** e cole o conteúdo da chave privada (`~/.ssh/conecaoautorizadaB` no macOS).
   - Salve com um nome descritivo, como `ServidorB`.

3. Configure o host do Servidor B:
   - Vá para **Hosts** > **New Host**.
   - Adicione o IP ou hostname do Servidor B (ex.: `127.0.0.1`).
   - Em **Credentials**, escolha a chave privada recém-adicionada.

4. Teste a conexão diretamente no Termius.

---

Seguindo esses passos **do zero**, você terá acesso ao Servidor B configurado corretamente com autenticação por chave SSH. 🚀
