fx_version 'cerulean'
game 'gta5'
description 'crafting_system'
author 'QT Store'
lua54 'yes'

shared_scripts {
    'shared/*.lua',
    '@ox_lib/init.lua',
    'bridge/framework.lua',
}

client_scripts {
    'bridge/client/*.lua',
    'cl_utils.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'bridge/server/*.lua',
    'sv_utils.lua',
}

dependencies {
    'oxmysql',
    'ox_lib',
}

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/assets/*.js',
    'web/dist/assets/*.css',
    'web/dist/*.js', -- Sometimes images or chunks can be here
}
