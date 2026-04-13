module.exports = {
    apps: [
        {
            name: 'frontendwtp',
            cwd: '/home/www/frontend-wtp',
            script: 'build/index.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
                HOST: '0.0.0.0',
                PORT: 4137,
                ORIGIN: 'https://topupin.store'
            }
        }
    ]
};