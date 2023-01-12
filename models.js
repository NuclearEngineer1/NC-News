const db = require("./db/connection");
const format = require("pg-format");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((topics) => {
    return topics.rows;
  });
};

exports.selectArticles = (queries) => {
  const SQLArray = [];
  let SQL = "SELECT * FROM articles;";
  let validSort_by = [
    "title",
    "topic",
    "author",
    "body",
    "created_at",
    "votes",
    "article_id",
  ];
  let validOrder = ["asc", "desc"];

  if (queries.sort_by && !validSort_by.includes(queries.sort_by)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  } else if (queries.order && !validOrder.includes(queries.order)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }

  if (Object.keys(queries).length === 1 && queries.topic) {
    SQL = "SELECT * FROM articles WHERE topic = $1 ORDER BY created_at DESC";
    SQLArray.push(queries.topic);
  } else if (Object.keys(queries).length === 1 && queries.sort_by) {
    SQL = `SELECT * FROM articles ORDER BY ${queries.sort_by} DESC`
  } else if (Object.keys(queries).length === 1 && queries.order === "asc") {
    SQL = "SELECT * FROM articles ORDER BY created_at ASC";
  } else if (Object.keys(queries).length === 1 && queries.order === "desc") {
    SQL = "SELECT * FROM articles ORDER BY created_at DESC";
  } else if (
    Object.keys(queries).length === 2 &&
    queries.topic &&
    queries.sort_by
  ) {
    SQL = `SELECT * FROM articles WHERE topic = $1 ORDER BY ${queries.sort_by} DESC`;
    SQLArray.push(queries.topic);
  } else if (
    Object.keys(queries).length === 2 &&
    queries.topic &&
    queries.order === "asc"
  ) {
    SQL = `SELECT * FROM articles WHERE topic = $1 ORDER BY ${queries.sort_by} ASC`;
    SQLArray.push(queries.topic);
  } else if (
    Object.keys(queries).length === 2 &&
    queries.topic &&
    queries.order === "desc"
  ) {
    SQL = `SELECT * FROM articles WHERE topic = $1 ORDER BY ${queries.sort_by} DESC`;
    SQLArray.push(queries.topic);
  } else if (
    Object.keys(queries).length === 2 &&
    queries.sort_by &&
    queries.order === "asc"
  ) {
    SQL = `SELECT * FROM articles ORDER BY ${queries.sort_by} asc`;
  } else if (
    Object.keys(queries).length === 2 &&
    queries.sort_by &&
    queries.order === "desc"
  ) {
    SQL = `SELECT * FROM articles ORDER BY ${queries.sort_by} desc`;
  } else if (
    (Object.keys(queries).length === 3 && queries.order === "asc")
  ) {
    SQL = `SELECT * FROM articles WHERE topic = $1 ORDER BY ${queries.sort_by} asc`
    SQLArray.push(queries.topic);
  } else if (Object.keys(queries).length === 3 && queries.order === "desc") {
    SQL = `SELECT * FROM articles WHERE topic = $1 ORDER BY ${queries.sort_by} desc;`;
    SQLArray.push(queries.topic);
  }

  let articleQuery = db.query(SQL, SQLArray);

  const promiseArray = [
    articleQuery,
    db.query(
      "SELECT article_id, count(article_id) AS comment_count FROM comments GROUP BY article_id;"
    ),
  ];

  return Promise.all(promiseArray).then((resultArray) => {
    if (resultArray[0].rows.length === 0) {
      return Promise.reject({status: 404, msg: 'not found'})
    }
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
  articleQuery = db.query("SELECT * FROM articles WHERE article_id = $1", [
    article_id,
  ]);
  commentQuery = db.query(
   "SELECT article_id, count(article_id) AS comment_count FROM comments WHERE article_id = $1 GROUP BY article_id;", [article_id]
  );

  return Promise.all([articleQuery, commentQuery]).then((resultArray) => {
    if (resultArray[0].rowCount === 0) {
      return Promise.reject({status:404, msg:'not found'})
    }
    resultArray[0].rows[0].comment_count = resultArray[1].rows[0].comment_count
    return resultArray[0].rows[0]
  })
};

exports.selectCommentsByArticleId = (req) => {
  const article_id = req.params.article_id;
  const commentQuery = db.query(
    "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC",
    [article_id]
  );
  const articleQuery = db.query(
    "SELECT * FROM articles WHERE article_id = $1",
    [article_id]
  );
  return Promise.all([commentQuery, articleQuery]).then((queryArray) => {
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

exports.insertCommentByArticleId = (article_id, postRequest) => {
  const commentInsertSQL = format(
    `INSERT INTO comments (body, author, article_id) VALUES %L RETURNING *;`,
    [[postRequest.body, postRequest.username, article_id]]
  );
  return db.query(commentInsertSQL).then((comment) => {
    return comment.rows[0];
  });

};

exports.updateVotesByArticleId = (article_id, postRequest) => {
  return db
    .query(
      "UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *",
      [postRequest.inc_votes, article_id]
    )
    .then((article) => {
      if (article.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "not found",
        });
      } else {
        return article.rows[0];
      }
    });
};

exports.selectUsers = () => {
  return db.query("SELECT * FROM users;").then((users) => {
    return users.rows;
  });
};

exports.deleteCommentModel = (comment_id) => {
  return db.query("DELETE FROM comments WHERE comment_id = $1 RETURNING *", [comment_id])
    .then((comment) => {
      if (comment.rowCount === 0) {
        return Promise.reject({ status: 404, msg: 'not found' })
      }
    })
}
