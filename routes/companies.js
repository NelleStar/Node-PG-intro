const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require("slugify");

// GET companies
router.get("/", async function(req, res, next){
  try {
    const results = await db.query(
      `SELECT * FROM companies`);
    return res.json({ companies: results.rows });
  }
  catch(err) {
    return next(err);
  };
});

// GET company
router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(
      `SELECT c.code, c.name, c.description, 
        json_agg(DISTINCT i) AS invoices, 
        json_agg(DISTINCT ci.industry_code) AS industries
      FROM companies AS c
      LEFT JOIN invoices AS i ON c.code = i.comp_code
      LEFT JOIN companies_industries AS ci ON c.code = ci.comp_code
      WHERE c.code = $1
      GROUP BY c.code, c.name, c.description`, [code]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(`No company found with code of ${code}`, 404);
    }

    return res.send({ company: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});



// POST company
router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = slugify(name, { lower: true })
    const results = await db.query(
      `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`,
      [code, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// PATCH company
router.patch("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;

    const results = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`,
      [name, description, code]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(`No company found with code of ${code}`, 404);
    }

    return res.send({ company: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// DELETE company
router.delete("/:code", async (req, res, next) => {
  try {
    const results = db.query(`DELETE FROM companies WHERE code = $1`, [
      req.params.code,
    ]);
    return res.send({ msg: "DELETED!" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;