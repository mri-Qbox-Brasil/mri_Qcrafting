# MANUAL - mri_Qcrafting

## O que o recurso faz (descrição funcional)
Sistema dinâmico de crafting para FiveM, permitindo a criação e gerenciamento de bancadas de trabalho via interface ox_lib. Todos os dados são persistidos em MySQL. Compatível com múltiplos frameworks (ESX, QBCore/QBX) e permite adição de receitas, restrições de acesso e preview 3D de itens.

## Funcionalidades principais
- **Bancadas ilimitadas**: Criação de quantas bancadas forem necessárias via comando, sem edição manual de config.
- **Placement visual**: Posicionamento de bancadas via raycast, com rotação e confirmação visual.
- **Gerenciamento de receitas**: Adição, edição e remoção de receitas dinamicamente via menu admin.
- **Preview 3D de itens**: Câmera dedicada com prop rotativo do item craftável.
- **Restrição por job/gang**: Limitação de acesso a bancadas por profissão ou gangue.
- **Blips no mapa**: Blips opcionais por bancada, com suporte a restrições de job.
- **Requisitos de nível**: Verificação de nível/habilidade via `cw-rep`.
- **Multi-framework**: Compatível com ESX e QBCore/QBX.
- **Sync em tempo real**: Alterações propagam automaticamente para todos os clients.
- **Auto-migração de DB**: Colunas novas são criadas automaticamente no startup.

## Como funciona (fluxo de trabalho)

### Criação de bancada (admin)
1. Execute `/craft:create` (permissão admin).
2. Posicione a bancada com raycast (mire no chão), use setas para rotacionar.
3. Pressione Enter para confirmar ou Backspace para cancelar.
4. Defina nome e configurações iniciais via `lib.inputDialog`.

### Edição de bancada (admin)
1. Execute `/craft:edit`.
2. Selecione a bancada na lista.
3. Opções disponíveis: Renomear, Reposicionar, Ajustar altura, Gerenciar itens, Job/Gang, Targetable, Teleportar, Deletar.

### Crafting (jogador)
1. Interaja com a bancada via `ox_target`.
2. Menu de itens craftáveis abre com ícones e descrições.
3. Selecione um item para ver preview 3D, ingredientes, requisitos de nível.
4. Inicie o processo: animação de crafting, progress bar (`lib.progressBar`).
5. Ao completar: ingredientes removidos, item craftado adicionado. Cancelamento faz rollback.

## Opções de configuração disponíveis
Configurações em `shared/config.lua`:

| Opção | Padrão | Descrição |
|-------|--------|-----------|
| `Config.Framework` | `"qb"` | `"esx"` ou `"qb"`. |
| `Config.Target` | `"ox_target"` | `"ox_target"` ou `"qb-target"` (deprecated). |
| `Config.OxProgress` | `true` | Usa progress bars do ox_lib. |
| `Config.ImagePath` | `"ox_inventory/web/images/"` | Caminho para imagens de itens. |
| `Config.Authorization` | `{['admin']=true, ['god']=true}` | Grupos ESX com permissão admin. |
| `Config.Pfx` | `"craft:"` | Prefixo dos comandos. |
| `Config.CreateTableCommand` | `'create'` | Comando: `/craft:create`. |
| `Config.EditMenuCommand` | `'edit'` | Comando: `/craft:edit`. |
| `Config.Debug` | `false` | Habilita debug de box zones. |

## Comandos disponíveis
| Comando | Permissão | Descrição |
|---------|------------|-------------|
| `/craft:create` | Admin (ESX groups ou QBCore admin ace) | Abre wizard de criação de bancada. |
| `/craft:edit` | Admin | Abre lista de bancadas para edição. |

## Eventos que dispara/ouve

### Cliente → Servidor
| Evento | Descrição |
|--------|-----------|
| `qt-crafting:CreateWorkShop` | Cria nova bancada. |
| `qt-crafting:ChangeName` | Renomeia bancada. |
| `qt-crafting:DeleteTable` | Deleta bancada + itens (cascata). |
| `qt-crafting:AddItemCrafting` | Adiciona receita. |
| `qt-crafting:Update` | Refresh completo para todos os clients. |
| `qt-crafting:UpdatePosition` | Atualiza coords/heading. |
| `qt-crafting:UpdateHeight` | Atualiza offset de altura. |
| `qt-crafting:UpdateTargetable` | Toggle targeting global. |
| `qt-crafting:UpdateBlip` | Atualiza dados do blip. |
| `qt-crafting:UpdateItems` | Modifica propriedades de item. |
| `qt-crafting:ChangeJobs` | Atualiza jobs/gangs. |
| `qt-crafting:RemoveRequirement` | Remove job/gang. |
| `qt-crafting:ItemInterval` | Adiciona/remove itens durante craft. |

### Servidor → Cliente
| Evento | Descrição |
|--------|-----------|
| `qt-crafting:Sync` | Rebuild de props, targets, blips nos clients. |

### Callbacks
| Callback | Retorna | Descrição |
|----------|----------|-----------|
| `qt-crafting:PermisionCheck` | `boolean` | Verifica permissão admin. |
| `qt-crafting:fetchJobs` | `array` | Todos os jobs + gangs. |
| `qt-crafting:TableExist` | `boolean` | Se nome de bancada existe. |
| `qt-crafting:GetList` | `array` | Todas as bancadas. |
| `qt-crafting:GetListItems` | `array` | Itens de uma bancada. |
| `qt-crafting:fetchItemsFromId` | `array` | Itens com receita completa. |
| `qt-crafting:CanCraftItem` | `boolean` | Se jogador pode craftar. |
| `qt-crafting:GetEntityModel` | `string` | Modelo do prop da bancada. |
| `qt-crafting:GetEntityCoords` | `vector4` | Posição + heading da bancada. |

## Exports que fornece/consome

### Exports consumidos
| Resource | Export | Uso |
|----------|--------|-----|
| `ox_inventory` | `Items()` | Lista itens para dropdowns. |
| `ox_inventory` | `GetItemCount(item)` | Verifica inventário do jogador. |
| `ox_target` | `addLocalEntity()` / `addModel()` | Adiciona targets nas bancadas. |
| `scully_emotemenu` | `playEmoteByCommand()` | Animações customizadas de crafting. |
| `cw-rep` | `getCurrentLevel(hability)` | Verifica nível de habilidade. |

### Exports fornecidos
Nenhum export de cliente ou servidor documentado para uso externo.

## Integração com outros recursos MRI Qbox
- **ox_inventory**: Integração para listagem de itens e verificação de inventário.
- **ox_target**: Sistema de interação com bancadas.
- **cw-rep**: Verificação de nível/habilidade para crafting.
- **scully_emotemenu**: Animações customizadas durante o crafting.
- **oxmysql**: Persistência de dados em MySQL.
- **ox_lib**: Menus, diálogos, progress bars, raycast.

## Casos de uso / exemplos práticos
1. **Criação de bancada de armas**: Admin usa `/craft:create` para posicionar bancada de armas, restringe acesso a `police` job.
2. **Adição de receita de munição**: Admin edita bancada, adiciona receita de munição 9mm com ingredientes `metal` e `pólvora`.
3. **Crafting de item**: Jogador interage com bancada, seleciona munição 9mm, inicia crafting (10s), recebe 20 munições.
4. **Restrição de job**: Bancada de drogas restrita a gangue `ballas`, membros de outras gangs não podem interagir.

## Dicas de solução de problemas
- **Bancada não aparece**: Verifique se o modelo do prop está correto e se o targeting está ativado.
- **Itens não craftam**: Confira se o jogador tem os ingredientes necessários no inventário.
- **Preview 3D não funciona**: Garanta que o modelo do item está correto e a câmera está funcionando.
- **Erros de banco de dados**: Verifique se oxmysql está instalado e o esquema do DB foi criado automaticamente.
- **Targeting global indesejado**: Desative `targetable` na edição da bancada para evitar que todos os props do mesmo modelo recebam target.
