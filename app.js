const express = require("express");
const {
  getTopics,
  getArticles,
  getArticleById,
  getCommentsByArticleId,
  postCommentByArticleId,
} = require("./controllers");

const app = express();

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.use((err, req, res, next) => {
  if (err.msg) {
    res.status(err.status);
    res.send({ msg: err.msg });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23502") {
    console.log(err);
    res.status(400);
    res.send({ msg: "bad request" });
  } else if ((err.code = "23503")) {
    res.status(404);
    res.send({ msg: "not found" });
  }
  next(err);
});

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
