var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  port: 8889,

  user: "root",
  password: "root",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);

  connection.query("SELECT item_id, product_name FROM products", function(
    err,
    results
  ) {
    if (err) throw err;

    var productIdByName = createObject(results);
    inquirer
      .prompt([
        {
          type: "list",
          message: "What is the ID of the product you want to buy?",
          choices: Object.keys(productIdByName),
          name: "productChoice"
        }
      ])
      .then(function(inquirerResponse) {
        var userChoice = inquirerResponse.productChoice;
        var productId = productIdByName[userChoice];
      });
  });
});

function createObject(results) {
  var productIdByName = {};
  for (var i = 0; i < results.length; i++) {
    productIdByName[results[i].product_name] = results[i].item_id;
  }
  return productIdByName;
}
