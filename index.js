const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");

// create a new Express app server object
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// declare a constant for the PostgreSQL table           //localhost:3456
const tableName = `Cust`;
const port = process.env.port || 3456;

// get the path for the HTML file
const htmlPath = path.join(__dirname + "/index.html");

// create a new client instance with the pg Pool() method
const client = new Pool({
  user: "postgres",
  host: "silk-machine",
  database: "Labsheet2",
  password: "",
  port: "5432"
});

// function that will return Postgres records as an HTML table
function createHtmlTable(tableRows, tableCol) {
  // open a <script> tag for the string
  let htmlData = "<script>var tableData = `<thead>\n<tr>";
  console.log(`\ncreateHtmlTable:`);

  // use map() to iterate over the table column names
  tableCol.map(col => {
    col = col[0].toUpperCase() + col.substring(1, col.length);
    htmlData += `\n<th>${col}</th>`;
    console.log(`col: ${col}`);
  });

  // open the head and body tags for the table
  htmlData += `\n</thead>\n<tbody>\n`;
  console.log(`tableRows: ${typeof tableRows}`);

  // iterate over the table row data with map()
  tableRows.map(row => {
    // open a new table row tag for each Postgres row
    htmlData += `\n<tr>`;

    // iterate over the row's data and enclose in <td> tag
    for (val in row) {
      console.log(`row[val]: ${row[val]}`);
      htmlData += `\n<td>${row[val]}</td>`;
    }

    // close the table row <tr> tag
    htmlData += `\n</tr>`;
  });

  // close the table body and script tags
  htmlData += "\n</tbody>`;</script>";

  // return the string
  return htmlData;
}

// 'GET' route for the web app
app.get("/", (req, resp) => {
  console.log(`req: ${req}`);
  console.log(`resp: ${resp}`);

  // send the HTML file back to the front end
  resp.sendFile(htmlPath);
});

// 'POST' route for the web app
app.post("/query", function(req, resp) {
  // parse the user's query
  let userQuery = req.body.query;
  console.log(`\nuserQuery: ${typeof userQuery}`);
  console.log(`${userQuery}`);

  // load the HTML file into the Node app's memory
  let htmlData = fs.readFileSync("./index.html", "utf8");

  // only make an API call if the user query is valid
  if (isNaN(userQuery) == false && userQuery.length > 0) {
    // concatenate an SQL string to SELECT the table column names
    let sqlColNames = `SELECT * FROM information_schema.columns WHERE table_name = $1;`;

    // create a Promise object for the query
    client
      .query(sqlColNames, [tableName])

      .then(colResp => {
        // access the "rows" Object attr
        let colRows = colResp["rows"];

        // use map() function to create an array of col names
        let colNames = colRows.map(colKeys => {
          return colKeys["column_name"];
        });

        // concatenate another string for the table row data
        let sqlSelectRows = `SELECT * FROM ${tableName} WHERE phoneno >= $1`;
        console.log(`sqlSelectRows: ${sqlSelectRows}`);

        client
          .query(sqlSelectRows, [userQuery])

          .then(rowResp => {
            // get the row data from 'rows' attribute
            let rowData = rowResp.rows;

            // call function to create HTML data
            let html = createHtmlTable(rowData, colNames);
            console.log(`HTML table data: ${html}`);

            // send the HTML file data and table data back to front end
            resp.send(htmlData + `<br>` + html);
          });
      });
  } else {
    // send an error message if the query is not an integer
    resp.send(
      htmlData +
        `<br><p color="red">ERROR: You must input an integer value.</p>`
    );
  }
});

var server = app.listen(port, function() {
  console.log(
    `\nPostgres Node server is running on port: ${server.address().port}`
  );
});