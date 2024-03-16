local objects = {}
local isBusy = false 
local Blips = {}

AddEventHandler("onResourceStop", function(res)
    if GetCurrentResourceName() == res then
        for i = 1, #objects do
          DeleteObject(objects[i])
        end
    end
end)

local function CreateTables()
    QT.TriggerCallback('qt-crafting:fetchTables', function(data)
            if data then
                for k,v in pairs(data) do

                if v.blipenb then
                    if v.jobenb then 
                        local loop = v.jobs
                        for _, item in ipairs(loop) do
                            if QT.getjob() == item then
                                BlipCreation(v.blipdata, v.coords)
                            end
                        end
                    else
                        BlipCreation(v.blipdata, v.coords)
                    end
                end
                
                propobj = CreateObject(v.model, vector3(v.coords.x, v.coords.y, v.coords.z), false, true)
                SetEntityHeading(propobj, v.coords.w)
                FreezeEntityPosition(propobj, true) 
                SetEntityInvincible(propobj, true)
                insert(objects, propobj)
                SetModelAsNoLongerNeeded(v.model)
                PlaceObjectOnGroundProperly(propobj)

                    if Config.Target == "ox_target" then  
                        exports.ox_target:addLocalEntity(propobj, {
                            {
                                name = 'table_'..v.id,
                                label = locales.enter_craftable,
                                icon = "fa-solid fa-hammer",
                                distance = 3,
                                canInteract = function()
                                    if v.jobenb then 
                                        local loop = v.jobs
                                        for _, item in ipairs(loop) do
                                            if item == QT.getjob() then
                                                if not isBusy then 
                                                    return true 
                                                else
                                                    return false 
                                                end
                                            end
                                        end
                                        else
                                            if not isBusy then 
                                                return true 
                                            else
                                                return false 
                                            end
                                        end
                                end,
                                onSelect = function(data)
                                    CraftMenu(v.id, v.name, v.coords)
                                end,
                            }
                        })
                    elseif Config.Target == "qb-target" then
                        exports['qb-target']:AddTargetEntity(propobj, {
                            options = {
                                {
                                    action = function()
                                        CraftMenu(v.id, v.name)
                                    end,
                                    icon = "fa-solid fa-hammer",
                                    label = locales.enter_craftable,
                                    canInteract = function()
                                        if v.jobenb then 
                                            local loop = v.jobs
                                            for _, item in ipairs(loop) do
                                                if item == QT.getjob() then
                                                    if not isBusy then 
                                                        return true 
                                                    else
                                                        return false 
                                                    end
                                                end
                                            end
                                           else
                                                if not isBusy then 
                                                    return true 
                                                else
                                                    return false 
                                                end
                                           end
                                    end,
                                }
                            },
                            distance = 3.0
                        })
                    end
                end
            end
    end)
end

AddEventHandler('onClientResourceStart', function (resourceName)
    if(GetCurrentResourceName() ~= resourceName) then
      return
    end
    Wait(500) -- # because of auto insert from bridge/server/insert.lua its just because on first resource start to load everything fine :) enjoy 
    CreateTables()
end)

RegisterNetEvent("qt-crafting:Sync")
 AddEventHandler("qt-crafting:Sync", function()
    for i = 1, #objects do
        DeleteObject(objects[i])
    end
    CreateTables()
    for i = 1, #Blips do 
        RemoveBlip(Blips[i])
    end
end)

CraftMenu = function(id, name, coords)
    QT.TriggerCallback('qt-crafting:fetchItemsFromId', function(result)
        if result then
            local options = {}
            for i = 1, #result do
                local someData = result[i]
                local itemMetadata = {}

                for _, item in ipairs(someData.recipe) do
                    insert(itemMetadata, { label = item.label, value = item.amount})
                end

                options[#options + 1] = {
                    title = someData.item_label,
                    description = locales.items_recipe_desc .. someData.time .."s".. locales.recipe_exp,
                    icon = "nui://" .. Config.ImagePath .. someData.item .. ".png",
                    event = "qt-crafting:CraftCertainItem",
                    arrow = true,
                    metadata = itemMetadata,
                    args = { craft_item = someData.item, item_label = someData.item_label, time = someData.time, amount = someData.amount, recipe = someData.recipe, coords = coords}
                }
            end

            lib.registerContext({
                id = 'crafting' .. id,
                title = name,
                options = options,
            })

            lib.showContext('crafting' .. id)
        end
    end, id)
end 

local function ZoneCheck(v)
    local ply = GetEntityCoords(cache.ped)
    local dist = #(ply - vector3(v.x, v.y, v.z))
    if dist <= 3.0 then 
        return true 
    else
        return false
    end
end

AddEventHandler("qt-crafting:CraftCertainItem", function(data)

   QT.TriggerCallback("qt-crafting:CanCraftItem", function(canCraft)
        if canCraft then 
            isBusy = true 
            lib.requestAnimDict('mini@repair', 100)
            TaskPlayAnim(cache.ped, 'mini@repair', 'fixing_a_ped', 8.0, -8.0, -1, 2, 0, false, false, false)
        local craft_process = progress(locales.craftingg..data.item_label, data.time, "circle") 
            if craft_process then 
                isBusy = false 
                ClearPedTasksImmediately(cache.ped)
                for k, v in pairs (data.recipe) do 
                    TriggerServerEvent("qt-crafting:ItemInterval", "remove", v.item, v.amount)
                end
                TriggerServerEvent("qt-crafting:ItemInterval", "add", data.craft_item, data.amount)
                notification(locales.main_title, locales.successfull_crafted ..data.item_label.. locales.in_amount_of.. data.amount, types.success)
            else
                isBusy = false 
                notification(locales.main_title, locales.canceled_crafting_proccess, types.error)
                ClearPedTasksImmediately(cache.ped)
            end
        else
            notification(locales.main_title, locales.cannot_craft, types.error)
        end
    end, data.recipe) 

end)

BlipCreation = function(v, g)
    blip = AddBlipForCoord(vector3(g.x, g.y, g.z))
    SetBlipSprite(blip, v.sprite)
    SetBlipScale(blip, v.scale) 
    SetBlipColour(blip, v.colour) 
    SetBlipAsShortRange(blip, true)
    BeginTextCommandSetBlipName("STRING")
    AddTextComponentSubstringPlayerName(tostring(v.blip_label))
    EndTextCommandSetBlipName(blip)
    insert(Blips, blip)
end

