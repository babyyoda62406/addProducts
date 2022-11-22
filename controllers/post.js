const fs = require('fs')
const fetch = require("node-fetch")
const jsdom = require("jsdom")
let {carga_productos, independence_item}    = require("../models/productos")
const { JSDOM } = jsdom;
require("dotenv").config() 
let ipCategory = '' 
let ipPH = ''

const { response , request } = require('express');
const obtenerFecha  = ()=>{return `${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDate()} - ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds() } `}

const writeError = (arg)=>{
    fs.appendFileSync('Errors.txt', `\n----------------${obtenerFecha()}---------------------\n ${arg}\n` , (err) => {
        if (err) console.log("Error al documentar error");
        console.log('Error registrado');
    });
}

const getEspc = (arg) => {
    const poll = arg.split(' ')
    let response = ''
    for (let i = 0; i < poll.length; i++) {
        if (poll[i]) {
            response += `►${poll[i]}<br/>`
        }
    }
    return response
}


const addMenu = (req = request , res = response)=>{
    const {body} = req
    const {menu} = body
    if(!menu)return res.status(200).json({"status":"404" , "msg":"Debe proprcionar una ruta de menú valida"})
    const bag = new URLSearchParams()
    bag.append('URL' , menu)
    fetch(process.env.MENU , {
        method:'POST', 
        body: bag
    })
    .then(res => res.json())
    .then(arg => {
        const {target  , targetLabel} = arg
        ipPH = target
        ipCategory  = targetLabel
        res.status(200).json({"status":"200" , "bag":arg})
        fetch(process.env.BMENU)
        .then(res => res.text())
        .then(arg => {

        })
        .catch(err=>{
            writeError(err)
            console.log(err)
        })
    })
    .catch(err=>{
        writeError(err)
        res.status(200).json({"status":"500" , "msg":"No podemos crear menus en este momento"})
    })
    
}


const json_form = (arg)=>{
    const bag     = new URLSearchParams()
    const keys    = Object.keys(arg)
    const values  = Object.values(arg)
    for(let i=0;i<keys.length;i++){
        bag.append( keys[i],values[i])
    }
    return bag 
}


const addProduct =async  (arg)=> {
    carga_productos = arg 
    await fetch(process.env.PRODUCTO , {
        method:'POST', 
        body: json_form(carga_productos)
    })
    .then(async res => await  res.json())
    .then(async arg => {
        const {status}  = arg 
        
        if(status=='200'){
            const { route,name,src,description,esp} = arg 
            independence_item.nombre_producto = name
            independence_item.description = description
            independence_item.especificaciones = getEspc(esp)
            independence_item.urlImg = `../upload/article/${src}`
            independence_item.route =  route 
           await  fetch(process.env.INDEPENDENCE, {
                method: "POST" , 
                body: json_form(independence_item)
            })
            .then(async res => await res.json())
            .then(async arg => {
                // console.log(arg)
                return true
            })
        }
    }).catch(async err=>{
        writeError(err)
        console.log(err)
        console.log("return 4")
        return false

    })
    return  true 
    
}

const domlv1 = async (arg , ph , ct)=>{
    let cont  = 0 
    const dom   = new JSDOM(arg)
    const items = dom.window.document.getElementsByClassName('product-image')
    const id  = dom.window.document.getElementsByClassName('product-image')
    for(let i = 0;i<items.length;i++){
        const state  = await domlv2(items[i].href , ph , ct)
        if(state)cont++
    }
    // domlv2(items[0].href)
    // return {"status":"finish"}
    return cont
}

const domlv2 = async (arg, ph , ct )=>{ 
    let value = false 
    await  fetch(arg)
    .then(async res =>  await res.text())
    .then(async arg=> { 
      value  =   await domlv3(arg, ph , ct)
      return value 
    })
    .catch(err => {
        writeError(err)
        console.log(err)
        
        //Manejo del error aqui
    })
    // console.log(value)
    return value
}


const domlv3 = async (arg , ph , ct )=>{
    const frame = JSDOM.fragment(arg)
    carga_productos.id   = frame.querySelector('.clave-sku p').textContent
    carga_productos.ipResen =  carga_productos.ipName = (frame.querySelector(".product-name span.h1").textContent?frame.querySelector(".product-name span.h1").textContent:"UnKnow")
    
    let tempArrayDom = frame.querySelectorAll(".std ul li")
    let tempStr = ""

    for(let i=0;i<tempArrayDom.length;i++){
        tempStr += tempArrayDom[i].textContent + `${i==tempArrayDom.length-1?"":","}`
    }
    carga_productos.ipDescription = (tempStr?tempStr:"UnKnow")

    tempArrayDom = frame.querySelectorAll(".especificaciones  tbody tr")

    tempStr = ""
    for(let i=0;i<tempArrayDom.length;i++){
        const otherFrame = JSDOM.fragment(tempArrayDom[i].outerHTML)
        let thisRow  = ""
        let ignorePDF = false 

        let otherDomArray  = otherFrame.querySelectorAll("th")    
        for(let j=0;j<otherDomArray.length;j++){
            if(otherDomArray[j].textContent.indexOf("PDF")!=-1){
                ignorePDF= true 
            }
            thisRow +=otherDomArray[j].textContent + ": " 
        }
        
        otherDomArray  = otherFrame.querySelectorAll("td")    
        for(let j=0;j<otherDomArray.length;j++){
            if(otherDomArray[j].textContent.indexOf("PDF")!=-1){
                ignorePDF= true 
            }
            thisRow +=otherDomArray[j].textContent + " " 
        }

        if(ignorePDF){
            continue
        }

        tempStr += thisRow+" "
        // console.log("Row: " , thisRow)
    }
    carga_productos.ipEspc     = tempStr
    carga_productos.ipFile     = (frame.querySelector('#image-main').src?frame.querySelector('#image-main').src:"")
    carga_productos.ipCategory =  ct
    carga_productos.ipPH       =  ph

    // console.log(carga_productos)
    const  value =  await addProduct(carga_productos)
    return value 
}

const addAll = (req = request , res = response)=>{
    const {body} = req
    const {url} = body
    if(!ipPH || !ipCategory){
        return res.status(200).json({"status":"400" , "msg":"Necesita proporcionar el punto de montaje"})
    }
    let currentPH = ipPH
    let currentCategory = ipCategory
    fetch(url)
    .then(res => res.text())
    .then(async arg=> { 
        const trash =  await domlv1(arg , currentPH , currentCategory)   
        // console.log(trash)     
        res.status(200).json({"status":"200" , msg: "success" , items:trash})
    })
    .catch(err => {
        writeError(err)
        console.log(err)   
        res.status(200).json({msg: "No Podemos Agregar Productos en este momento"  , "status":"500"})
    })
}

module.exports = {
    addMenu, 
    addAll
}