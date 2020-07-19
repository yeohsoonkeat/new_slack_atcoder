const generate_modal = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "Put the token into *<https://atcoder.jp/settings|Affiliation>* in AtCoder profile setting."
      },
      accessory: {
        action_id: "generate_token",
        type: "button",
        text: {
          type: "plain_text",
          text: "Generate Token",
          emoji: true
        },
        value: "generate"
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "For more info, contact <yeohsoonkeat@kit.edu.kh>"
        }
      ]
    }
  ];
  
  const after_generate = token => [
    {
      type: "input",
      block_id:"username",
      element: {
        type: "plain_text_input",
        action_id: "username"
      },
      label: {
        type: "plain_text",
        
        text: "AtCoder Username",
        emoji: true
      }
    },
    generate_modal[0],
    {
      type: "divider"
    },
    {
      block_id:"verify",
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Token*: `(" + token + ")`"
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "For more info, contact <yeohsoonkeat@kit.edu.kh>"
        }
      ]
    }
  ];
  
module.exports = {
  gen_mod: generate_modal,
  after_gen: after_generate
};
