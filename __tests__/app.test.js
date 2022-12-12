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
        expect(topics).toHaveLength(3)
        topics.forEach((topic) => {
          expect(
            topic).toEqual(
              expect.objectContaining({
                slug: expect.any(String),
                description: expect.any(String),
              })
            )
        });
        });
      });
  })
