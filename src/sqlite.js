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

        await db.run(
          "INSERT INTO Choices (text, vote_a, vote_b) VALUES ('本文1本文1本文1本文1', 0, 0), ('本文2本文2本文2', 0, 0)"
        );
      } else {
        console.log(await db.all("SELECT * from Choices"));
      }
    } catch (dbError) {
      console.error(dbError);
    }
  });

module.exports = {
  
  addQuestion: async (question) => {
    try {
      return await db.run(
        `INSERT INTO Choices (text, vote_a, vote_b) VALUES ('${question}', 0, 0)`
      );
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


  clearHistory: async () => {
    try {
      // Delete the Choices data
      await db.run("DELETE from Choices");

//       // Reset the vote numbers
//       await db.run("UPDATE Choices SET picks = 0");

      // Return empty array
      return [];
    } catch (dbError) {
      console.error(dbError);
    }
  }
};

