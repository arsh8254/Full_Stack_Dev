//jshint esversion:6

// to export this fumction to other files
exports.getDate = function(){  

  // module.exports = getDate;    // this exports getDate function to other files

// to get the date from operating system in desired format
const today = new Date();
const options = {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
};
   return today.toLocaleDateString("en-US", options);
};



exports.getDay = function (){

const today = new Date();
const options = {
  weekday: 'long'
};
   return today.toLocaleDateString("en-US", options);
};
