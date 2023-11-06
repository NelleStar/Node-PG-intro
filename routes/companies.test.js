process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async () => {
  const result = await db.query(
    `INSERT INTO companies (code, name, description) VALUES ('walmart', 'Walmart', 'Superstore') RETURNING code, name, description`
  );
  testCompany
 = result.rows[0];
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

// GET routes
describe("GET /companies", function () {
  test("Get a list of companies", async function () {
    const res = await request(app).get(`/companies`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      companies: [testCompany],
    });
  });
});

describe("GET /companies/:code", function () {
  test("Get a single company", async function () {
    const res = await request(app).get(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: "walmart",
        name: "Walmart",
        description: "Superstore",
        invoices: expect.any(Array), 
      },
    });
  });

  test("Responds with a 404 for invalid code", async function () {
    const res = await request(app).get(`/companies/0`);
    expect(res.statusCode).toBe(404);
  });
});


// POST routes
describe("POST /companies", () => {
  test("Creates a single company", async () => {
    const res = await request(app)
      .post("/companies")
      .send({ code: 'meijer', name: "Meijer", description: "One stop shop" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {
        code: 'meijer',
        name: "Meijer",
        description: "One stop shop",
      },
    });
  });
});

// PATCH routes
describe("PATCH /companies/:code", () => {
  test("Updates a single company", async () => {
    const res = await request(app)
      .patch(`/companies/${testCompany.code}`)
      .send({ code: 'walmart', name: "Updated Walmart", description: "Updated Description" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: 'walmart',
        name: "Updated Walmart",
        description: "Updated Description",
      },
    });
  });
  test("Responds with a 404 for invalid code", async () => {
    const res = await request(app)
      .patch(`/companies/0`)
      .send({ name: "Target", description: "The best" });
    expect(res.statusCode).toBe(404);
  });
});

// DELETE routes
describe("DELETE /companies/:code", () => {
  test("Deletes a single company", async () => {
    const res = await request(app).delete(`/companies/${testCompany
    .code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: "DELETED!" });
  });
  //   test("Responds with a 404 for invalid id", async () => {
  //     const res = await request(app).delete(`/users/0`);
  //     expect(res.statusCode).toBe(404);
  //   });
});

// close DB connection
afterAll(async function () {
  await db.end();
});
