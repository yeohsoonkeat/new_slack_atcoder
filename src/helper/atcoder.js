const _ = require('lodash')
const { TIMEOFSET }= require('../config')

/**
 * Helper function to simplify data
 * @param {2D-Arrays} datas 
 * @returns {Arrays} [dateObj, name, date, start_time, end_time, range]
 */

const simplify_data = (datas) => {
    const contests = []
    datas = _.chunk(datas, 4)
    for (const data of datas) {
        const [time, name, duration, range] = data
        const dateObj = new Date(time)
        dateObj.setMinutes(dateObj.getMinutes()+dateObj.getTimezoneOffset())
        dateObj.setMinutes(dateObj.getMinutes() + TIMEOFSET)
        const [date,hour, minutes ] = [dateObj.toDateString(), dateObj.getHours(), dateObj.getMinutes()]
        const [dur_h, dur_m] = duration.split(":").map(x => parseInt(x))
        const start_time = `${hour}:${minutes!=0?minutes: "00"}`
        dateObj.setHours(hour + dur_h, minutes +  dur_m)
        const end_time = `${dateObj.getHours()}:${dateObj.getMinutes()}`
        contests.push([dateObj, name, date, start_time, end_time, range])
    }
    return contests
}

/**
 * Helper function to check if we execute the update
 * @param {Date} latest_contest
 * @returns {Boolean} should update data
*/

const contest_rated = (latest_contest) => {
    const dateObj = new Date()
    dateObj.setMinutes(dateObj.getMinutes()+dateObj.getTimezoneOffset())
    dateObj.setMinutes(dateObj.getMinutes() + TIMEOFSET)
    console.log(dateObj.toDateString(), latest_contest.toDateString())
    if (dateObj.toDateString() !== latest_contest.toDateString()) {
        return false
    } else {
        const dif = Math.floor((dateObj.getTime() - latest_contest.getTime())/(1000*60))    
        return dif > 10 && dif <=30
    }
}

/**
 * Helper function to check if we should notify user
 * @param {Date} contest_date 
 * @returns {Boolean|Integer} time until contest or false
 */

const new_contest_check = (contest_date) => {
    const dateObj = new Date()
    dateObj.setMinutes(dateObj.getMinutes()+dateObj.getTimezoneOffset())
    dateObj.setMinutes(dateObj.getMinutes() + TIMEOFSET)
    if (dateObj.toDateString() !== contest_date.toDateString()) {
        return false
    }
    else {
        const dif = Math.floor((contest_date.getTime() - dateObj.getTime())/(1000*60))    
        return dif <= 59? dif: false
    }
}

module.exports = {
    simplify_data,
    new_contest_check,
    contest_rated
}
