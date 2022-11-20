const { Router} = require("express")
const { addMenu,  addAll } = require('../controllers/post')

const app = Router()

app.post('/addMenu' , addMenu )
app.post('/addAll' , addAll)


module.exports = app