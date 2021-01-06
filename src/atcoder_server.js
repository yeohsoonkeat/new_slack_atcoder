// depencies
const { App } = require("@slack/bolt")
const CronJob = require('cron').CronJob
const path = require('path')
const { AtCoder, EventHandler, DBHandler, Subteam, Sheet } = require('./Handler')
const { SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, PORT } = require('./config')

// Slack App
const app = new App({
    token: SLACK_BOT_TOKEN,
    signingSecret: SLACK_SIGNING_SECRET,
    endpoints: {
        commands: "/slack/commands",
        actions: "/slack/actions"
    }
})

// Handler Objects
const DOP = new DBHandler()
const AOP = new AtCoder(DOP)
const subteam = new Subteam(app, SLACK_BOT_TOKEN)
const sheet = new Sheet(DOP, subteam)
const eventHandler = new EventHandler(app, AOP, DOP, subteam, sheet)

// Slack Listeners

// command listeners
app.command("/atcoder", event => eventHandler.commandChoseAction(event))

// action listeners
app.action("open_connect_model", event => eventHandler.openConnectModal(event))
app.action("open_get_score_model", event => eventHandler.choseUser(event))
app.action("generate_token", event => eventHandler.generateToken(event))
// pagination of scorelist
app.action(/^next_[0-9]+/g, event => eventHandler.nextPage(event))
app.action(/^sub_next_[0-9]+/g, event => eventHandler.subNextPage(event))
app.action(/^pre_[0-9]+/g, event => eventHandler.prePage(event))
app.action(/^sub_pre_[0-9]+/g, event => eventHandler.subPrePage(event))

// view submit listeners
app.view("connect_submit", event => eventHandler.connectSubmited(event))
app.view(/^show_score_[0-9]+/g, event => eventHandler.viewScore(event))

// Error Listener
app.error(err => console.log(err))

// Start App
app.start(PORT || 3000).then(() => console.log("bolt running"))

// Serves public on root route
app.receiver.app.get("/atcoder", (_, res) => res.sendFile(path.join(__dirname + '/public/index.html')))



const initial = async () => {
    const should_check = await AOP.should_check_update()
    console.log("should check: "+should_check)
    if (should_check) {
        const should_update = await AOP.should_update_sheet()
        console.log("should update: "+should_update)
        if (should_update) {
            sheet.fullUpdate()
        }
    }
}
initial()


const checkForNewContest = new CronJob('0 * * * *', () => {
    const contest = AOP.checkForContestNotification()
    if (contest) {
        eventHandler.notify_new_contest(contest)
    }
})

const updateData = new CronJob('*/10 * * * *', async () => {
    const should_check = await AOP.should_check_update()
    console.log("should check: "+should_check)
    if (should_check) {
        const should_update = await AOP.should_update_sheet()
        console.log("should update: "+should_update)
        if (should_update) {
            sheet.fullUpdate()
        }
    }
})
updateData.start()
