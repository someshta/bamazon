//dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");

//establish connection
var connection = mysql.createConnection({
  host: "localhost",
  port: 8889,

  user: "root",
  password: "root",
  database: "bamazon"
});

//use connection to connect
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);

  //query for available products
  var productInfo =
    "SELECT item_id, product_name, department_name, price FROM products";
  connection.query(productInfo, function(err, results) {
    if (err) throw err;
  });
});
