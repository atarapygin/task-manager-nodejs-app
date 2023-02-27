const { MongoClient } = require("mongodb");

const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);

const dbName = "task-manager";

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);

  db.collection("users").insertOne({
    name: "Anonymous",
    age: "Unlimited",
  });

  return "Done";
}

main().then(console.log).catch(console.error);
