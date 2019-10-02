const express = require('express');
const PORT = process.env.PORT || 5000;

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID || '';
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET || '';
const SLACK_SIGNING = process.env.SLACK_SIGNING_SECRET || '';

express()
  .get('/email-addresses', (req, res) => {
    res.send(`my bot with id ${SLACK_CLIENT_ID}`);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
