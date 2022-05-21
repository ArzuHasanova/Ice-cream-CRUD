const mysql = require("mysql2");
const inquirer = require("inquirer");

const conn = mysql.createPool({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'arzu1234',
    database: 'icecream_db'
});

const pool = conn.promise();

function ask() {
  inquirer
    .prompt([
      {
        name: "command",
        message: "What would you like to do?",
        type: "list",
        choices: [
            "Add icecream", 
            "Buy icecream"
        ],
      },
    ])
    .then((choice) => {
        switch(choice.command){
            case "Add icecream":
                addDb();
                break;
            case "Buy icecream":
                delDb();
                break;
        }
    });
}

function run() {
  ask();
}

function addDb() {
  inquirer
    .prompt([
      {
        name: "flavor",
        message: "Add flavor",
        type: "input",
      },
      {
        name: "price",
        message: "Add price",
        type: "input",
      },
      {
        name: "quantity",
        message: "Add quantity",
        type: "input",
      },
    ])
    .then((result) => add(result.flavor, result.price, result.quantity));
}

async function add(flavor, price, quantity) {
  const result = await pool.query(`
      insert into products(flavor,price,quantity) values('${flavor}','${price}','${quantity}') `);
  list();
  run();
}

async function delDb() {
  var product_list = await list();
  await inquirer
    .prompt([
      {
        name: "id",
        message: "Insert ID",
        type: "input",
      },
      {
        name: "quantity",
        message: "Insert quantity",
        type: "input",
      },
    ])
    .then(async (result) => {
      for (var element of product_list) {
        if (element.id == result.id) {
          if (element.quantity < parseInt(result.quantity)) {
            console.log("Sorry, we don't have much icecream...");
          }
          if (element.quantity < 0) {
            del(parseInt(element.id));
          }
          console.log(`Total amount: 💲${result.quantity * element.price}`);
          const resultOfUpdate = await pool.query(`
            update products set quantity = ${
              element.quantity - result.quantity
            } where id = ${element.id} ;
            `);
          delDb();
        }
      }
    });
}

async function del(id) {
  const result = await pool.query(`
        delete from products where id=${id}`);
  run();
}

async function list() {
  const result = await pool.query(`
      select * from products `);
  console.log(result[0]);
  return result[0];
}

run();