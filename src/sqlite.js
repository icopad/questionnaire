/**
 * Module handles database management
 *
 * Server API calls the methods in here to query and update the SQLite database
 */

// Utilities we need
const fs = require("fs");

// Initialize the database
const dbFile = "./.data/choices.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
let db;

/* 
We're using the sqlite wrapper so that we can make async / await connections
- https://www.npmjs.com/package/sqlite
*/
dbWrapper
  .open({
    filename: dbFile,
    driver: sqlite3.Database
  })
  .then(async dBase => {
    db = dBase;

    try {
      if (!exists) {
        await db.run(
          "CREATE TABLE Choices (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, vote_a INTEGER, vote_b INTEGER)"
        );
      } else {
        console.log(await db.all("SELECT * from Choices"));
      }
    } catch (dbError) {
      console.error(dbError);
    }
  });

module.exports = {
  addQuestion: async question => {
    try {
      return await db.run(
        `INSERT INTO Choices (text, vote_a, vote_b) VALUES ('${question}', 0, 0)`
      );
    } catch (dbError) {
      console.error(dbError);
    }
  },

  setChoice: async (id, choice) => {
    try {
      if (choice === "a") {
        return await db.run(
          `UPDATE Choices SET vote_a = vote_a + 1 WHERE id = ${id}`
        );
      } else {
        return await db.run(
          `UPDATE Choices SET vote_b = vote_b + 1 WHERE id = ${id}`
        );
      }
    } catch (dbError) {
      console.error(dbError);
    }
  },

  getChoices: async () => {
    try {
      return await db.all("SELECT * from Choices");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  clearData: async () => {
    try {
      await db.run("DELETE from Choices");
      return [];
    } catch (dbError) {
      console.error(dbError);
    }
  }
};
