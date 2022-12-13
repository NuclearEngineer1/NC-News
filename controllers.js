const { selectTopics, selectArticles, selectArticleById } = require("./models");

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
  selectArticles()
    .then((articles) => {
      res.send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleById = (req, res, next) => {
  selectArticleById(req)
    .then((articleRows) => {
      if (articleRows.length !== 0) {
        res.send({ articles: articleRows });
      } else {
        res.status(404)
        res.send({ msg: "article does not exist" });
      }
    })
    .catch((err) => {
      next(err);
    });
};
