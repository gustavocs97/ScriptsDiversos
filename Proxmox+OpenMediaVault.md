Vou criar um guia passo a passo em Markdown com base no seu setup para configurar o **Proxmox** com o **TrueNAS** usando PCIe Passthrough e o **OpenMediaVault** para compartilhamento de rede.

---

# Tutorial: Configuração do Proxmox + TrueNAS com PCIe Passthrough e OpenMediaVault

Este guia cobre a instalação do **Proxmox** e **TrueNAS** usando PCIe Passthrough para acesso direto aos discos e configuração de compartilhamento de rede com o **OpenMediaVault**.

## Índice
- [Pré-requisitos](#pré-requisitos)
- [Passo 1: Configuração do Proxmox](#passo-1-configuração-do-proxmox)
- [Passo 2: Habilitar PCIe Passthrough no Proxmox](#passo-2-habilitar-pcie-passthrough-no-proxmox)
- [Passo 3: Configurar a VM do TrueNAS](#passo-3-configurar-a-vm-do-truenas)
- [Passo 4: Configuração do OpenMediaVault](#passo-4-configuração-do-openmediavault)
- [Passo 5: Configuração de Compartilhamento de Rede](#passo-5-configuração-de-compartilhamento-de-rede)

## Pré-requisitos

- **Proxmox** instalado em um SSD dedicado.
- Discos adicionais para armazenamento (conectados ao controlador SATA que será passado para a VM do TrueNAS).
- Conexão estável e IP fixo ou DHCP configurado para facilitar o acesso.

---

## Passo 1: Configuração do Proxmox

1. **Instalar o Proxmox**:
   - Instale o Proxmox em um SSD dedicado. Este SSD não será compartilhado com o TrueNAS.

2. **Adicionar Discos de Dados**:
   - Conecte os discos de armazenamento que o TrueNAS irá gerenciar diretamente através de PCIe Passthrough.
   - Garanta que esses discos estão conectados ao controlador SATA que será passado para a VM do TrueNAS.

---

## Passo 2: Habilitar PCIe Passthrough no Proxmox

Para permitir que o TrueNAS acesse os discos diretamente, ative o PCIe Passthrough para o controlador SATA.

1. **Habilitar IOMMU**:
   - Abra o arquivo de configuração do GRUB:

     ```bash
     nano /etc/default/grub
     ```

   - Adicione a linha apropriada à variável `GRUB_CMDLINE_LINUX_DEFAULT`:
     ```bash
     intel_iommu=on     # Para processadores Intel
     amd_iommu=on       # Para processadores AMD
     ```

   - Salve o arquivo e atualize o GRUB:

     ```bash
     update-grub
     reboot
     ```

2. **Ativar Módulos VFIO**:
   - Adicione os módulos VFIO ao sistema:
     ```bash
     echo 'vfio' >> /etc/modules
     echo 'vfio_iommu_type1' >> /etc/modules
     echo 'vfio_pci' >> /etc/modules
     echo 'vfio_virqfd' >> /etc/modules
     ```
   - Atualize a imagem do `initramfs`:
     ```bash
     update-initramfs -u
     ```

3. **Verificar IOMMU**:
   - Após o reboot, verifique se o IOMMU está ativado:
     ```bash
     dmesg | grep -e DMAR -e IOMMU
     ```

---



## Passo 2.0: Habilitar SATA Passthrough no Proxmox via comando

1. **Listar as Partições com `df -T`**:
   Esse comando exibe todas as partições montadas no sistema junto com o tipo de sistema de arquivos. Execute:

   ```bash
   df -T
   ```

   **Exemplo de saída:**
   ```plaintext
   Filesystem     Type   1K-blocks    Used Available Use% Mounted on
   udev           devtmpfs  1000000       0  1000000   0% /dev
   /dev/sda2      ext4   196000000 2000000 184000000   1% /mnt/1-hd750-sistema
   /dev/sda3      ext4   514000000 13000000 480000000  3% /mnt/1-hd750-dados
   ```
   Na coluna “Type”, você verá o tipo de sistema de arquivos. No exemplo, as partições `/dev/sda2` e `/dev/sda3` usam o tipo `ext4`.

2. **Verificar Detalhes de Todas as Partições com `lsblk -f`**:
   Outro comando útil é o `lsblk`, que exibe as partições e sistemas de arquivos, além dos pontos de montagem e UUIDs (identificadores únicos das partições). Execute:

   ```bash
   lsblk -f
   ```

   **Exemplo de saída:**
   ```plaintext
   NAME   FSTYPE LABEL  UUID                                 MOUNTPOINT
   sda                                                          
   ├─sda1 ext4   boot   a1b2c3d4-e5f6-1234-1234-56789abcdef0 /boot
   ├─sda2 ext4   sistema 1234abcd-5678-1234-1234-567890abcdef /mnt/1-hd750-sistema
   └─sda3 ext4   dados   abcdef12-3456-1234-1234-ef1234567890 /mnt/1-hd750-dados
   ```
   Aqui, na coluna “FSTYPE”, você verá o tipo de sistema de arquivos. Além disso, o `lsblk -f` mostra o UUID de cada partição, o que pode ser útil se você preferir montar as partições pelo UUID no `/etc/fstab`.

3. **Confirmar o Sistema de Arquivos de Uma Partição Específica com `file -s`**:
   Se você quiser verificar o tipo de sistema de arquivos de uma partição específica, pode usar o comando `file` apontando para o dispositivo:

   ```bash
   file -s /dev/sda2
   ```

   **Exemplo de saída:**
   ```plaintext
   /dev/sda2: Linux rev 1.0 ext4 filesystem data, UUID=1234abcd-5678-90ef-1234-567890abcdef (extents) (large files) (64bit)
   ```

   Esse comando mostrará o sistema de arquivos específico da partição (`ext4` no exemplo acima) e outras informações adicionais, como o UUID.

4. **Dica: Usar `blkid` para Listar Sistemas de Arquivos e UUIDs**:
   O comando `blkid` exibe apenas os sistemas de arquivos e UUIDs das partições, sem os pontos de montagem. Execute:

   ```bash
   blkid
   ```

   **Exemplo de saída:**
   ```plaintext
   /dev/sda1: UUID="a1b2c3d4-e5f6-7890-1234-56789abcdef0" TYPE="ext4" PARTLABEL="boot"
   /dev/sda2: UUID="1234abcd-5678-90ef-1234-567890abcdef" TYPE="ext4" PARTLABEL="sistema"
   /dev/sda3: UUID="abcdef12-3456-7890-abcd-ef1234567890" TYPE="ext4" PARTLABEL="dados"
   ```

   Aqui, o `blkid` mostra os UUIDs e os tipos de sistema de arquivos (ext4, no exemplo) das partições.

### Resumo
- Use `df -T` para ver o tipo de sistema de arquivos das partições montadas.
- Use `lsblk -f` para ver o sistema de arquivos, UUID e pontos de montagem.
- Use `file -s /dev/sdXN` para checar uma partição específica.
- Use `blkid` para listar UUIDs e tipos de sistemas de arquivos de todas as partições.

Essas verificações garantem que você pode configurar o `/etc/fstab` corretamente com o tipo de sistema de arquivos certo para cada partição!





## Passo 2.1: Habilitar SATA Passthrough no Proxmox via comando

1. **Identificar o controlador SATA**:
   - Use o comando `lspci` para listar os dispositivos PCI:
     ```bash
     lspci
     ```

   - Encontre o **controlador SATA** (por exemplo, **SATA controller** ou **AHCI**).
   
   - Para obter mais informações sobre os dispositivos de disco, você pode usar:
     ```bash
     lsblk -o +MODEL,SERIAL
     ```

   - Em seguida, use o comando abaixo para listar os identificadores de disco:
     ```bash
     ls /dev/disk/by-id
     ```

2. **Adicionar o controlador SATA à VM do TrueNAS**:
   - Na interface do **Proxmox**, selecione a **VM do TrueNAS** e vá para a aba **Hardware**.
   - Clique em **Adicionar** e selecione **Dispositivo PCI**.
   - Escolha o **controlador SATA** que você identificou.
   - Isso irá passar o controlador de armazenamento diretamente para o TrueNAS.

3. **Configuração final**:
   - Caso seu controlador de armazenamento esteja integrado à placa-mãe, você pode configurar a passagem de disco com base nos **números de série** (identificadores) para garantir que você não esteja passando discos críticos (como o disco do sistema do Proxmox).
   - Para adicionar o disco à VM TrueNAS, execute o comando:
     ```bash
     qm set 103 -scsi1 /dev/disk/by-id/ata-XYZOAKDO-1W8R8W-D1W56W6
     ```

     Substitua `/dev/disk/by-id/ata-XYZOAKDO-1W8R8W-D1W56W6` pelo identificador correto do disco do seu controlador SATA.

4. **Atualizar o Proxmox**:
   - Atualize a configuração e reinicie o Proxmox para aplicar as mudanças:
     ```bash
     systemctl restart pve-cluster
     ```

## Passo 2.2: Habilitar SATA Passthrough Tutorial para Montagem de Partições no Proxmox




Posso sim te ajudar a criar um tutorial passo a passo para montar e configurar essas partições no sistema Proxmox. Vou detalhar cada etapa para garantir que as partições sejam montadas automaticamente após o reboot.

### Tutorial para Montagem de Partições no Proxmox

1. **Identificar as Partições**:
   Primeiro, é preciso identificar as partições que você deseja montar. Para isso, você pode usar o comando:

   ```bash
   fdisk -l
   ```

   Esse comando mostra todas as partições. Localize as partições que você quer montar, no seu caso `/dev/sda2` e `/dev/sda3`.

2. **Criar Diretórios para Montagem**:
   Crie os diretórios onde as partições serão montadas. Por exemplo, para as partições `/dev/sda2` e `/dev/sda3`, execute:

   ```bash
   mkdir -p /mnt/1-hd750-sistema
   mkdir -p /mnt/1-hd750-dados
   ```

3. **Montar as Partições Temporariamente**:
   Agora, monte as partições para verificar se tudo está funcionando corretamente. Execute os comandos:

   ```bash
   mount /dev/sda2 /mnt/1-hd750-sistema
   mount /dev/sda3 /mnt/1-hd750-dados
   ```

   Verifique se as partições foram montadas corretamente com o comando:

   ```bash
   df -h | grep /mnt
   ```

   Se tudo estiver correto, você verá as partições listadas com o espaço utilizado e disponível.

4. **Configurar a Montagem Automática (Editar o arquivo `/etc/fstab`)**:
   Para que essas partições sejam montadas automaticamente na inicialização, é necessário adicionar as entradas no arquivo `/etc/fstab`. Abra o arquivo com um editor de texto, como o `nano`:

   ```bash
   nano /etc/fstab
   ```

   Adicione as seguintes linhas no final do arquivo para cada partição:

   ```plaintext
   /dev/sda2 /mnt/1-hd750-sistema ext4 defaults 0 2
   /dev/sda3 /mnt/1-hd750-dados ext4 defaults 0 2
   ```

   **Explicação dos campos**:
   - `/dev/sda2` e `/dev/sda3`: dispositivo de cada partição.
   - `/mnt/1-hd750-sistema` e `/mnt/1-hd750-dados`: ponto de montagem de cada partição.
   - `ext4`: tipo do sistema de arquivos (confirme com `df -T` caso precise verificar).
   - `defaults`: opções padrão de montagem.
   - `0`: valor para indicar se deve ser feito dump (backup); geralmente deixado como `0`.
   - `2`: ordem de verificação de integridade de sistema de arquivos no boot; `2` é usado para partições que não são principais.

5. **Testar as Configurações do `/etc/fstab`**:
   Para garantir que o `/etc/fstab` foi configurado corretamente, desmonte as partições e monte-as novamente com o comando:

   ```bash
   umount /mnt/1-hd750-sistema
   umount /mnt/1-hd750-dados
   mount -a
   ```

   O comando `mount -a` monta todas as partições listadas no `/etc/fstab`, permitindo que você verifique se está tudo correto sem precisar reiniciar.

6. **Verificar se Está Tudo Certo**:
   Execute o comando `df -h` novamente para confirmar que as partições foram montadas corretamente:

   ```bash
   df -h | grep /mnt
   ```

   Agora, as partições devem aparecer montadas conforme configurado no `/etc/fstab`.

7. **Reiniciar (Opcional)**:
   Para finalizar e garantir que as mudanças persistem após reiniciar o sistema, faça um reboot no Proxmox:

   ```bash
   reboot
   ```

Após o reboot, suas partições serão montadas automaticamente.



---





## Passo 3: Configurar a VM do TrueNAS

### 1. Identificar o Controlador SATA

- Identifique o controlador SATA usando:
  ```bash
  lspci
  ```

### 2. Passar o Controlador SATA para a VM

1. No Proxmox, selecione a VM do TrueNAS e vá para **Hardware**.
2. Clique em **Adicionar** e selecione **Dispositivo PCI**.
3. Selecione o controlador SATA e configure-o com PCIe Passthrough.

### 3. Criar e Configurar a VM do TrueNAS

1. Crie uma nova VM no Proxmox com o disco do sistema em um SSD separado.
2. Durante a configuração, inclua o controlador SATA com PCIe Passthrough.
3. Instale o TrueNAS na VM e confirme que ele reconhece os discos de dados.

---

## Passo 4: Configuração do OpenMediaVault

1. **Acessar a Interface Web**:
   - No navegador, abra o endereço IP do OpenMediaVault e faça login.

2. **Montar o Dispositivo de Armazenamento**:
   - Vá em **Storage** > **File Systems**.
   - Clique em **Create** para formatar o disco, escolha o tipo de sistema de arquivo, e clique em **Mount**.

---

## Passo 5: Configuração de Compartilhamento de Rede

### 1. Criar uma Pasta Compartilhada

- Acesse **Storage** > **Shared Folders** e clique em **Add**.
- Defina:
  - **Name**: Nome da pasta (ex: `1-hd750-dados`).
  - **Device**: Disco onde a pasta será criada.
  - **Permissions**: Defina conforme necessário.
- Salve as configurações.

### 2. Ativar e Configurar o Serviço SMB/CIFS

1. Em **Services** > **SMB/CIFS**, habilite o serviço e defina o **NetBIOS name** (ex: `instancia-1-openmediavault`).
2. Em **Shares**, adicione a pasta compartilhada criada anteriormente.

### 3. Ativar e Configurar o Serviço NFS (Opcional)

1. Em **Services** > **NFS**, habilite o serviço.
2. Em **Shares**, selecione a pasta a ser compartilhada, configure permissões, e defina os IPs de clientes que podem acessar o NFS.

---

## Passo 6: Acesso ao Compartilhamento

### Configurar Nome DNS

- Configure o DNS no seu roteador para que `instancia-1-openmediavault.local` seja reconhecido na rede.

### Acessar SMB/CIFS

- No explorador de arquivos, acesse: `smb://instancia-1-openmediavault.local/1-hd750-dados`.

### Acessar NFS

- No Linux, monte o NFS manualmente:
  ```bash
  sudo mount -t nfs instancia-1-openmediavault.local:/export/1-hd750-dados /ponto/de/montagem
  ```

  Adicione ao `/etc/fstab` para montar automaticamente:
  ```fstab
  instancia-1-openmediavault.local:/export/1-hd750-dados /ponto/de/montagem nfs defaults 0 0
  ```

---

## Resumo do Setup Final

### Proxmox

- **Disco do Proxmox**: SSD dedicado para o sistema.
- **Disco para o TrueNAS**: SSD pequeno para o sistema TrueNAS (na VM).
- **Discos de Dados**: HDs conectados ao controlador SATA, que é passado para a VM do TrueNAS.

### TrueNAS

- Controle direto dos discos de dados para gerenciamento e uso de ZFS e RAID.

### OpenMediaVault

- Configurado para compartilhamento de rede via SMB e NFS, acessível pelo nome de rede `instancia-1-openmediavault.local`.

---

## Comandos Úteis no Proxmox

1. **Montar Disco no TrueNAS**:
   ```bash
   qm set <vmid> -scsi1 /dev/disk/by-id/ata-SanDisk_SDSSDA240G_54654646458979
   
   ```

2. **Listar VMs**:
   ```bash
   qm list
   ```

2. **MUDAR**:
   ```bash
   scsi1 +1 +2 +3
   ```


Este guia cobre todas as etapas para configurar Proxmox, TrueNAS e OpenMediaVault com suporte a PCIe Passthrough, garantindo que o TrueNAS tenha controle direto sobre os discos e o OpenMediaVault forneça compartilhamento de rede eficiente.


Este tutorial foi estruturado para abordar todo o processo e garantir um ambiente de rede e armazenamento compartilhado estável e acessível via TrueNAS e OpenMediaVault.

---
### NOVO
---

### Tornar o **compartilhamento de arquivos** via **SMB** ou **NFS** acessível de forma pública na internet usando um túnel Cloudflare, sem precisar de um IP público. Vou te explicar como fazer isso, adaptando o conceito de **Cloudflare Tunnel** para permitir o acesso ao seu servidor de arquivos (OMV, Proxmox, etc.), usando **SMB** ou **NFS**.

### 1. **Usando Cloudflare Tunnel para Compartilhamento de Arquivos SMB/NFS**

A ideia é utilizar o Cloudflare Tunnel para redirecionar o tráfego de um serviço de **compartilhamento de arquivos** (SMB ou NFS) por meio da rede segura da Cloudflare, sem expor seu servidor diretamente à internet.

Vamos seguir com a configuração:

---

### **Passo 1: Configurar o Cloudflare Tunnel**

Primeiro, você vai precisar do **Cloudflare Tunnel** para encaminhar o tráfego de SMB/NFS de maneira segura.

1. **Crie uma conta na Cloudflare** (se ainda não tiver) e configure o seu domínio.
2. **Instale o `cloudflared` no servidor** (no seu caso, no Ubuntu ou outro sistema que você está usando).

**Instalação no Ubuntu:**
```bash
sudo apt-get update
sudo apt-get install cloudflared
```

3. **Autentique o cloudflared**:
```bash
sudo cloudflared tunnel login
```
Isso abrirá um link no qual você deve autorizar o Cloudflare a conectar-se à sua conta.

---

### **Passo 2: Criação e Configuração do Tunnel**

Agora, vamos criar o túnel no Cloudflare e configurá-lo para encaminhar o tráfego SMB ou NFS.

1. **Crie um túnel**:
```bash
sudo cloudflared tunnel create nome-do-tunnel
```
Isso criará o túnel e gerará um **UUID**.

2. **Configure o túnel**:

Você precisa criar um arquivo de configuração para o túnel, geralmente encontrado em `/root/.cloudflared/config.yml`. Aqui, você precisa configurar o destino do tráfego, que será o seu servidor SMB ou NFS local.

**Exemplo de configuração para SMB**:

```yaml
tunnel: <Tunnel-UUID>
credentials-file: /root/.cloudflared/<Tunnel-UUID>.json
ingress:
  - hostname: smb.seudominio.com
    service: smb://localhost:445
  - hostname: nfs.seudominio.com
    service: nfs://localhost:2049
  - service: http_status:404
```

- **smb://localhost:445**: Isso redireciona o tráfego SMB da porta 445.
- **nfs://localhost:2049**: Isso redireciona o tráfego NFS da porta 2049.

Esse arquivo define as regras de como o tráfego será roteado. Substitua `<Tunnel-UUID>` pelo ID gerado no passo anterior.

---

### **Passo 3: Criar o DNS CNAME no Cloudflare**

Agora, você precisa configurar os registros DNS para que o tráfego seja redirecionado para o túnel.

1. **Crie um CNAME para o seu serviço SMB/NFS**.

Execute o seguinte comando para adicionar o registro DNS para o seu domínio:

```bash
sudo cloudflared tunnel route dns <Tunnel-UUID> smb.seudominio.com
sudo cloudflared tunnel route dns <Tunnel-UUID> nfs.seudominio.com
```

Isso cria um registro **CNAME** apontando para o túnel Cloudflare, permitindo que você acesse os serviços SMB e NFS com os subdomínios definidos.

---

### **Passo 4: Executar o Tunnel**

Agora, inicie o túnel Cloudflare para começar a redirecionar o tráfego para os serviços SMB ou NFS:

```bash
sudo cloudflared tunnel run <Tunnel-UUID ou nome-do-tunnel>
```

Isso iniciará o túnel e permitirá que você acesse os seus serviços SMB ou NFS de forma pública.

---

### **Passo 5: Executar o Cloudflare como Serviço**

Para garantir que o túnel seja executado automaticamente ao reiniciar o servidor, você pode configurar o **cloudflared** para rodar como um serviço.

1. **Instale o serviço**:
```bash
sudo cloudflared service install
```

2. **Inicie o serviço**:
```bash
sudo systemctl start cloudflared
```

3. **Verifique o status**:
```bash
sudo systemctl status cloudflared
```

Isso garante que o túnel sempre estará ativo, permitindo acesso contínuo aos seus compartilhamentos SMB/NFS.

---

### **Passo 6: Acessando o Compartilhamento de Arquivos Publicamente**

Agora, seus compartilhamentos SMB e NFS estarão acessíveis publicamente através dos subdomínios configurados no Cloudflare:

- **SMB**: Acesse `\\smb.seudominio.com\` para acessar os compartilhamentos SMB.
- **NFS**: Monte a unidade NFS com o comando apropriado:  
  `mount -t nfs nfs.seudominio.com:/caminho/compartilhado /ponto/de/montagem`

Isso permite que qualquer máquina com acesso à internet possa acessar os seus serviços de compartilhamento de arquivos, sem precisar de um IP público.

---

### Considerações Finais

- **Segurança**: Como você estará expondo seus serviços SMB ou NFS à internet, é fundamental usar criptografia e controles de acesso adequados. O Cloudflare Tunnel criptografa o tráfego, mas você ainda precisa garantir que o seu servidor de arquivos esteja seguro.
- **Firewall**: Certifique-se de que as portas necessárias (445 para SMB, 2049 para NFS) estejam abertas apenas para o tráfego proveniente do Cloudflare. A configuração do firewall do servidor pode ser crucial para proteger seu ambiente.
- **Desempenho**: Dependendo da sua conexão e do uso do serviço, o tráfego SMB/NFS via Cloudflare Tunnel pode ser mais lento que uma conexão local, então esteja ciente disso.

Com essa configuração, você terá um **túnel seguro** para acessar seus serviços de **compartilhamento de arquivos** via SMB ou NFS, sem precisar de um IP público.



