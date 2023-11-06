\c biztime

-- Drop tables if they exist
DROP TABLE IF EXISTS companies_industries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;

-- Create companies table
CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

-- Create invoices table
CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK (amt > 0)
);

-- Create industries table
CREATE TABLE industries (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE
);

-- Create companies_industries table
CREATE TABLE companies_industries (
    comp_code text REFERENCES companies(code),
    industry_code text REFERENCES industries(code),
    PRIMARY KEY (comp_code, industry_code)
);

-- Insert data into companies table
INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');

-- Insert data into industries table
INSERT INTO industries 
  VALUES ('acct', 'accounting'), 
         ('it', 'information tech'),
         ('legal', 'legal');

-- Insert data into invoices table
INSERT INTO invoices (comp_code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

-- Insert data into companies_industries table
INSERT INTO companies_industries (comp_code, industry_code)
  VALUES ('apple', 'it'),
         ('apple', 'acct'),
         ('ibm', 'it'),
         ('ibm', 'legal');


