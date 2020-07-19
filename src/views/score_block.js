const _ = require("lodash")

const chose_user = [
  {
    type: "input",
    block_id: "users",
    element: {
      type: "multi_users_select",
      action_id: "select_user",
      placeholder: {
        type: "plain_text",
        text: "Select users",
        emoji: true
      }
    },
    label: {
      type: "plain_text",
      text: "Chose the user to get score",
      emoji: true
    }
  }
]

const page_num = (page, max) => {
  return {
    "type": "section",
    "fields": [
      {
        "type": "plain_text",
        "text": " "
      },
      {
        "type": "plain_text",
        "text": `${page}/${max}`,
        "emoji": true
      }
    ]
  }
}

const page_button = (page, subteam="") => [
  {
    "type": "actions",
    "elements": [
      {
        "action_id": `${subteam}pre_${page}`,
        "type": "button",
        "text": {
          "type": "plain_text",
          "emoji": true,
          "text": "Previous"
        },
        "value": `${page}`
      },
      {
        "type": "button",
        "action_id": `${subteam}next_${page}`,
        "text": {
          "type": "plain_text",
          "emoji": true,
          "text": "Next"
        },
        "style": "primary",
        "value": `${page}`
      }
    ]
  }
]


const scoresGroup = (userlist, page, max_page, ids) => {
  // const sortedList = userlist.sort((a, b) => b.highest_score - a.highest_score);
  const groups = ids.map(x => `<!subteam^${x}>`)
  const fields = []
  const initial = (page - 1) * 5
  userlist.forEach((e, i) => {
    const field = [
      {
        "type": "mrkdwn",
        "text": ` ${i + initial + 1}. *Student:* ${e.user}`
      },
      {
        "type": "mrkdwn",
        "text": `*Atcoder Name:* ${e.atcoder_username}`
      }
    ]
    if (e.highest_score >= 0) {
      field.push(
        {
          "type": "mrkdwn",
          "text": `*Highest Score:* ${e.highest_score}`
        },
        {
          "type": "mrkdwn",
          "text": `*Number of Competition:* ${e.num_competitions}`
        }
      )
    }
    const obj = {
      type: "section",
      fields: field
    }
    fields.push({
      type: "divider"
    }, obj)
  })
  return [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*Ranking of ${groups.join(", ")} members* (sorted by _highest score_)`
      }
    },
    ...fields,
    {
      type: "divider"
    },
    ...page_button(page, "sub_"),
    page_num(page, max_page)
  ]
}

const scoresList = (userlist, page, max_page) => {
  // const sortedList = userlist.sort((a, b) => b.highest_score - a.highest_score);
  const fields = []
  const initial = (page - 1) * 5
  userlist.forEach((e, i) => {
    const field = [
      {
        "type": "mrkdwn",
        "text": ` ${i + initial + 1}. *Student:* ${e.user}`
      },
      {
        "type": "mrkdwn",
        "text": `*Atcoder Name:* ${e.atcoder_username}`
      }
    ]
    if (e.highest_score >= 0) {
      field.push(
        {
          "type": "mrkdwn",
          "text": `*Highest Score:* ${e.highest_score}`
        },
        {
          "type": "mrkdwn",
          "text": `*Number of Competition:* ${e.num_competitions}`
        }
      )
    }
    const obj = {
      type: "section",
      fields: field
    }
    fields.push({
      type: "divider"
    }, obj)
  })
  return [
    ...chose_user,
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Ranking of selected user* (sorted by _highest score_)"
      }
    },
    ...fields,
    {
      type: "divider"
    },
    ...page_button(page),
    page_num(page, max_page)
  ]
}

module.exports = {
  chose_user,
  scoresList,
  scoresGroup
}
