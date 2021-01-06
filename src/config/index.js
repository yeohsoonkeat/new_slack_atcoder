require('dotenv').config()

module.exports = {
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
    PORT: process.env.PORT,
    TIMEOFSET: parseInt(process.env.TIMEOFSET),
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/gm, '\n'),
    spreadSheetId: process.env.SPREADSHEET_ID,
    GROUP_NAMES:[
        'Batch 8 C SE',
        'Batch 8 B SE',
        'Batch 8 A SE',
        'Batch 7 SE',
        'Batch 6 A SE',
        'Batch 6 B SE',
        'Batch 6 C SE',
        'Batch 5 SE',
	'Batch 4 SE',
	'Batch 3 SE'
    ],
    GROUP_IDS: [
        'S010VENR1S5',
        'S010U0748AF',
        'S0115DM3YL8',
        'S0117DH8R39',
        'S0117AQDZPH',
        'S010SFUNTS6',
        'S01174YJL94',
        'S0115AA1KS4',
	'S010SHL5S4A',
	'S010TTKM0UB'
    ],
    development: {
        dialect: 'sqlite',
        storage: '.data/devDB.sqlite',
        debug: true
    },
    test: {
        dialect: 'sqlite',
        storage: ':memory:'
    },
    production: {
        dialect: 'sqlite',
        storage: '.data/AtCoder.sqlite',
        logging: false
    }
}
