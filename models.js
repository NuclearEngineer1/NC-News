const db = require("./db/connection");
const format = require("pg-format");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((topics) => {
    return topics.rows;
  });
};

exports.selectArticles = () => {
  const promiseArray = [
    db.query(
      "SELECT author, title, article_id, topic, created_at, votes FROM articles ORDER BY created_at DESC;"
    ),
    db.query(
      "SELECT article_id, count(article_id) AS comment_count FROM comments GROUP BY article_id"
    ),
  ];
  return Promise.all(promiseArray).then((resultArray) => {
    resultArray[0].rows.forEach((article) => {
      const commentsFound = false;
      resultArray[1].rows.forEach((count) => {
        if (article.id === count.article_id) {
          article.comment_count = count.comment_count;
          commentsFound = true;
        }
      });
      if (!commentsFound) article.comment_count = 0;
    });
    return resultArray[0].rows;
  });
};

exports.selectArticleById = (req, res) => {
  const article_id = req.params.article_id;
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then((article) => {
      if (article.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "article does not exist",
        });
      } else {
        return { article: article.rows };
      }
    });
};

exports.selectCommentsByArticleId = (req) => {
  const article_id = req.params.article_id;
  const commentQuery = db.query("SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC", [article_id])
  const articleQuery = db.query("SELECT * FROM articles WHERE article_id = $1", [article_id])
  return Promise.all([commentQuery, articleQuery])
    .then((queryArray) => {
      if (queryArray[1].rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "article not found",
        });
      } else {
        return queryArray[0].rows;
      }
    });
};

exports.insertCommentByArticleId = (req) => {
  const commentInsertSQL = format(
    `INSERT INTO comments (body, author, article_id) VALUES %L RETURNING *;`,
    [[req.body.body, req.body.username, req.params.article_id]]
  );
  const article_id = req.params.article_id;
  const articleQuery = db.query(
    "SELECT * FROM articles WHERE article_id = $1",
    [article_id]
  );
  const commentQuery = db.query(commentInsertSQL);
  return Promise.all([articleQuery, commentQuery]).then((queryArray) => {
    if (queryArray[0].rowCount === 0) {
      console.log(queryArray[1].rows[0]);
      return Promise.reject({ status: 404, message: "article not found" });
    } else {
      console.log(queryArray[1].rows[0]);
      return queryArray[1].rows[0];
    }
  });
};
