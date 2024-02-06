Config = {}
Config.Framework = "esx" -- # esx, qb
Config.Target = "ox_target" -- # ox_target, qb-target 
Config.OxProgress = true -- # if you 're using ox progress just change to true but if you 're using other progress you must to go into bridge/client/editable.lua
Config.ImagePath = "ox_inventory/web/images/" -- # where images for items will display

-- # inventory paths 

--[[
    "qb-inventory/html/images/"
    "lj-inventory/html/images/"
    "ox_inventory/web/images/"
    "qs-inventory/html/images/"
    "ps-inventory/html/images/"
]]

Config.Authorization = {
    ['user'] = {
        createtable = false,
        editmenu = false, 
    },
    ['admin'] = {
        createtable = true,
        editmenu = true, 
    },
    ['dev'] = {
        createtable = true,
        editmenu = true, 
    },
}

Config.Pfx = "craft:"
Config.CreateTableCommand = 'create'
Config.EditMenuCommand = 'edit'
Config.Debug = false -- # for debuging box zones