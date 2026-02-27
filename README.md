# mri_Qcrafting

Um script completo e moderno de crafting (criação de itens) para servidores de FiveM, projetado para oferecer a melhor experiência possível na criação de itens através de bancadas de trabalho dinâmicas.

---

## 🚀 Sobre a Nova Atualização (Update NUI e afins)

A recente atualização focou em trazer uma experiência visual e interativa completamente nova para o sistema de crafting! 

**O que há de novo?**
- **Nova NUI (Interface de Usuário):** A interface gráfica do script foi reconstruída do zero! Agora ela utiliza uma estrutura web moderna (React + Vite + Tailwind CSS), resultando em um visual muito mais bonito, leve e responsivo.
- **Totalmente Personalizável:** A interface se adapta às cores do seu servidor (configurável pelo `config.lua`).
- **Comunicação Otimizada:** As chamadas de NUI (callbacks) foram refeitas (`cl_nui.lua`) para garantir que os processos de craft sejam seguros e instantâneos.

---

## 🌟 Principais Características do Script

- **Suporte Multi-Framework:** O script é 100% compatível tanto com **QBCore** (`qb`) quanto com **ESX** (`esx`).
- **Sistemas de Target Suportados:** Compatibilidade nativa com os sistemas de alvo (Eye) mais populares: `ox_target` e `qb-target`.
- **Diversos Inventários Suportados:** O script busca automaticamente as imagens dos itens para exibir na NUI! Compatível com os diretórios de imagens dos seguintes inventários:
  - `ox_inventory` (Padrão)
  - `qb-inventory`
  - `lj-inventory`
  - `qs-inventory`
  - `ps-inventory`
- **Gerenciamento de Bancadas In-Game:**
  - `create` (Configurável): Comando para criar novas mesas/bancadas de crafting diretamente por dentro do jogo.
  - `edit` (Configurável): Comando para editar bancadas já existentes.
- **Customização Facilitada:** Facilidade na configuração da cor principal da interface, uso de barra de progresso (ex: `ox_progress`), imagens de itens e hierarquia de permissões (Admins).

---

## ⚙️ Exemplo de Configuração (`shared/config.lua`)

Aqui estão alguns dos parâmetros principais que você pode alterar:

```lua
Config = {}
Config.Framework = "qb" -- Escolha entre 'esx' ou 'qb'
Config.Target = "ox_target" -- Use 'ox_target' ou 'qb-target'
Config.PrimaryColor = "#5CE65C" -- Cor hexadecimal que afetará toda a NUI do crafting
Config.OxProgress = true -- Ative caso queira utilizar a barra de progresso do ox_lib

-- Diretório onde estão alocadas as imagens dos itens do seu inventário
Config.ImagePath = "ox_inventory/web/images/" 
```

## 📦 Dependências Necessárias

Para garantir o total funcionamento deste script, certifique-se de iniciar as opções abaixo no seu servidor:

- `oxmysql` (Para o salvamento no banco de dados)
- `ox_lib` (Utilizado para várias funções de interface e interações vitais)

## 📌 Comandos de Admin

A permissão é concedida automática para os grupos de `admin` e `god`. Você pode criar mesas in-game ou editá-las usando:
- **/create** (Abre a criação de uma mesa no local onde você está)
- **/edit** (Edita opções de uma mesa já criada)
*(Lembrando que os nomes desses comandos podem ser trocados na configuração).*

Nui Criada By Snow and mriQbox
