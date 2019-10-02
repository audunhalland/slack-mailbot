const express = require('express');
const PORT = process.env.PORT || 5000;

express()
  .get('/email-addresses', (req, res) => {
    res.send('my email!');
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
