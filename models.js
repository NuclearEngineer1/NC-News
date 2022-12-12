const db = require("./db/connection");

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
