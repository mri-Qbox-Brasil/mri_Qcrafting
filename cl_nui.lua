
-- NUI Callbacks
RegisterNUICallback('close', function(_, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

RegisterNUICallback('craftItem', function(data, cb)
    local itemId = data.itemId

end)