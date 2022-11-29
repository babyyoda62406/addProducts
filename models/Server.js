const express = require('express')
const cors    = require("cors")
const fileUpload = require('express-fileupload')

class Server{
    constructor(arg){
        //Variables de entorno
        this.app   = express()
        this.port  = arg 
        this.middlewares()
        this.routes()
        this.run(this.port)

    }

    middlewares(){
        //Configuracion del cors
        this.app.use(cors())
        // Login Veloz 
        this.app.get("/" , (req, res, next)=>{
            const {query:params} = req
            const {token} = params
            if(token!="90b63c78f66c212bbaa6caddc0302cfd7e23eeab750e8ad05f948469b7a98e8d"){
                res.redirect('401.html')
            }else{
                next()
            }
            
        })
        //Directorio Publico
        this.app.use(express.static('public'))
        //Lectura y parseo del body
        this.app.use(express.json())
        this.app.use(express.urlencoded({extended: true }))
        //File Upload
        this.app.use(fileUpload({
            useTempFiles: true , 
            tempFileDir: '/temp/'
        }))
    }

    routes(){
        //Rutas Get
        this.app.use('', require("../routes/get"))
        //Rutas Post
        this.app.use('' , require("../routes/post"))
    }

    run(arg){
        this.app.listen(arg , ()=>{
            console.log(`Runing on port : ${arg}`)
        } )

    }

}


module.exports =  Server