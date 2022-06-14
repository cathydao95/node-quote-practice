const express = require("express");
const app = express();
// body-parser used to extract data from form element
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

let db,
  dbConnectionStr = process.env.connectionString;

MongoClient.connect(dbConnectionStr)
  .then((client) => {
    console.log("connected to database");
    const db = client.db("star-wars-quotes");
    const quotesCollection = db.collection("quotes");

    app.set("view engine", "ejs");
    // urlencoded tells body-parser to extract data from form element and add to body property in request object
    app.use(express.static("public"));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.get("/", (request, response) => {
      //   response.sendFile(__dirname + "/index.html");
      //   const cursor = db.collection("quotes").find();
      //   console.log(cursor);
      db.collection("quotes")
        .find()
        .toArray()
        .then((results) => {
          response.render("index.ejs", { quotes: results });
        })
        .catch((error) => console.error(error));
    });

    app.post("/quotes", (request, response) => {
      quotesCollection
        .insertOne(request.body)
        .then((result) => {
          response.redirect("/");
        })
        .catch((error) => console.error(error));
    });

    app.put("/quotes", (request, response) => {
      quotesCollection
        .findOneAndUpdate(
          { name: "Yoda" },
          {
            $set: {
              name: request.body.name,
              quote: request.body.quote,
            },
          },
          {
            upsert: true,
          }
        )
        .then((result) => {
          response.json("Success");
        })
        .catch((error) => console.error(error));
    });

    app.delete("/quotes", (request, response) => {
      quotesCollection
        .deleteOne({ name: request.body.name })
        .then((result) => {
          if (result.deletedCount === 0) {
            return response.json("No quote to delete");
          }
          response.json(`Deleted Darth Vadar's quote`);
        })
        .catch((error) => console.error(error));
    });

    app.listen(3000, function () {
      console.log("listening on 3000");
    });
  })
  .catch((error) => console.error(error));
