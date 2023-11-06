const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// GET all industries with their comp_codes
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM industries`);
    return res.json({ industries: results.rows });
  } catch (err) {
    return next(err);
  }
});

// POST a new industry with code and name
router.post("/", async (req, res, next) => {
  try {
    const { code, name } = req.body;

    // Check if the industry code already exists
    const checkExistingIndustry = await db.query(
      `SELECT code FROM industries WHERE code = $1`,
      [code]
    );

    if (checkExistingIndustry.rows.length > 0) {
      throw new ExpressError(`Industry with code ${code} already exists`, 400);
    }

    const results = await db.query(
      `INSERT INTO industries (code, name) VALUES ($1, $2) RETURNING *`,
      [code, name]
    );

    return res.status(201).json({ industry: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
