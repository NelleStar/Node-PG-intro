const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// GET invoices
router.get("/", async function(req, res, next){
  try {
    const results = await db.query(
      `SELECT * FROM invoices`);
    return res.json({ invoices: results.rows });
  }
  catch(err) {
    return next(err);
  };
});

// GET invoice
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);

    if (results.rows.length === 0) {
      throw new ExpressError(`No invoice found with id of ${id}`, 404);
    }

    return res.send({ invoice: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// POST invoice
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt, paid, add_date, paid_date } = req.body;
    const results = await db.query(
      `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [comp_code, amt, paid, add_date, paid_date]
    );
    return res.status(201).json({ invoice: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// PATCH invoice
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt, paid } = req.body;
    let paid_date = null; 

    if (paid) {
      paid_date = new Date().toISOString();
    }

    const results = await db.query(
      `UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING *`,
      [amt, paid, paid_date, id]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(`No invoice found with id ${id}`, 404);
    }

    const invoice = results.rows[0];
    return res.json({ invoice });
  } catch (err) {
    return next(err);
  }
});


// DELETE invoice
router.delete("/:id", async (req, res, next) => {
  try {
    const results = db.query(`DELETE FROM invoices WHERE id = $1`, [
      req.params.id,
    ]);
    return res.send({ msg: "DELETED!" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
