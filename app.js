const Server = require("./models/Server");
require("dotenv").config() 
console.clear()
api = new Server(process.env.PORT)