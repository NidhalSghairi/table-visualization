const sqlite3 = require("sqlite3").verbose();
const express = require("express");
let cors = require("cors");

const app = express();
app.use(cors());

const getDataBase = (name) => {
  return new sqlite3.Database(
    `./db/${name}.db`,
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Connected to the us-census database.");
    }
  );
};

app.get("/columns", (req, res) => {
  const database = req.query["database"];

  const db = getDataBase(database);

  db.serialize(() => {
    db.all(
      `SELECT *
       FROM census_learn_sql
       LIMIT 1
      `,
      (err, row) => {
        if (err) {
          console.error(err.message);
        }
        res.send(row);
      }
    );
  });
});

app.get("/values", (req, res) => {
  const column = req.query["column"];
  const database = req.query["database"];

  const db = getDataBase(database);

  db.serialize(() => {
    db.all(
      `SELECT [${column}] as id, COUNT(*) as count, AVG(age) as averageAge
     FROM census_learn_sql
     GROUP BY [${column}] `,
      (err, row) => {
        if (err) {
          console.error(err.message);
        }
        res.send(row);
      }
    );
  });
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log("Server app listening on port " + port);
});
