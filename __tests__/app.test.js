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
});

describe("GET /api/articles/:article_id", () => {
  test("responds with 200 and corresonding article", () => {
    return request(app)
      .get("/api/articles/7")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article[0]).toEqual(
          expect.objectContaining({
            article_id: 7,
            title: "Z",
            topic: "mitch",
            author: "icellusedkars",
            body: "I was hungry.",
            created_at: "2020-01-07T14:08:00.000Z",
            votes: 0,
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
        expect(msg).toBe("article does not exist");
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
