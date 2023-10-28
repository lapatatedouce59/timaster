let uuid = String

let data = Array

let config = Object



let lastUpdateTime = document.getElementById('lastUpdateTime')
let weekTypeContainer = document.getElementById('weekTypeContainer')
let optToggleContainer = document.getElementById('optToggleContainer')
let submitChoosenWeek = document.getElementById('submitChoosenWeek')

function toZero(time){
    return ('0'+time).slice(-2)
}

//RECUPERATION TOKEN DISCORD
let cookies = {}
for(const el of document.cookie.split("; ")){
    cookies[el.split("=")[0]] = el.split("=")[1]
}
if(cookies.discord_token){
    console.log('SENDING DISCORD BEARER...')
    fetch('http://127.0.0.1:4000/api/auth', {
        method:'get',
        headers:{
            "Content-Type": "application/json",
            "authorization": cookies.discord_token,
        }
    }).then(res => {
        if(res.status===401){
            alert('Votre compte n\'est pas autorisé à accéder à cette page.')
            document.location.href='https://discord.com/api/oauth2/authorize?client_id=1166686401614589994&redirect_uri=http%3A%2F%2F127.0.0.1%3A5500%2Fclient%2Fverify.html&response_type=token&scope=identify'
        } else if(res.status===200) {
            console.log('ACCEPTED')
            res.json().then(resbody =>{
                uuid=resbody.uuid
                console.log('GAINED UUID')
                getTimetable()
            })
        } else if(res.status===403) {
            alert('Votre jeton de connexion Discord est invalide ou a expiré. Nous allons vous reconnecter.')
            document.location.href='https://discord.com/api/oauth2/authorize?client_id=1166686401614589994&redirect_uri=http%3A%2F%2F127.0.0.1%3A5500%2Fclient%2Fverify.html&response_type=token&scope=identify'
        } else if(res.status===500) {
            alert(`Un problème est survenu de notre coté. Merci d'en alerter les administrateurs.`)
        }
    })
} else {
    document.location.href='https://discord.com/api/oauth2/authorize?client_id=1166686401614589994&redirect_uri=http%3A%2F%2F127.0.0.1%3A5500%2Fclient%2Fverify.html&response_type=token&scope=identify'
}
function getTimetable(){
    fetch('http://127.0.0.1:4000/api/timetable', {
        method:'get',
        headers:{
            "Content-Type": "application/json",
            "authorization": uuid,
        }
    }).then(res => {
        if(res.status===200) {
            console.log('UUID VALID')
            res.json().then(resbody =>{
                data=resbody.data
                config=resbody.config
                console.log('CONNECTION FINISHED')
                refresh()
            })
        } else if(res.status===401) {
            alert('Votre jeton de connexion au serveur est invalide ou a expiré. Nous allons nous en occuper.')
            document.location.reload()
        }
    })
}


function refresh(){
    let actualTime = new Date();
    lastUpdateTime.innerText=`${toZero(actualTime.getHours())}h${toZero(actualTime.getMinutes())}:${toZero(actualTime.getSeconds())}`
    constructAndRefreshElems()
    return 'done';
}
function constructAndRefreshElems(){
    weekTypeContainer.innerHTML=''
    for(let i = 1;i<=config.maxWeekType;i++){
        let radioBtn = document.createElement('input')
        radioBtn.type='radio'
        radioBtn.name='weekId'
        radioBtn.value=`week${i}`
        if(i===config.weektype) radioBtn.checked=true
        let indicSpan=document.createElement('span')
        indicSpan.appendChild(radioBtn)
        let nameSpan=document.createElement('span')
        nameSpan.innerText=` Semaine ${i}`
        indicSpan.appendChild(nameSpan)
        let br = document.createElement('br')
        weekTypeContainer.appendChild(indicSpan)
        weekTypeContainer.appendChild(br)
    }
    optToggleContainer.innerHTML=''
    for(opt of Object.entries(config.options)){
        let checkBox = document.createElement('input')
        checkBox.type='checkbox'
        checkBox.value=`${opt[0]}`
        checkBox.checked=opt[1]
        checkBox.optid=opt[0]
        checkBox.addEventListener('input',()=>{
            console.log('SENT CHANGE REQUEST')
            fetch('http://127.0.0.1:4000/api/timetable/edit/options', {
                method:'put',
                headers:{
                    "Content-Type": "application/json",
                    "authorization": uuid,
                },
                body: JSON.stringify({optid: checkBox.optid, optvalue: checkBox.checked})
            }).then(res => {
                if(res.status===200) {
                    console.log('CHANGES ACCEPTED')
                    res.json().then(resbody =>{
                        data=resbody.data
                        config=resbody.config
                        refresh()
                    })
                } else if(res.status===401) {
                    alert('Votre jeton de connexion au serveur est invalide ou a expiré. Nous allons nous en occuper.')
                    document.location.reload()
                } else if(res.status===404) {
                    alert(`Une erreur est survenue quant à la recherche de l'option.`)
                }
            })
        })
        let indicSpan=document.createElement('span')
        indicSpan.appendChild(checkBox)
        let nameSpan=document.createElement('span')
        let optSub = queryOption(opt[0])
        nameSpan.innerText=`${optSub.subject}`
        indicSpan.appendChild(nameSpan)
        let br = document.createElement('br')
        optToggleContainer.appendChild(indicSpan)
        optToggleContainer.appendChild(br)
    }
}

submitChoosenWeek.addEventListener('click',()=>{
    let elemList = document.getElementsByName('weekId');
    for (let elem of elemList) {
        if (elem.checked){
            console.log('SENT CHANGE REQUEST')
            fetch('http://127.0.0.1:4000/api/timetable/edit/week', {
                method:'put',
                headers:{
                    "Content-Type": "application/json",
                    "authorization": uuid,
                },
                body: JSON.stringify({choosenWeek: elem.value})
            }).then(res => {
                if(res.status===200) {
                    console.log('CHANGES ACCEPTED')
                    res.json().then(resbody =>{
                        data=resbody.data
                        config=resbody.config
                        refresh()
                    })
                } else if(res.status===401) {
                    alert('Votre jeton de connexion au serveur est invalide ou a expiré. Nous allons nous en occuper.')
                    document.location.reload()
                } else if(res.status===404) {
                    alert(`Une erreur est survenue quant à la recherche de l'option.`)
                }
            })
        }
    }
})

function queryOption(name){
    for(let week in data){
        if(!(parseInt(week)===config.weektype-1)) continue;
        for(let day of Object.entries(data[week])){
            for(let sub of day[1]){
                if(!(sub.type==='OPTION')) continue;
                if(!(sub.optid===name)) continue;
                return sub;
            }
        }
    }
}