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

const slackHeaderFormUrlEncoded = {
  'Content-Type': 'application/x-www-form-urlencoded',
};

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

const getConversationMembers = async (channelId, cursor) => {
  const requestBody = {
    channel: channelId,
    token: SLACK_BOT_USER_OAUTH_ACCESS_TOKEN,
    limit: 200,
    ...cursor && { cursor },
  };
  const response = await axios({
    url: `https://slack.com/api/conversations.members?${qs.stringify(requestBody)}`,
    method: 'GET',
  });
  return response.data;
};

const getAllConversationMemberIds = async (channelId) => {
  let all_members = [];
  let cursor = '';
  while (true) {
    const { members, response_metadata } = await getConversationMembers(channelId, cursor);
    all_members = all_members.concat(members);
    if (!response_metadata.next_cursor) return all_members;
    cursor = response_metadata.next_cursor;
  }
};

const getUsers = async (cursor) => {
  const requestBody = {
    token: SLACK_BOT_USER_OAUTH_ACCESS_TOKEN,
    limit: 200,
    ...cursor && { cursor },
  }
  const response = await axios({
    url: `https://slack.com/api/users.list?${qs.stringify(requestBody)}`,
    method: 'GET',
  });
  return response.data;
};

const getAllUsers = async () => {
  let all_users = [];
  let cursor = '';
  while (true) {
    const { members, response_metadata } = await getUsers(cursor);
    all_users = all_users.concat(
      members.map(member => (
        {
          id: member.id,
          email: member.profile.email,
          name: member.name,
          real_name: member.profile.real_name,
        }
      ))
    );
    if (!response_metadata.next_cursor) return all_users;
    cursor = response_metadata.next_cursor;
  }
};

const getConversationUsers = async (channel_id) => {
  const [member_ids, users] = await Promise.all([
    getAllConversationMemberIds(channel_id),
    getAllUsers()
  ]);

  console.log(`member count: ${member_ids.length} user count: ${users.length}`);

  const usersById = users.reduce((agg, user) => ({
    ...agg,
    [user.id]: user,
  }), {});

  return member_ids
    .map(member_id => {
      const user = usersById[member_id];
      if (user) return user;
      return {
        id: member_id,
        email: null,
        name: null,
        real_name: null,
      };
    });
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
    //await authTest();
    try {
      const users = await getConversationUsers(channel_id);
      const emails = users
        .map(user => user.email)
        .filter(email => !!email);
      const usersWithoutEmail = users
        .filter(user => !user.email);

      const emailString = `addresses for members in this conversation: ${emails.join(', ')}`;

      if (usersWithoutEmail.length > 0) {
        const errorUserNames = usersWithoutEmail
          .filter(user => user.name)
          .map(user => `@${user.name}`);
        const usersWithoutName = usersWithoutEmail
          .filter(user => !user.name);
        res.send(`${emailString} -- Could not find email address for ${errorUserNames.join(', ')}. ${usersWithoutName.length} users missing profile info`);
      } else {
        res.send(emailString);
      }
    } catch (error) {
      console.error('problem with slack API: ', error);
      res.send(`Trøbbel på serveren :(`);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
