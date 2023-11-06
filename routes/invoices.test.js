process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testInvoices;

beforeEach(async () => {
  const company  = await db.query (
    `INSERT INTO companies(code, name, description) VALUES ('apple', 'Apple', 'Software Co')`
  );

  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('apple', 300, true, '2018-01-01') RETURNING id, comp_code, amt, paid, add_date, paid_date`
  );

  testInvoices = result.rows[0];
});


afterEach(async () => {
  await db.query(`DELETE FROM invoices`);
  await db.query(`DELETE FROM companies`);
});

// GET routes
describe("GET /invoices/:id", function () {
  test("Get a single company", async function () {
    const res = await request(app).get(`/invoices/${testInvoices.id}`);
    expect(res.statusCode).toBe(200);
  });
  test("Responds with a 404 for invalid id", async function () {
    const res = await request(app).get(`/invoices/0`);
    expect(res.statusCode).toBe(404);
  });
});

// POST routes
describe("POST /invoices", () => {
  test("Creates a single invoice", async () => {
    const newInvoice = {
      comp_code: "apple",
      amt: 100,
      paid: false,
      paid_date: null,
    };

    const res = await request(app).post("/invoices").send(newInvoice);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      invoice: {
        id: expect.any(Number),
        comp_code: newInvoice.comp_code,
        amt: newInvoice.amt,
        paid: newInvoice.paid,
        paid_date: newInvoice.paid_date,
        add_date: newInvoice.add_date,
      },
    });
  });
});


// close DB connection
afterAll(async function () {
  await db.end();
});
