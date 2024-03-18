AddEventHandler('onServerResourceStart', function(resourceName)
    if resourceName == GetCurrentResourceName() then
     MySQL.Sync.execute([[
        CREATE TABLE IF NOT EXISTS `qt-crafting` (
            `craft_id` int(11) NOT NULL AUTO_INCREMENT,
            `craft_name` varchar(50) DEFAULT NULL,
            `crafting` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`crafting`)),
            `blipdata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`blipdata`)),
            `jobs` longtext DEFAULT NULL,
            PRIMARY KEY (`craft_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    ]])
    MySQL.Sync.execute([[
        CREATE TABLE IF NOT EXISTS `qt-crafting-items` (
            `craft_id` int(11) DEFAULT NULL,
            `item` varchar(50) DEFAULT NULL,
            `item_label` varchar(50) DEFAULT NULL,
            `recipe` longtext DEFAULT NULL,
            `time` int(11) DEFAULT NULL,
            `amount` int(11) DEFAULT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    ]])
    end
end)
