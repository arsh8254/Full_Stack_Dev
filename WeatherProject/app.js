/*jshint esversion: 6 */
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const app = express();

//to parser the post request using body-parser package
app.use(bodyParser.urlencoded({extended:true}));

//app get request --- browser requesting our server
app.get("/", function(req,res){
    res.sendFile(__dirname+ "/index.html")
});

//app post request to the server
app.post("/",function(req, res){
  const query =req.body.cityName;
  const apiKey =" ";
  const unit = "metric";
  const url = "https://api.openweathermap.org/data/2.5/weather?q=" +query +"&appid=" +apiKey +"&units=" +unit;

  // our server requesting external api server
  https.get(url, function(response){
  console.log(response.statusCode);

  // our server recieved data from external api server
  response.on("data", function(data){
      const weatherData = JSON.parse(data);
      const temp = weatherData.main.temp;
      const weatherDescription= weatherData.weather[0].description;   // weather is an array in api
      const icon = weatherData.weather[0].icon;
      const iconURL = "http://openweathermap.org/img/wn/" +icon + "@2x.png"

      // our server sending data to browser
      res.write("<p>The weather is currently "+ weatherDescription + "</p>");
      
      //we can use res.write as we cannot use res.send again
      res.write("<h1>The current temperature in " + query +" is " +temp +" degree Celcius.</h1>");
      res.write("<img src =" + iconURL +">");
      res.send();
      // there can be only one res.send method for any app.get method
    })

  })
       // res.send("Server is running");
})

app.listen(3000, function(){
console.log("Server is running on port 3000");
})
