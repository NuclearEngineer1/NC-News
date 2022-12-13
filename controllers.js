const {selectTopics, selectArticles} = require('./models')

exports.getTopics = (req, res, next) => {
  selectTopics().then((topics) => {
    res.send({ topics })
  }).catch((err) => {
    next(err)
  })
}

exports.getArticles = (req, res, next) => {
  selectArticles()
    .then((articles) => {
      res.send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};