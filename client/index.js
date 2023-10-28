import sm from './sm.js';
sm.init()

let uuid = String

let data = Array

let config = Object

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
            })
        } else if(res.status===401) {
            alert('Votre jeton de connexion au serveur est invalide ou a expiré. Nous allons nous en occuper.')
            document.location.reload()
        }
    })
}

let timeRemainTitle = document.getElementById('timeRemainTitle')

let Subject = { 
    title: document.getElementById('subjectTitle'),
    start: document.getElementById('actualSubjectStartTime'),
    end: document.getElementById('actualSubjectEndTime'),
    building: document.getElementById('actualSubjectBuilding'),
    room: document.getElementById('actualSubjectRoom'),
    teachers: document.getElementById('actualSubjectTeachers')
};

let NextSubject = { 
    title: document.getElementById('nextSubjectTitle'),
    room: document.getElementById('nextSubjectRoom'),
    teachers: document.getElementById('nextSubjectTeachers')
}

let EndSubject = {
    end: document.getElementById('schoolEndTime'),
    place: document.getElementById('schoolEndPlace'),
    remaining: document.getElementById('schoolEndRemainingTime')
}

let time = { hour: Int16Array, min: Int16Array, sec: Int16Array, day: String }
let lastRememberedTime = { hour: Int16Array, min: Int16Array, sec: Int16Array, day: String }
let lastRememberedSubject = Object

updateTime()
subjectListener()

let updateInterval = setInterval(()=>{
    updateTime()
    subjectListener()
    /*time.hour=11
    time.min=27
    time.day='Thursday'*/
},1000)

function toZero(time){
    return ('0'+time).slice(-2)
}

function updateTime() {
    function dayOfWeekAsString(dayIndex) {
        return ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dayIndex] || '';
    }      
    let actualTime = new Date();
    time.hour=('0'+actualTime.getHours()).slice(-2)
    time.min=('0'+actualTime.getMinutes()).slice(-2)
    time.sec=('0'+actualTime.getSeconds()).slice(-2)
    time.day=dayOfWeekAsString(actualTime.getDay());
    console.log(`${time.day}, ${time.hour}h${time.min}:${time.sec}`);
}

function timeConvert(time){
    let hours = Math.floor(time/60);
    let min = Math.round(((time/60)-hours)*60);
    return {hour: hours, mins: min}
}

function subjectListener() {
    for(let week in data){
        let weekObj=data[week]
        if(!(parseInt(week)===config.weektype-1)) continue;
        for(let day of Object.entries(weekObj)){
            if(!(day[0]===time.day)) continue;
            let found = false
            let subjectIndex = -1
            for(let subject of day[1]){
                subjectIndex++
                if(subject.type==='OPTION'){
                    if(!(config.options[subject.optid]===true)) continue;
                }
                if(subject.start===`${toZero(time.hour)}h${toZero(time.min)}`){
                    console.log(subject)
                    found=true
                } else if (found===false) {
                    //console.log('------------------------')
                    let subTime = subject.start.split('h')
                    let subEnd = subject.end.split('h')
                    let minusDuration = 0
                    let hourMinusThreshold = 0
                    for(let i = parseInt(subEnd[1]);;i--){
                        //console.log(`i ${i}, minusDur ${minusDuration}, hour ${subEnd[0]-hourMinusThreshold} où -${hourMinusThreshold}`)
                        minusDuration++;
                        //console.log(minusDuration)
                        if(i>0){
                            if(i===parseInt(time.min)&&parseInt(subEnd[0]-hourMinusThreshold)>=time.hour){
                                //console.log(subject)
                                found=true
                                Subject.title.innerText=subject.subject
                                Subject.start.innerText=subject.start
                                Subject.end.innerText=subject.end
                                Subject.building.innerText=subject.building
                                if(subject.type==='WORK') Subject.room.innerText=subject.room; else Subject.room.innerText='...'
                                Subject.teachers.innerHTML='';
                                if(subject.type==='WORK'){
                                    for(let teacher of subject.teachers){
                                        let teachSpan = document.createElement('span')
                                        if(subject.teachers.length>1){
                                            teachSpan.innerText=`, ${teacher}`
                                        } else teachSpan.innerText=`${teacher}`
                                        Subject.teachers.appendChild(teachSpan)
                                    }
                                }
                                let minSince = parseInt(subEnd[0])*60+parseInt(subEnd[1])
                                let actualMin = parseInt(parseInt(time.hour)*60+parseInt(time.min))
                                let resteDura = minSince-actualMin
                                if(timeConvert(resteDura).hour===0 && !(timeConvert(resteDura).mins===0)){
                                    timeRemainTitle.innerText=`${toZero(timeConvert(resteDura).mins)}min`;
                                } else if (timeConvert(resteDura).mins===0 && !(timeConvert(resteDura).hour===0)){
                                    timeRemainTitle.innerText=`${timeConvert(resteDura).hour}h`;
                                } else timeRemainTitle.innerText=`${timeConvert(resteDura).hour}h${toZero(timeConvert(resteDura).mins)}`;
                                if(day[1][subjectIndex+1]){
                                    NextSubject.teachers.innerHTML='';
                                    NextSubject.title.innerText=day[1][subjectIndex+1].subject;
                                    NextSubject.room.innerText=`${day[1][subjectIndex+1].building}>${day[1][subjectIndex+1].room}`;
                                    if(day[1][subjectIndex+1].type==='WORK'){
                                        for(let teacher of day[1][subjectIndex+1].teachers){
                                            let teachSpan = document.createElement('span')
                                            if(day[1][subjectIndex+1].teachers.length>1){
                                                teachSpan.innerText=`, ${teacher}`
                                            } else teachSpan.innerText=`${teacher}`
                                            NextSubject.teachers.appendChild(teachSpan)
                                        }
                                    }
                                } else {
                                    NextSubject.room.innerText='...'
                                    NextSubject.teachers.innerText='...'
                                    NextSubject.title.innerText='CONGÉ'
                                }
                                let lastSubjectOfDay=day[1][day[1].length-1]
                                EndSubject.end.innerText=lastSubjectOfDay.subject;
                                EndSubject.place.innerText=`${lastSubjectOfDay.building}>${lastSubjectOfDay.room||'...'}`;
                                let subEndLast = lastSubjectOfDay.end.split('h')
                                let endMin = parseInt(subEndLast[0])*60+parseInt(subEndLast[1])
                                let restBeforeEnd = endMin-actualMin
                                if(timeConvert(restBeforeEnd).hour===0 && !(timeConvert(restBeforeEnd).mins===0)){
                                    EndSubject.remaining.innerText=`${toZero(timeConvert(restBeforeEnd).mins)}min`;
                                } else if (timeConvert(restBeforeEnd).mins===0 && !(timeConvert(restBeforeEnd).hour===0)){
                                    EndSubject.remaining.innerText=`${timeConvert(restBeforeEnd).hour}h`;
                                } else EndSubject.remaining.innerText=`${timeConvert(restBeforeEnd).hour}h${toZero(timeConvert(restBeforeEnd).mins)}`;
                                return;
                            }
                        } else if(minusDuration<subject.duration){
                            i=60
                            hourMinusThreshold++
                        } else {
                            lastRememberedSubject=subject
                            //console.log('NEXT')
                            break;
                        }
                    }
                }
            }
            Subject.title.innerText='CONGÉ'
            Subject.start.innerText=lastRememberedSubject.end
            Subject.end.innerText='...'
            Subject.building.innerText=``
            Subject.room.innerText=``
            Subject.teachers.innerHTML='';
            NextSubject.room.innerText='...'
            NextSubject.teachers.innerText='...'
            NextSubject.title.innerText='...'
            EndSubject.end.innerText='...'
            EndSubject.place.innerText='...'
            EndSubject.remaining.innerText='Demain'
            timeRemainTitle.innerText=':)'
        }
    }
}

