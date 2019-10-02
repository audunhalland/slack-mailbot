const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const qs = require('querystring');

const PORT = process.env.PORT || 5000;

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID || '';
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET || '';
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET || '';

const SLACK_OAUTH_ACCESS_TOKEN = process.env.SLACK_OAUTH_ACCESS_TOKEN || '';
const SLACK_BOT_USER_OAUTH_ACCESS_TOKEN = process.env.SLACK_BOT_USER_OAUTH_ACCESS_TOKEN || '';

const slackOutgoingConfig = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Bearer ${SLACK_BOT_USER_OAUTH_ACCESS_TOKEN}`,
  }
};

const authTest = async (token) => {
  const response = await axios({
    url: 'https://slack.com/api/auth.test',
    method: 'GET',
    data: qs.stringify({}),
    ...slackOutgoingConfig,
  });
  console.log('auth test response: ', response.data);
};

const getConversationMembers = async (channelId, token) => {
  const requestBody = {
    channel: channelId,
    token: SLACK_BOT_USER_OAUTH_ACCESS_TOKEN,
  };
  const response = await axios({
    url: 'https://slack.com/api/conversations.members',
    method: 'GET',
    data: qs.stringify(requestBody),
    ...slackOutgoingConfig,
  });
  const data = response.data;
  return data;
};

express()
  .get('/test', (req, res) => {
    res.send(`my bot with id ${SLACK_CLIENT_ID}`);
  })
  .post('/email-addresses', bodyParser.urlencoded({ extended: false }), async (req, res) => {
    const {
      token,
      team_id,
      team_domain,
      channel_id,
      channel_name,
      user_id,
      user_name,
      command,
      text,
      response_url,
      trigger_id,
    } = req.body;
    await authTest();
    try {
      const members = await getConversationMembers(channel_id, token);
      console.log('members: ', members);
    } catch (error) {
      console.error('problem with slack API: ', error);
    }
    res.send(`my bot with id ${SLACK_CLIENT_ID}`);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
