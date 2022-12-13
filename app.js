const express = require("express");
const { getTopics, getArticles, getArticleById } = require("./controllers");

const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.use((err, req, res, next) => {
  console.log(err);
  res.sendStatus(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
