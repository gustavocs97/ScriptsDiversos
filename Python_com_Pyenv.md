# **📌 Mega Tutorial: Gerenciando Versões do Python com Pyenv (Mac, Windows, Linux)**  

## **🔎 O que é Pyenv e por que usar?**  
O **Pyenv** permite instalar e alternar entre diferentes versões do Python sem bagunçar seu sistema.  
Isso é útil porque:  
✅ Você pode testar códigos em versões diferentes do Python.  
✅ Mantém a instalação do **sistema limpa**, sem interferências.  
✅ Facilita o uso de **ambientes virtuais** para projetos.  

Sem Pyenv, você pode acabar com múltiplas versões do Python misturadas, sem saber qual está rodando. 😵  

---

## **🛠️ Como instalar o Pyenv**  

### **🖥️ No macOS**  
1. **Instale o Homebrew (se ainda não tiver)**  
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. **Instale o Pyenv**  
   ```bash
   brew install pyenv
   ```
3. **Configure o terminal** (Zsh ou Bash)  
   ```bash
   echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
   echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
   echo 'eval "$(pyenv init --path)"' >> ~/.zshrc
   source ~/.zshrc
   ```

---

### **🖥️ No Linux (Ubuntu e Debian-based)**  
1. **Instale dependências**  
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y build-essential libssl-dev zlib1g-dev libbz2-dev \
   libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev xz-utils tk-dev libxml2-dev \
   libxmlsec1-dev libffi-dev liblzma-dev
   ```
2. **Instale o Pyenv**  
   ```bash
   curl https://pyenv.run | bash
   ```
3. **Configure o terminal**  
   ```bash
   echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
   echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
   echo 'eval "$(pyenv init --path)"' >> ~/.bashrc
   source ~/.bashrc
   ```

---

### **🖥️ No Windows (via pyenv-win)**  
1. **Baixe e instale o Pyenv-win**  
   ```powershell
   git clone https://github.com/pyenv-win/pyenv-win.git $HOME/.pyenv
   ```
2. **Adicione ao PATH**  
   ```powershell
   [System.Environment]::SetEnvironmentVariable("PYENV", "$HOME\.pyenv", [System.EnvironmentVariableTarget]::User)
   [System.Environment]::SetEnvironmentVariable("Path", "$HOME\.pyenv\bin;$HOME\.pyenv\shims;" + [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User), [System.EnvironmentVariableTarget]::User)
   ```
3. **Feche e reabra o terminal**, então teste:  
   ```powershell
   pyenv --version
   ```

---

## **🔍 Como usar o Pyenv**  

### **📌 1. Ver versões instaladas**
```bash
pyenv versions
```

### **📌 2. Listar versões disponíveis para instalação**
```bash
pyenv install --list
```

### **📌 3. Instalar uma versão específica**
```bash
pyenv install 3.12.0
```

### **📌 4. Definir uma versão como padrão global**
```bash
pyenv global 3.12.0
```
Isso altera a versão **para todo o sistema** (exceto dentro de projetos específicos).  

### **📌 5. Usar uma versão apenas nesta sessão**
```bash
pyenv shell 3.10.6
```
Isso troca a versão **apenas até fechar o terminal**.  

### **📌 6. Definir uma versão apenas para um projeto**
```bash
pyenv local 3.11.5
```
Isso cria um **arquivo `.python-version`** na pasta do projeto.  

### **📌 7. Remover versões antigas**
```bash
pyenv uninstall 3.9.2
```

---

## **🔗 Criando Ambientes Virtuais com Pyenv + Virtualenv**  
Usar **ambientes virtuais** evita conflitos entre projetos diferentes.  

1. **Instale o plugin pyenv-virtualenv** (Mac/Linux)  
   ```bash
   brew install pyenv-virtualenv
   ```
2. **Crie um ambiente virtual**  
   ```bash
   pyenv virtualenv 3.12.0 meu-projeto-env
   ```
3. **Ativar o ambiente virtual**  
   ```bash
   pyenv activate meu-projeto-env
   ```
4. **Desativar o ambiente virtual**  
   ```bash
   pyenv deactivate
   ```



---

## **🚀 Conclusão**  
Agora você sabe como instalar e usar o **Pyenv** no **Mac, Windows e Linux**, além de criar **ambientes virtuais** e evitar bagunça no sistema.  
