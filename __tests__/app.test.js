const app = require("../app.js");
const request = require("supertest");
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection");

afterAll(() => db.end());

beforeEach(() => seed(testData));

describe("GET /api/topics", () => {
  test("returns 200 and a list of topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics).toBeInstanceOf(Array);
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
});

describe("GET /api/articles", () => {
  test("returns 200 and a list of articles sorted descending by date", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
          coerce: true,
        });
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(12);
        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });
  test("returns 200 and relevant article when queried", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sort_by=article_id&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("article_id");
        expect(articles).toHaveLength(11);
        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: "mitch",
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });
  test("defaults to descending date when only topic query given", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
          coerce: true,
        });
      });
  });
  test("returns 400 for invalid query", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sort_by=temperament&order=sideways")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("returns 404 for topic does not exist", () => {
    return request(app)
      .get("/api/articles?topic=emus")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toEqual("not found");
      });
  });
  test("returns 400 for invalid sort_by", () => {
    return request(app)
      .get("/api/articles?sort_by=banana")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toEqual("bad request");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("responds with 200 and corresonding article", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: article }) => {
        expect(article).toEqual(
          expect.objectContaining({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 100,
            comment_count: "11",
          })
        );
      });
  });

  test("responds with 400 when given invalid article_id", () => {
    return request(app)
      .get("/api/articles/banana")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("responds with 404 when given valid but non existent article_id", () => {
    return request(app)
      .get("/api/articles/1000000")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("responds with 200 and corresonding comment array", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy("created_at", {
          descending: true,
          coerce: true,
        });
        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(11);
        comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              body: expect.any(String),
            })
          );
        });
      });
  });
  test("responds with 400 when given invalid article_id", () => {
    return request(app)
      .get("/api/articles/banana/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("responds with 404 when given valid but non existent article_id", () => {
    return request(app)
      .get("/api/articles/1000000/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("article not found");
      });
  });

  test("responds with 200 and [] when article has no comments", () => {
    return request(app)
      .get("/api/articles/7/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("responds with 201 and corresonding comment", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
        body: "this article sucks",
      })
      .expect(201)
      .then(({ body: comment }) => {
        expect(comment).toBeInstanceOf(Object);
        expect(comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            author: "butter_bridge",
            created_at: expect.any(String),
            votes: 0,
            body: "this article sucks",
          })
        );
      });
  });
  test("responds with 400 when given invalid article_id", () => {
    return request(app)
      .post("/api/articles/banana/comments")
      .send({
        username: "butter_bridge",
        body: "this article sucks",
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("responds with 404 when given valid but non existent article_id", () => {
    return request(app)
      .post("/api/articles/1000000/comments")
      .send({
        username: "",
        body: "this article sucks",
      })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("responds with 400 when missing a property", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("responds with 400 when property in wrong data type", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
        body: null,
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("responds with 404 when user does not exist", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "madman123",
        body: "this article sucks",
      })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
});

describe("GET /api/users", () => {
  test("returns 200 and a list of users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toBeInstanceOf(Array);
        expect(users).toHaveLength(4);
        users.forEach((users) => {
          expect(users).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("responds with 200 and updated article", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({
        inc_votes: 5,
      })
      .expect(200)
      .then(({ body: article }) => {
        expect(article.votes).toBe(105);
      });
  });
  test("responds with 400 when given invalid article_id", () => {
    return request(app)
      .patch("/api/articles/banana")
      .send({
        inc_votes: 5,
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("responds with 404 when given valid but non existent article_id", () => {
    return request(app)
      .patch("/api/articles/1000000")
      .send({
        inc_votes: 5,
      })
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("responds with 400 when missing a property", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("responds with 400 when property is wrong data type", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({
        inc_votes: null,
      })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("returns 204 no content", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(({ body: response }) => {
        expect(response).toEqual({});
      });
  });
  test("returns 400 when invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/banana")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("returns 404 when comment not found", () => {
    return request(app)
      .delete("/api/comments/10000")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
});

describe("*", () => {
  test("returns 404 when given an invalid end point", () => {
    return request(app)
      .get("/banana")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
});
