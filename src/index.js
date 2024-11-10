require('dotenv').config({ path: '../.env' }); 
const http = require("http");
const fs = require("fs");
var requests = require("requests");

const homeFile = fs.readFileSync("home.html", "utf-8");
const port = process.env.PORT;

const replaceVal = (tempVal, orgVal) => {
  let temperature = tempVal.replace("{%tempval%}", Math.round(orgVal.main.temp));
  temperature = temperature.replace("{%tempmin%}", Math.round(orgVal.main.temp_min));
  temperature = temperature.replace("{%tempmax%}", Math.round(orgVal.main.temp_max));
  temperature = temperature.replace("{%location%}", orgVal.name);
  temperature = temperature.replace("{%country%}", orgVal.sys.country);
  temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main);

  return temperature;
};

const server = http.createServer((req, res) => {
  if (req.url == "/") {
    const apiKey = process.env.APIID;
    if (!apiKey) {
      console.error("API Key not found in environment variables");
      res.end("API Key missing");
      return;
    }

    requests(`http://api.openweathermap.org/data/2.5/weather?q=Lahore&units=metric&appid=${apiKey}`)
      .on("data", (chunk) => {
        const objdata = JSON.parse(chunk);
        const arrData = [objdata];
        const realTimeData = arrData
          .map((val) => replaceVal(homeFile, val))
          .join("");
        res.write(realTimeData);
      })
      .on("end", (err) => {
        if (err) return console.log("connection closed due to errors", err);
        res.end();
      });
  } else {
    res.end("File not found");
  }
});

server.listen(port, "127.0.0.1");
