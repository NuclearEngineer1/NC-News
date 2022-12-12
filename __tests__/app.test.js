const app = require("../app.js");
const request = require("supertest");
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const db  = require("../db/connection")

afterAll(() => db.end())

beforeEach(() => seed(testData))

describe('GET /api/topics', () => { 
  test('returns 200 and a list of topics', () => { 
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => { 
        expect(topics).toEqual([
          {
            description: "The man, the Mitch, the legend",
            slug: "mitch",
          },
          {
            description: "Not dogs",
            slug: "cats",
          },
          {
            description: "what books are made of",
            slug: "paper",
          },
        ]);

        })
      })
  })