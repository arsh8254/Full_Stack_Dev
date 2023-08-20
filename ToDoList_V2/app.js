//jshint esversion:6

// NOTE: documents in mongoose means record in collection of database
const express = require("express");
const bodyParser = require("body-parser");
// we require the mongoose module
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// creating database for our project with link to mongoDB client
// <serverpath> = ://localhost:27017
mongoose.connect("mongoDb<serverpath>/todolistDB", {useNewUrlParser: true});

// creating schema for structure of our database records
const itemsSchema = {
  name: String
};

// creating new model for above schema
const Item = mongoose.model("Item", itemsSchema);

// we create three documents into Items schema
    const item1 = new Item({
      name: "Welcome to your todolist!"
    });

    const item2 = new Item({
      name: "Tap + button to add an item."
    });

    const item3 = new Item({
      name: "click checkbox to delete item."
    });

// default documents to be shown
const defaultItems = [item1, item2, item3];

// creating list schema to store dynamic webpage list
const listSchema = {
  name: String,
  items: [itemsSchema]   // storing an array just like itemSchema
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  // to retrieve documents from database and render on website
  Item.find({}, function(err, foundItems){
    // if nothing is found in database
    if (foundItems.length === 0) {
      // adding default three items to the collection
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

// using express route parameters to create dynamic webpage based on user input
  app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName); 
   // used lodash method to convert first letter to capital and rest to small letters 
  
  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){ // if list doesn't exist
        //Create a new list
          const list = new List({
          name: customListName,
          items: defaultItems    // 3 entries will be present by default
        });
        // create a new list if it doesn't already exist
        list.save();
        res.redirect("/" + customListName);   // to redirect to created list
      } else {
        //Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  // saving in database
  const item = new Item({
    name: itemName
  });

  // storing in default list 
  if (listName === "Today"){
    item.save();
    res.redirect("/");
    // storing in the custom list as per route parameter
  } else {
      List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

// new route is created for delete option
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });

    // pull method is from mongoDB to help with element finding in array
  } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started in port 3000 successfully");
});
