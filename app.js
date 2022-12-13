const express = require("express");
const { getTopics, getArticles, getArticleById } = require("./controllers");

const app = express();

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.use((err, req, res, next) => {
  if (err.code === '22P02') { 
    res.status(400)
    res.send({ msg: 'bad request' })
  } else {
    next(err)
  }
}) 

app.use((err, req, res, next) => {
  if (err.msg !== undefined) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err)
  res.status(500)
  res.send({ msg: "Internal Server Error" });
});

module.exports = app;
