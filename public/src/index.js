
const load_events = () => {
    const btnAddMenu = document.getElementById('btnAddMenu')
    const btAddAll = document.getElementById('btAddAll')
    btAddAll.onclick = handler_click
    btnAddMenu.onclick = handler_click
    const btnClean = document.getElementById('btnClean')
    btnClean.onclick = handler_click
}

const handler_click = (arg) => {
    stop_event(arg)
    const item = arg.target
    switch (item.id) {
        case "btnAddMenu":
            addMenu()
            break
        case "btAddAll":
            addAll()
            break 
        case "btnClean":
            document.getElementById("screen").innerHTML = ""
            break
    }
}

const stop_event = (arg) => {
    arg.preventDefault()
    arg.stopPropagation()
}

const obtenerFecha = () => { return `${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDate()} - ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} ` }

const addMenu = () => {
    handler_loader('show')
    const bag = new FormData()
    bag.set('menu', document.getElementById('ipMenu').value)
    fetch('/addMenu', {
        method: 'POST',
        body: bag
    })
        .then(res => res.json())
        .then(arg => {
            setTimeout(() => { handler_loader('hide') }, 1000)
            const { status } = arg
            // console.log(arg)
            if (status == 200) {
                putScreen(`${obtenerFecha()}:<span class="text-success px-0"> Punto de montaje en: "${arg.bag.targetLabel}" </span>`)
                document.getElementById('ipMenu').value = ""
            } else {
                putScreen(`${obtenerFecha()}: <span class="text-danger px-0"> Error</span>: ${arg.msg}`)
            }

        })
        .catch(err => {
            setTimeout(() => { handler_loader('hide') }, 1000)
            console.log(err)
            putScreen(`${obtenerFecha()}: <span class="text-danger px-0"> Error</span> desconocido ${err}`)
            //Manejo del error aqui
        })
}

const addAll = () => {
    handler_loader('show')
    const bag = new FormData()
    bag.set('url', document.getElementById('ipUrl').value)
    fetch('/addAll', {
        method: 'POST',
        body: bag
    })
        .then(res => res.json())
        .then(arg => {
            setTimeout(() => { handler_loader('hide') }, 1000)
            const { status } = arg
            // console.log(arg)
            if (status == 200) {
                putScreen(`${obtenerFecha()}:<span class="text-success"> ${arg.items} Items han sido agregados </span>`)
                document.getElementById('ipUrl').value = ""
            } else {
                putScreen(`${obtenerFecha()}: <span class="text-danger px-0"> Error</span>: ${arg.msg}`)
            }
        })
        .catch(err => {
            setTimeout(() => { handler_loader('hide') }, 1000)
            putScreen(`${obtenerFecha()}: <span class="text-danger px-0"> Error</span>: desconocido <br>  ${err}`)
            console.log(err)
            //Manejo del error aqui
        })
}


const putScreen = (arg) => {
    const screen = document.getElementById('screen')
    entry = document.createElement("div")
    entry.classList.add("row")
    entry.classList.add("border-bottom")
    entry.classList.add("mx-2")
    entry.classList.add("d-flex")
    entry.innerHTML = arg
    screen.appendChild(entry)
}

const handler_loader = (type) => {
    if (type == 'show')
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCargando')).show()
    if (type == 'hide')
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCargando')).hide()

}