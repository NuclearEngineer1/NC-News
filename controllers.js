const {
  selectTopics,
  selectArticles,
  selectArticleById,
  selectCommentsByArticleId,
  insertCommentByArticleId,
  selectUsers,
  updateVotesByArticleId
} = require("./models");

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  selectArticles(req.query)
    .then((articles) => {
      res.send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleById = (req, res, next) => {
  selectArticleById(req)
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentsByArticleId = (req, res, next) => {
  selectCommentsByArticleId(req)
    .then((comments) => {
      res.send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};


exports.postCommentByArticleId = (req, res, next) => {
  const article_id = req.params.article_id;
  const postRequest = { ...req.body };
  insertCommentByArticleId(article_id, postRequest)
    .then((comment) => {
      res.status(201);
      res.send(comment);
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchVotesByArticleId = (req, res, next) => {
  const article_id = req.params.article_id;
  const postRequest = { ...req.body };
  updateVotesByArticleId(article_id, postRequest)
    .then((article) => {
      res.status(200);
      res.send(article);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getUsers = (req, res, next) => {
  const queries = { ...req.query }
  selectUsers(queries)
    .then((users) => {
      res.send({ users });
    })
    .catch((err) => {
      next(err);
    });
};

exports.handlePSQL400s = (res) => {
  res.status(400);
  res.send({ msg: "bad request" });
};

exports.handlePSQL404s = (res) => {
  res.status(404);
  res.send({ msg: "not found" });
};
