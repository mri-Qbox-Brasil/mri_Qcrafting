# mri_Qcrafting — Manual

Sistema de bancadas de crafting criadas e editadas em jogo, com receitas, preview 3D do item, restrição por job/gang e persistência em MySQL.

---

## Sumário

1. [Dependências](#dependências)
2. [Instalação](#instalação)
3. [Permissões (ACE)](#permissões-ace)
4. [Configuração](#configuração)
5. [Comandos](#comandos)
6. [Banco de dados](#banco-de-dados)
7. [Criar uma bancada](#criar-uma-bancada)
8. [Editar uma bancada](#editar-uma-bancada)
9. [Receitas](#receitas)
10. [Fluxo de crafting](#fluxo-de-crafting)
11. [Integrações](#integrações)
12. [Entrypoints para outros recursos](#entrypoints-para-outros-recursos)
13. [Estrutura de arquivos](#estrutura-de-arquivos)

---

## Dependências

| Recurso | Obrigatório | Observação |
|---|---|---|
| `ox_lib` | Sim | Menus de contexto, inputDialog, progressBar, raycast, notificações |
| `oxmysql` | Sim | Persistência das bancadas e das receitas |
| `qbx_core` | Sim | Bridge QB (`exports['qb-core']:GetCoreObject()`, servido pelo `provide 'qb-core'` do qbx_core) e `GetJobs`/`GetGangs` |
| `ox_target` | Sim | Interação com a bancada (`Config.Target`). O caminho `qb-target` existe no código mas está marcado como sem suporte |
| `ox_inventory` | Sim | `Items()` para os dropdowns do admin e `GetItemCount()` para checar ingredientes no preview |
| `cw-rep` | Sim | `getCurrentLevel(hability)` é chamado no preview de todo item, sem guarda |
| `es_extended` | Não | Alternativa ao QB (`Config.Framework = "esx"`) |
| `scully_emotemenu` | Não | Usado quando a receita define uma animação (`anim`). Sem `anim`, cai na animação `mini@repair` |

---

## Instalação

1. Copie a pasta `mri_Qcrafting` para `resources/`.
2. Adicione ao `server.cfg`, depois do `oxmysql` e do framework:
   ```
   ensure mri_Qcrafting
   ```
3. Não há SQL para importar: as tabelas `qt-crafting` e `qt-crafting-items` são criadas no primeiro start, e colunas novas (`model`, `anim`, `level`, `hability`) são adicionadas automaticamente em instalações antigas (`bridge/server/insert.lua`).
4. Ajuste `Config.ImagePath` para o caminho de imagens do seu inventário — é dele que saem os ícones do menu.
5. Libere a ACE de admin (veja abaixo).

---

## Permissões (ACE)

No QB/Qbox, o gate de admin é `IsPlayerAceAllowed(source, 'admin')`:

```
add_ace group.admin admin allow
```

No ESX, a checagem usa o grupo do jogador contra `Config.Authorization` (`admin` e `god` por padrão).

Os comandos `/craft:create` e `/craft:edit` são registrados sem `restricted` — quem barra o acesso é o callback `qt-crafting:PermisionCheck`, executado no servidor antes de abrir os menus.

---

## Configuração

Arquivo: `shared/config.lua`.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `Config.Framework` | string | Sim | `"qb"` ou `"esx"` |
| `Config.Target` | string | Sim | `"ox_target"` ou `"qb-target"` (obsoleto, sem suporte) |
| `Config.OxProgress` | bool | Sim | Usa `lib.progressBar`/`lib.progressCircle` do ox_lib. Com `false`, é preciso implementar a barra em `bridge/client/client.lua` |
| `Config.ImagePath` | string | Sim | Caminho NUI das imagens dos itens (ex.: `ox_inventory/web/images/`) |
| `Config.Authorization` | tabela | Sim (ESX) | Grupos ESX com acesso admin. Ignorado no QB/Qbox |
| `Config.Pfx` | string | Sim | Prefixo dos comandos. Padrão: `craft:` |
| `Config.CreateTableCommand` | string | Sim | Sufixo do comando de criação. Padrão: `create` (resulta em `/craft:create`) |
| `Config.EditMenuCommand` | string | Sim | Sufixo do comando de edição. Padrão: `edit` (resulta em `/craft:edit`) |
| `Config.Debug` | bool | Sim | Desenha as box zones de debug |

Os textos da interface ficam em `shared/locales.lua`, em uma única tabela `locales` (pt-BR).

---

## Comandos

| Comando | Permissão | Descrição |
|---|---|---|
| `/craft:create` | Admin (ACE `admin` no QB, grupo em `Config.Authorization` no ESX) | Abre o assistente de criação de bancada |
| `/craft:edit` | Admin | Abre a lista de bancadas para edição |

Os nomes são montados a partir de `Config.Pfx` + `Config.CreateTableCommand` / `Config.EditMenuCommand`.

---

## Banco de dados

Duas tabelas, criadas automaticamente.

### `qt-crafting` — as bancadas

| Coluna | Tipo | Descrição |
|---|---|---|
| `craft_id` | int | Identificador da bancada |
| `craft_name` | varchar(50) | Nome exibido no menu |
| `crafting` | JSON | `model` (prop), `propcoords`, `heading`, `offset` (altura do preview), `jobenable`, `blipenable`, `targetable` |
| `blipdata` | JSON | `sprite`, `colour`, `scale`, `blip_label` |
| `jobs` | JSON | Lista de jobs/gangs autorizados |

### `qt-crafting-items` — as receitas

| Coluna | Tipo | Descrição |
|---|---|---|
| `craft_id` | int | Bancada dona da receita |
| `item` | varchar(50) | Nome do item produzido |
| `item_label` | varchar(50) | Rótulo exibido no menu |
| `recipe` | JSON | Ingredientes: lista de `{ item, label, amount }` |
| `time` | int | Duração do crafting em segundos |
| `amount` | int | Quantidade produzida por craft |
| `model` | longtext | Prop usado no preview 3D |
| `anim` | longtext | Comando de emote do `scully_emotemenu` |
| `level` | int | Nível mínimo exigido |
| `hability` | varchar(255) | Habilidade do `cw-rep` cobrada no nível. Padrão: `crafting` |

---

## Criar uma bancada

1. Execute `/craft:create`.
2. Escolha o prop, o nome e as opções iniciais (job/gang, blip) no `lib.inputDialog`.
3. Posicione a bancada mirando com a câmera (raycast) e confirme.
4. A bancada é gravada no MySQL e sincronizada com todos os clientes.

---

## Editar uma bancada

`/craft:edit` lista as bancadas existentes. Por bancada:

| Opção | Efeito |
|---|---|
| Mudar nome | Renomeia a bancada |
| Editar posição | Reposiciona o prop via raycast |
| Mudar altura | Ajusta o `offset` — altura em que o item flutua no preview |
| Itens | Adiciona receitas ou edita as existentes |
| Job/Gang | Define ou remove a restrição de acesso |
| Alvo por modelo (`targetable`) | Com `true`, o target é aplicado ao **modelo** (todos os props iguais no mapa ficam interativos) em vez do prop criado pelo recurso |
| Teleportar | Leva o admin até a bancada |
| Excluir | Apaga a bancada e todas as receitas dela |

Cada receita pode ter alterados: rótulo, tempo, ingredientes, quantidade produzida, prop de preview, animação, nível e habilidade — além de ser removida.

Toda alteração dispara `qt-crafting:Update`, que recarrega os dados e faz um `qt-crafting:Sync` para todos os clientes: props, targets e blips são reconstruídos sem restart.

---

## Receitas

Uma receita é um item produzido + a lista de ingredientes. A checagem de ingredientes acontece duas vezes:

- **No client**, no preview: `exports.ox_inventory:GetItemCount(item)` e o nível do `cw-rep` decidem se o botão "Fabricar" fica habilitado, e pintam o contorno do prop de verde ou vermelho.
- **No servidor**, ao confirmar: o callback `qt-crafting:CanCraftItem` revalida o inventário antes de consumir qualquer item.

---

## Fluxo de crafting

1. O jogador interage com a bancada pelo `ox_target` (bloqueado se `jobenable` estiver ligado e o job/gang dele não estiver na lista).
2. O menu lista as receitas com ícone, rótulo e tempo.
3. Ao selecionar uma, a câmera foca a bancada e o prop do item aparece girando acima dela, com os ingredientes e o nível exigido.
4. "Fabricar" toca a animação (do `scully_emotemenu` ou `mini@repair`) e roda a progressBar pelo tempo da receita.
5. Concluído: os ingredientes são removidos e o item é entregue. Cancelado: nada é consumido.

---

## Integrações

### ox_target

Cada bancada recebe uma opção de target com ícone de martelo e distância 3. Com `targetable = false` (padrão) o target é ligado ao prop criado pelo recurso (`addLocalEntity`); com `targetable = true` ele é ligado ao modelo (`addModel`), o que faz **qualquer** prop daquele modelo no mapa virar bancada.

### ox_inventory

Fornece a lista de itens nos dropdowns do admin, a contagem no inventário do jogador durante o preview e as imagens dos ícones (via `Config.ImagePath`).

### cw-rep

O nível do jogador na habilidade da receita (`hability`, padrão `crafting`) é comparado com `level`. Abaixo do nível exigido, o item aparece bloqueado no menu.

### scully_emotemenu

Se a receita tem `anim`, o crafting toca `exports.scully_emotemenu:playEmoteByCommand(anim, 0)`. Sem `anim`, usa a animação nativa `mini@repair / fixing_a_ped`.

---

## Entrypoints para outros recursos

O recurso não expõe exports. A superfície utilizável de fora são os callbacks e eventos abaixo — os de escrita só funcionam para quem passou pelo gate de admin, então servem para ferramentas administrativas, não para lógica de jogo.

### Callbacks de leitura

```lua
QT.TriggerCallback('qt-crafting:GetList', function(bancadas) end)                    -- todas as bancadas
QT.TriggerCallback('qt-crafting:fetchTables', function(bancadas) end)                -- cache do servidor
QT.TriggerCallback('qt-crafting:GetListItems', function(itens) end, craftId)         -- itens de uma bancada
QT.TriggerCallback('qt-crafting:fetchItemsFromId', function(itens) end, craftId)     -- itens com receita completa
QT.TriggerCallback('qt-crafting:CanCraftItem', function(pode) end, recipe)           -- boolean
QT.TriggerCallback('qt-crafting:GetEntityCoords', function(coords) end, craftId)     -- vector4
QT.TriggerCallback('qt-crafting:GetEntityModel', function(model) end, craftId)
QT.TriggerCallback('qt-crafting:PermisionCheck', function(temPermissao) end)
```

`QT.TriggerCallback` é o wrapper do recurso; por baixo é `QBCore.Functions.TriggerCallback` ou `ESX.TriggerServerCallback`.

### Eventos de servidor

```lua
TriggerServerEvent('qt-crafting:CreateWorkShop', data)
TriggerServerEvent('qt-crafting:ChangeName', craftId, novoNome)
TriggerServerEvent('qt-crafting:DeleteTable', craftId, nome)
TriggerServerEvent('qt-crafting:AddItemCrafting', data)
TriggerServerEvent('qt-crafting:UpdateItems', craftId, item, dados, task)  -- task: delete|time|recipe|label|amount|model|anim|level|hability
TriggerServerEvent('qt-crafting:UpdatePosition', vector4, craftId, nome)
TriggerServerEvent('qt-crafting:UpdateHeight', altura, craftId)
TriggerServerEvent('qt-crafting:UpdateTargetable', bool, craftId)
TriggerServerEvent('qt-crafting:UpdateBlip', blipData, craftId, nome)
TriggerServerEvent('qt-crafting:ChangeJobs', craftId, jobs)
TriggerServerEvent('qt-crafting:RemoveRequirement', craftId)
TriggerServerEvent('qt-crafting:Update')   -- recarrega e sincroniza todos os clientes
```

### Evento de client

```lua
TriggerClientEvent('qt-crafting:Sync', -1)  -- reconstrói props, targets e blips
```

---

## Estrutura de arquivos

```
mri_Qcrafting/
├── shared/
│   ├── config.lua          — configuração
│   └── locales.lua         — tabela única de textos (pt-BR)
├── bridge/
│   ├── framework.lua       — resolve QBCore ou ESX
│   ├── client/
│   │   ├── client.lua      — props, targets, blips, menu, preview 3D, fluxo de craft
│   │   ├── common.lua      — QT (callbacks, job/gang), notify, progress, animação
│   │   └── raycast.lua     — posicionamento do prop pela câmera
│   └── server/
│       ├── server.lua      — QT (player, inventário, jobs, grupos), notify
│       └── insert.lua      — criação das tabelas e migração de colunas
├── cl_utils.lua            — comandos /craft:create e /craft:edit e todos os menus de admin
├── sv_utils.lua            — CRUD MySQL, callbacks, cache de bancadas, sync
└── fxmanifest.lua
```
