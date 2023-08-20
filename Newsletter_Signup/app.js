// jshint esversion: 6

// ----------required packages---------//
const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const https = require("https");

// new instance of express
const app = express(); 

//app.use method uses the static function to render local files to browser
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:true}));

app.get("/", function(req,res){
  res.sendFile(__dirname + "/signup.html");
});

// this stores the data given by browser into server
app.post("/", function(req,res){
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;
  
  // we are sending our data in the form of javascript object
  const data = {
    // the members, status, merge_fields --- comes from mailChimp api documentation
    'members':[
      {
        email_address:email,
        status:"subscribed",
        merge_fields:{
          FNAME:firstName,
          LNAME:lastName
        }
      }
    ],
  }


  //mailChimp api key
  //api key 
  //Mailchimp list id 

  // we stringify the json object to reduce code size
  var jsonData = JSON.stringify(data)
  console.log(firstName, lastName, email);

  // NOTE: The API KEY BELOW HAS BEEN DISABLED ON MAILCHIMP
  //       AS THIS CODE WILL BE PUSHED TO PUBLIC GITHUB for eveyone to view

const url = "https://us8.api.mailchimp.com/3.0/lists/4bcf3cbb34";

const options = {
  method:"POST",
  auth:""
}

// we must save our request in any constant to send data to api
const request = https.request(url, options, function(response){
  if (response.statusCode === 200){
    res.sendFile(__dirname + "/success.html");
  }else {
    res.sendFile(__dirname + "/failure.html");
  }

response.on("data",function(data){
  console.log(JSON.parse(data));
  })
});

// this is used to send data to mailchimp api
request.write(jsonData);
request.end();    // to end the request to api
});

// to redirect the page to homepage
app.post("/failure", function (req, res){
  res.redirect("/");
});

//to test the app locally in port 3000 as well as to run on heroku servers
// app.listen(process.env.PORT || 3000, function(){

app.listen(process.env.PORT || 3000, function(){
console.log("Server is running in port 3000")
});
