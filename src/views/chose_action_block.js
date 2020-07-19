const chose_action = [
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "Please decide the action you want to do."
        }
    },
    {
        "type": "actions",
        "elements": [
            {
                "action_id": "open_get_score_model",
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": "Get Score"
                },
                "style": "primary",
                "value": "a"
            },
            {
                "type": "button",
                "action_id": "open_connect_model",
                "text": {
                    "type": "plain_text",
                    "emoji": true,
                    "text": "Connect"
                },
                "style": "danger",
                "value": "b"
            }
        ]
    }
]

module.exports = chose_action
