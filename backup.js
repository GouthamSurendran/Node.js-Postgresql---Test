const { Client } = require('pg');
const client = new Client({
    user: "postgres",
    password: "",
    host: "silk-machine",
    port: "5432",
    database: "Labsheet2"
});

client.connect()
    .then(() => console.log("Connected Succesfully"))       //The pg_hba.conf File (Look into this after test run)
    .then(() => client.query("select Fname from Cust where Fname like '_a%';"))  
    .then(result => console.table(result.rows))
    .catch(e => console.log(e))
    .finally(() => client.end());