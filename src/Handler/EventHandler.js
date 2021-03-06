const { chose_action, connect_blocks, score_blocks } = require('../views')
const short = require('short-uuid')

class EventHandler {
    constructor(app, aop, dop, subteam, sheet) {
        this.app = app
        this.AOP = aop
        this.DOP = dop
        this.subteam = subteam
        this.sheet = sheet
    }

    _displayModal(botToken, trigger_id, modal, callback_id, submit = "Submit") {
        const option = {
            token: botToken,
            trigger_id,
            view: {
                type: "modal",
                title: {
                    type: "plain_text",
                    text: "AtCoder"
                },
                blocks: [...modal]
            }
        }
        if (submit) {
            (option["view"]["callback_id"] = callback_id),
                (option["view"]["submit"] = {
                    type: "plain_text",
                    text: submit
                })
        }
        return this.app.client.views.open(option)
    }


    async notify_new_contest(contest_list) {
        for (const contest of contest_list) {
            // later don't feel like it now
        }
    }

    async commandChoseAction({ context, body, command, ack, respond }) {
        await ack()
        const { text } = command
        // Does the command have argument
        if (text) {
            if (text.match(/backup/gi)) {
                this.sheet.backup()
                return
            }

            else if (text.match(/tosheet/gi)) {
                this.sheet.fullUpdate()
                return
            }
            else if (text.match(/updateDB/gi)) {
	      const should_update = await this.AOP.should_update_sheet()
              console.log("should updatedb: "+should_update)
              if (should_update) {
                this.sheet.fullUpdate()
              }
            }

            else if (text.match(/subteam\^/gi)) {
                const subteam_ids = text.match(/([A-Z])\w+/g)
                const members = []
                for (const subteam_id of subteam_ids) {
                    const tmp = await this.subteam.getUsersByGroup(subteam_id)
                    members.push(...tmp)
                }
                const scores = await this.AOP.getStudentList(members)
                this._displayModal(context.botToken, body.trigger_id, score_blocks.scoresGroup(scores[0], 1, scores.length, subteam_ids), "show_score_1", false)
                return
            }
        }

        // response to command without arguement
        respond({
            blocks: chose_action
        })
    }

    async openConnectModal({ ack, context, body }) {
        await ack()
        this._displayModal(context.botToken, body.trigger_id, connect_blocks.gen_mod, "connect", false)
    }

    async choseUser({ ack, context, body }) {
        await ack()
        this._displayModal(context.botToken, body.trigger_id, score_blocks.chose_user, "show_score_1")
    }

    async generateToken({ ack, body, context }) {
        await ack()
        const translator = short()
        const token = translator.generate()
        this.app.client.views
            .update({
                token: context.botToken,
                view_id: body.view.id,
                trigger_id: body.trigger_id,
                view: {
                    type: "modal",
                    callback_id: "connect_submit",
                    title: {
                        type: "plain_text",
                        text: "Channel Creator Help"
                    },
                    submit: {
                        type: "plain_text",
                        text: "Connect"
                    },
                    blocks: [...connect_blocks.after_gen(token)]
                }
            })
            .catch(err => console.log(err))
    }

    async connectSubmited({ ack, body, payload, view }) {
        const reg = /\`(.+)\`/g
        const token = reg.exec(view.blocks[3].text.text)[1]
        const atcoder_username = payload.state.values["username"]["username"].value
        const valid = await this.AOP.validate_user(atcoder_username, token)
        if (valid) {
            ack({
                response_action: "update",
                view: {
                    type: "modal",
                    title: {
                        type: "plain_text",
                        text: "Successful"
                    },
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "plain_text",
                                text:
                                    "The connection was successful.",
                                emoji: true
                            }
                        }
                    ]
                }
            })
            const detail = await this.AOP.getDetails(atcoder_username)
	    let current_score, highest_score, num_competitions, recent_competion
	    [, current_score, highest_score, , num_competitions, recent_competion] = !detail ? [0,0,0,0,0,null]: detail
            const record = {
                slack_id: body.user.id,
                atcoder_username,
                slack_username: body.user.name,
                highest_score,
                current_score,
                num_competitions,
                recent_competion: new Date(recent_competion)
            }
            await this.DOP.studentUpsert(record)
            this.sheet.fullupdate()
        } else {
            ack({
                response_action: "push",
                view: {
                    type: "modal",
                    title: {
                        type: "plain_text",
                        text: "Unsuccessful"
                    },
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "plain_text",
                                text:
                                    "The connection is unsuccessful. Please make sure the username is correct and updated the affiliation setting.\nIf you feel that you input correctly, please contact The developers.",
                                emoji: true
                            }
                        }
                    ]
                }
            })
        }
    }

    async nextPage({ ack, payload, context, body }) {
        await ack()
        const { selected_users } = body.view.state.values.users.select_user
        const k = await this.AOP.getStudentList(selected_users)
        const page = parseInt(payload.value)
        const new_callback = page < k.length ? `show_score_${page + 1}` : `show_score_${page}`
        const new_page = page < k.length ? page + 1 : page
        this.app.client.views
            .update({
                token: context.botToken,
                view_id: body.view.id,
                trigger_id: body.trigger_id,
                view: {
                    type: "modal",
                    callback_id: new_callback,
                    submit: {
                        type: "plain_text",
                        text: "Submit"
                    },
                    title: {
                        type: "plain_text",
                        text: "Score"
                    },
                    blocks: score_blocks.scoresList(k[new_page - 1], new_page, k.length)
                }
            })
    }

    async prePage({ ack, payload, context, body }) {
        await ack()
        const { selected_users } = body.view.state.values.users.select_user
        const k = await this.AOP.getStudentList(selected_users)
        const page = parseInt(payload.value)
        const new_callback = page < k.length ? `show_score_${page - 1}` : `show_score_${page}`
        const new_page = page >1 ? page - 1 : page
        console.log("k")
        this.app.client.views
            .update({
                token: context.botToken,
                view_id: body.view.id,
                trigger_id: body.trigger_id,
                view: {
                    type: "modal",
                    callback_id: new_callback,
                    submit: {
                        type: "plain_text",
                        text: "Submit"
                    },
                    title: {
                        type: "plain_text",
                        text: "Score"
                    },
                    blocks: score_blocks.scoresList(k[new_page - 1], new_page, k.length)
                }
            })
    }

    async subNextPage({ ack, payload, context, body }) {
        await ack()
        const page = parseInt(payload.value)
        const regexp = /\<\!subteam\^([A-Z0-9]+)\>/g
        const str = body.view.blocks[0].text.text
        const subteam_ids = str.match(regexp).map(x => x.replace(/\<\!subteam\^|\>/g, ''))
        const members = []
        for (const subteam_id of subteam_ids) {
            const tmp = await this.subteam.getUsersByGroup(subteam_id)
            members.push(...tmp)
        }
        const k = await this.AOP.getStudentList(members)
        const new_callback = page < k.length ? `show_score_${page + 1}` : `show_score_${page}`
        const new_page = page < k.length ? page + 1 : page
        this.app.client.views
            .update({
                token: context.botToken,
                view_id: body.view.id,
                trigger_id: body.trigger_id,
                view: {
                    type: "modal",
                    callback_id: new_callback,
                    submit: {
                        type: "plain_text",
                        text: "Submit"
                    },
                    title: {
                        type: "plain_text",
                        text: "Score"
                    },
                    blocks: score_blocks.scoresGroup(k[new_page - 1], new_page, k.length,subteam_ids)
                }
            })

    }

    async subPrePage({ ack, payload, context, body }) {
        await ack()
        const page = parseInt(payload.value)
        const regexp = /\<\!subteam\^([A-Z0-9]+)\>/g
        const str = body.view.blocks[0].text.text
        const subteam_ids = str.match(regexp).map(x => x.replace(/\<\!subteam\^|\>/g, ''))
        const members = []
        for (const subteam_id of subteam_ids) {
            const tmp = await this.subteam.getUsersByGroup(subteam_id)
            members.push(...tmp)
        }
        const k = await this.AOP.getStudentList(members)
        const new_callback = page < k.length ? `show_score_${page - 1}` : `show_score_${page}`
        const new_page = page >1 ? page - 1 : page
        this.app.client.views
            .update({
                token: context.botToken,
                view_id: body.view.id,
                trigger_id: body.trigger_id,
                view: {
                    type: "modal",
                    callback_id: new_callback,
                    submit: {
                        type: "plain_text",
                        text: "Submit"
                    },
                    title: {
                        type: "plain_text",
                        text: "Score"
                    },
                    blocks: score_blocks.scoresGroup(k[new_page - 1], new_page, k.length,subteam_ids)
                }
            })
    }

    async viewScore({ ack, payload }) {
        const { selected_users } = payload.state.values.users.select_user
        const k = await this.AOP.getStudentList(selected_users)
        await ack({
            response_action: "update",
            view: {
                type: "modal",
                callback_id: "show_score_1",
                submit: {
                    type: "plain_text",
                    text: "Submit"
                },
                title: {
                    type: "plain_text",
                    text: "Score"
                },
                blocks: score_blocks.scoresList(k[0], 1, k.length)
            }
        })
    }
}

module.exports = {
    EventHandler
}
