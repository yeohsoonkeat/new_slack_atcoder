const cheerio = require("cheerio")
const https = require("https")
const { simplify_data, new_contest_check, contest_rated } = require('../helper/atcoder')
const { TIMEOFSET } = require('../config')
const _ = require('lodash')

class AtcoderHandler {
  constructor(dop) {
    this.DOP = dop
  }

  _getPage(site="contests") {
    return new Promise((resolve, reject) => {
      https
        .get(`https://atcoder.jp/${site}/`, resp => {
          let data = ""
          resp.on("data", chunk => {
            data += chunk
          })
          resp.on("end", () => {
            resolve(data)
          })
        })
        .on("error", err => {
          reject(err)
        })
    })
  }


  async validate_user(user, token) {
    const html = await this._getPage(`users/${user}`)
    const $ = cheerio.load(html)
    const atcoderAffiliation = $("td.break-all").text()
    const hasToken = new RegExp(`\(${token}\)`, "g")
    return hasToken.test(atcoderAffiliation)
  }

  async _getContests() {
    const html = await this._getPage()
    const $ = cheerio.load(html)
    const contests = []
    $('#contest-table-upcoming > div > div > table > tbody td').each(function (i, _) {
      contests[i] = $(this).text().replace(/\n|\t/g, '')
    })
    return simplify_data(contests)
  }

  async checkForContestNotification() {
    const contests = await this._getContests()
    const notify = []
    for (const contest of contests) {
      const [dateObj, ...contestInfo] = contest
      const time = new_contest_check(dateObj)
      if (time) {
        notify.push(contestInfo)
      }
    }
    return notify.length > 0 ? notify : false
  }

  async should_check_update() {
    // done test
    const html = await this._getPage()
    const $ = cheerio.load(html)
    const latest_contest = new Date($("#contest-table-recent > div > div > table > tbody > tr:nth-child(1) > td:nth-child(1)").text())
    latest_contest.setMinutes(latest_contest.getMinutes() + latest_contest.getTimezoneOffset())
    latest_contest.setMinutes(latest_contest.getMinutes() + TIMEOFSET)
    const duration = $("#contest-table-recent > div > div > table > tbody > tr:nth-child(1) > td:nth-child(3)").text()
    const [dur_h, dur_m] = duration.split(":").map(x => parseInt(x))
    latest_contest.setHours(latest_contest.getHours() + dur_h, latest_contest.getMinutes() + dur_m)
    console.log(latest_contest.toTimeString())
    return contest_rated(latest_contest)
  }

  async getDetails(user){
    const html = await this._getPage(`users/${user}`)
    const $ = cheerio.load(html)
    const k = $('#main-container > div.row > div.col-md-9.col-sm-12 > table tr').text()
    return k.replace(/\n|\t|\([\+0-9a-z\s]+\)/g,'').match(/\s?([0-9]+\/?[0-9]*\/?[0-9]*)/g)
  }

  async getStudentList(members) {
    const atcoder = await this.DOP.getStudentInBulk(members)
    const registered = Object.keys(atcoder)
    const data = []
    for (const user of members) {
      if (registered.includes(user)) {
        const [, atcoder_username, highest_score, num_competitions] = atcoder[user]
        data.push({ user: `<@${user}>`, atcoder_username, highest_score, num_competitions })
      } else {
        data.push({ user: `<@${user}>`, atcoder_username: "Not Registered", highest_score:-1})
      }
    }
    data.sort((a,b) => b.highest_score - a.highest_score)
    return _.chunk(data, 5)
  }

  async should_update_sheet(){
    let update = false
    const students = await this.DOP.getAllStudent()
    for (const student of students){
      const {atcoder_username, slack_id, slack_username, highest_score,current_score, num_competitions} = student
      const [, current_score_a, highest_score_a, , num_competitions_a, recent_competion_a] = await this.getDetails(atcoder_username)
      if (highest_score!=highest_score_a || num_competitions!=num_competitions_a || current_score!=current_score_a){
        update= true
        await this.DOP.studentUpsert({
          slack_id,
          atcoder_username,
          slack_username,
          highest_score: highest_score_a,
          current_score: current_score_a,
          num_competitions: num_competitions_a,
          recent_competion: new Date(recent_competion_a)
      })
      }
    }
    return update
  }

}

module.exports = {
  AtcoderHandler
}
