const express = require('express')
const app = express()
const cors = require('cors')
const fs = require('fs')
const {v4} = require('uuid')

const timetable = require('./timetable.json')
const config = require('./config.json')

let clients = []
let clientInfo = new Map()

let refreshInterval = setInterval(()=>{
    clients=[]
    //console.log('CLIENTS REFRESHED')
},600000)

function save(){
    fs.writeFileSync('./server/timetable.json', JSON.stringify(timetable, null, 2));
    fs.writeFileSync('./server/config.json', JSON.stringify(config, null, 2));
}

const {myRequestHeaders,validateRequest} = require('./modules/validator')
const whitelist = require("./whitelist.json");

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

app.use(function (req, res, next) {
    console.log(`Requête ${req.method} reçue sur ${req.originalUrl}`)
    //console.log(req.body)
    next()
})

let actualToken = false

app.get('/api/auth', cors(), myRequestHeaders, validateRequest, async (req, res) => {
    //console.log("req.headers.authorization", req.headers.authorization);
    actualToken = getBearerTokenFromHeader(req.headers.authorization);
    let clientUuid = v4()
    try{
        fetch('https://discord.com/api/users/@me', {
            headers:{Authorization:'Bearer '+actualToken}}).then(dres => {
            if(dres.status===401){
                return res.status(401).set('Retry-After','Logging-in with authorized Discord user.').send('Unauthorised user.')
            } else {
                dres.json().then(usr => {
                    if(whitelist.includes(usr.id)){
                        clients.push(clientUuid)
                        clientInfo.set(clientUuid, usr)
                        return res.status(200).send({uuid: clientUuid})
                    } else {
                        return res.status(403).set('Retry-After','Sending a valid authorization token.').send('Invalid token.')
                    }})
            }
        })
    } catch (e){
        console.log(e)
        return res.sendStatus(500)
    }
})
const getBearerTokenFromHeader = (authToken) => {
    return authToken.split(" ")[0]
}

app.get("/api/timetable", cors(), myRequestHeaders, validateRequest, (req, res)=>{
    if(clients.includes(req.headers.authorization)){
        return res.status(200).send({ data: timetable, config: config })
    } else return res.status(401).set('Retry-After','Re-authenticating on /api/auth').send('Invalid UUID.')
})

app.put("/api/timetable/edit/options", cors(), myRequestHeaders, validateRequest, (req, res)=>{
    if(clients.includes(req.headers.authorization)){
        if(!req.body) return res.status(400).set('Retry-After','Put a fucking body in the request').send('No body.')
        config.options[req.body.optid]=req.body.optvalue
        save()
        return res.status(200).send({ data: timetable, config: config })
    } else return res.status(401).set('Retry-After','Re-authenticating on /api/auth').send('Invalid UUID.')
})

app.put("/api/timetable/edit/week", cors(), myRequestHeaders, validateRequest, (req, res)=>{
    if(clients.includes(req.headers.authorization)){
        if(!req.body) return res.status(400).set('Retry-After','Put a fucking body in the request').send('No body.')
        config.weektype=parseInt(req.body.choosenWeek.replace('week',''))
        save()
        return res.status(200).send({ data: timetable, config: config })
    } else return res.status(401).set('Retry-After','Re-authenticating on /api/auth').send('Invalid UUID.')
})

let port = 4000
app.listen(port, ()=>{
    console.log(`Serveur lancé sur http://localhost:${port}`)
})