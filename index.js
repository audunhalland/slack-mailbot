const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000;

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID || '';
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET || '';
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET || '';

const SLACK_OAUTH_ACCESS_TOKEN = process.env.SLACK_OAUTH_ACCESS_TOKEN || '';
const SLACK_BOT_USER_OAUTH_ACCESS_TOKEN = process.env.SLACK_BOT_USER_OAUTH_ACCESS_TOKEN || '';

express()
  .get('/test', (req, res) => {
    res.send(`my bot with id ${SLACK_CLIENT_ID}`);
  })
  .post('/email-addresses', bodyParser.urlencoded({ extended: false }), (req, res) => {
    console.log('received body: ', req.body);
    res.send(`my bot with id ${SLACK_CLIENT_ID}`);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
