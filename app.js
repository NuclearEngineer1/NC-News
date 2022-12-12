const express = require("express");
const { getTopics, getArticles } = require('./controllers')

const app = express();

app.get('/api/topics', getTopics)

app.get("/api/articles", getArticles);

app.use((err, req, res, next) => {
  console.log(err)
  res.sendStatus(500).send({ msg: 'Internal Server Error' });
});

module.exports = app