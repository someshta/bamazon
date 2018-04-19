//naming dependencies
var inquirer = require("inquirer");
var mysql = require("mysql");

//creating connection
var connection = mysql.createConnection({
  host: "localhost",
  port: 8889,

  user: "root",
  password: "root",
  database: "bamazon"
});

//connection is connecting
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  bamazon();
});
//main function for store
//using our connection to tap into database, pulling ID & product info from table
function bamazon() {
  connection.query(
    "SELECT item_id, product_name, department_name, price FROM products",
    function(err, results) {
      if (err) throw err;

      //store product list in variable
      var productIdByName = createObject(results);

      // prompt user to select product
      inquirer
        .prompt([
          {
            type: "list",
            message: "Welcome! What would you like to buy?",
            choices: Object.keys(productIdByName),
            name: "productChoice"
          },
          {
            type: "input",
            message: "How much do you want to buy?",
            name: "amount"
          }
        ])
        .then(function(inquirerResponse) {
          //store responses into variables
          var userChoice = inquirerResponse.productChoice;
          var amount = inquirerResponse.amount;
          var productId = productIdByName[userChoice];

          console.log("********************");
          console.log(
            "You've selected " +
              userChoice +
              " and you want to buy " +
              amount +
              " of them"
          );
          console.log("********************");

          //query checking the stock level of product based on product ID
          var checkStock =
            "SELECT stock_quantity, price FROM products WHERE item_id = " +
            productId;

          connection.query(checkStock, function(err, result) {
            if (err) throw err;

            var stockLevel = result[0].stock_quantity;
            var price = result[0].price * amount;

            if (amount <= result[0].stock_quantity) {
              console.log("We've got you covered! Your total is $" + price);
              //save updated stock level in variable
              var updatedStockLevel = stockLevel - amount;

              //query to update stock_quantity in database
              connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                  {
                    stock_quantity: updatedStockLevel
                  },
                  {
                    item_id: productId
                  }
                ],
                function(err, result) {
                  if (err) throw err;
                }
              );

              inquirer
                .prompt([
                  {
                    type: "confirm",
                    message: "Do you want to keep shopping?",
                    name: "keepShopping"
                  }
                ])
                .then(function(inquirerResponse) {
                  if (inquirerResponse.keepShopping === true) {
                    bamazon();
                  } else {
                    console.log("Okay. Thanks for you purchase!");
                    return connection.end();
                  }
                });
            } else {
              console.log("Sorry, not enough product available");
              inquirer
                .prompt([
                  {
                    type: "confirm",
                    message: "Do you want to keep shopping?",
                    name: "keepshopping"
                  }
                ])
                .then(function(inquirerResponse) {
                  if (inquirerResponse.keepshopping === true) {
                    bamazon();
                  } else {
                    console.log("Okay. See you next time.");
                    return connection.end();
                  }
                });
            }
          });
        });
    }
  );
}

//function creating list of available products
function createObject(results) {
  var productIdByName = {};
  var stockLevel = {};
  for (var i = 0; i < results.length; i++) {
    productIdByName[results[i].product_name] = results[i].item_id;
  }
  return productIdByName;
}

//********* NOTES *********//

//1. mysql syntax to update stock_quantity in database has error (lines 81-92)
//2. at end of sequence, when user is prompted to keep shopping or not, Y gets same result as N, both end the connection...
//   ...why is calling the bamazon() function not working?
