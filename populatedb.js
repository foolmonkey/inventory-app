#! /usr/bin/env node

console.log(
  "This script populates some test categories and products to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Product = require("./models/product");
var Category = require("./models/category");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var products = [];
var categories = [];

function categoryCreate(name, description, cb) {
  categorydetail = {
    name: name,
    description: description,
  };

  var category = new Category(categorydetail);
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New category: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function productCreate(name, description, category, price, quantity, cb) {
  productdetail = {
    name: name,
    description: description,
    category: category,
    price: price,
    quantity: quantity,
  };

  var product = new Product(productdetail);
  product.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Product: " + product);
    products.push(product);
    cb(null, product);
  });
}

function createCategories(cb) {
  async.parallel(
    [
      function (callback) {
        categoryCreate("Food", "delicious food", callback);
      },
      function (callback) {
        categoryCreate("Video Games", "hi", callback);
      },
    ],
    // optional callback
    cb
  );
}

function createProducts(cb) {
  async.parallel(
    [
      function (callback) {
        productCreate(
          "Hamburger",
          "Served with deliciousness.",
          categories[0],
          5.99,
          1,
          callback
        );
      },
      function (callback) {
        productCreate(
          "Fries",
          "Served with deliciousness.",
          categories[0],
          2.99,
          5,
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [createProducts, createCategories],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
