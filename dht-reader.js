const { random } = require("lodash");
const sensor = require("node-dht-sensor");

module.exports = {
  read: () => new Promise((resolve, reject) => {
    sensor.read(11, 4, (err, temp, hum) => {
      if (err) reject(err);
      else resolve({
        temperature: temp,
	humidity: hum,
	date: new Date()      
      });    
    });	  
  })
};
