const express = require("express");
const {
  getTopics,
  getArticles,
  getArticleById,
  getCommentsByArticleId,
  postCommentByArticleId,
  handlePSQL400s,
  handlePSQL404s,
  getUsers,
  deleteComment,
  patchVotesByArticleId,
} = require("./controllers");


const app = express();

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentByArticleId);


app.get("/api/users", getUsers);


app.delete("/api/comments/:comment_id", deleteComment)

app.patch("/api/articles/:article_id", patchVotesByArticleId)


app.use((err, req, res, next) => {
  if (err.msg) {
    res.status(err.status);
    res.send({ msg: err.msg });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23502") {
    handlePSQL400s(res)
  } else if ((err.code = "23503")) {
    handlePSQL404s(res)
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.msg !== undefined) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  };
})

app.use((err, req, res, next) => {
  res.status(500)
  res.send({ msg: "Internal Server Error" });
});

module.exports = app;
