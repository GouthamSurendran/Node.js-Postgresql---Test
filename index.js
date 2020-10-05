const express = require("express");
const { Pool } = require("pg");
const app = express();
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "silk-machine",
  database: "postgres",
  password: "",
  port: "5432"
});

app.use('/', express.static(__dirname + '')); // This line important for serving static files from the directory.

app.get("/", (req, res) => res.sendFile(`${__dirname}/index.html`));

app.get("/todo", async (req, res) => {
  const rows = await readTodos();
  res.setHeader("content-type", "application/json");
  res.send(JSON.stringify(rows));
})

app.put("/todo", async (req, res) => {
  let result = {}
  try {
    const reqJson = req.body;
    result.success = await updateTodo(reqJson.text, reqJson.id);
  }
  catch (e) {
    result.success = false;
  }
  finally {
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(result));
  }

})

app.post("/todo", async (req, res) => {
  let result = {}
  try {
    const reqJson = req.body;
    result.success = await createTodo(reqJson.text);
  }
  catch (e) {
    result.success = false;
  }
  finally {
    res.setHeader("content-type", "application/json");
    res.send(JSON.stringify(result));
  }

})

app.delete("/todo", async (req, res) => {
  let result = {}
  try {
    const reqJson = req.body;
    result.success = await deleteTodo(reqJson.id)
  }
  catch (e) {
    result.success = false;
  }
  finally {
    res.setHeader("content-type", "application/json")
    res.send(JSON.stringify(result))
  }

})

app.listen(8080, () => console.log("Web server is listening.. on port 8080"));

start();

async function start() {
  await connect();

};

async function connect() {
  try {
    await pool.connect();
  }
  catch (e) {
    console.error(`Failed to connect to the server! ${e}`)
  }
}

async function readTodos() {
  try {
    const results = await pool.query("select id, todoText from todo");
    return results.rows;
  }
  catch (e) {
    return [];
  }
}

async function createTodo(todoText) {

  try {
    await pool.query("insert into todo (todoText) values ($1)", [todoText]);
    return true;
  }
  catch (e) {
    return e;
  }
}

async function updateTodo(todoText, Id) {

  try {
    await pool.query("update todo set todoText= $1 where id= $2 returning *", [todoText, Id]);
    return true;
  }
  catch (e) {
    return e;
  }
}


async function deleteTodo(id) {

  try {
    await pool.query("delete from todo where id = $1", [id]);
    return true
  }
  catch (e) {
    return false;
  }
}
