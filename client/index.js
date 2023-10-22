import sm from './sm.js';
sm.init()

let data = Array

let config = Object

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

let updateInterval = setInterval(()=>{
    //updateTime()
    subjectListener()
    time.hour=16
    time.min=6
    time.day='Monday'
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
                if(subject.start===`${toZero(time.hour)}h${toZero(time.min)}`){
                    console.log(subject)
                    found=true
                } else if (found===false) {
                    let subTime = subject.start.split('h')
                    let subEnd = subject.end.split('h')
                    let minusDuration = 0
                    let hourMinusThreshold=0
                    for(let i = parseInt(subEnd[1]);;i--){
                        //console.log(`i ${i}, minusDur ${minusDuration}, hour ${subEnd[0]-hourMinusThreshold} où -${hourMinusThreshold}`)
                        minusDuration++;
                        if(i>0){
                            if(i===parseInt(time.min)&&parseInt(subEnd[0]-hourMinusThreshold)>=time.hour){
                                console.log(subject)
                                found=true
                                Subject.title.innerText=subject.subject
                                Subject.start.innerText=subject.start
                                Subject.end.innerText=subject.end
                                Subject.building.innerText=subject.building
                                Subject.room.innerText=subject.room
                                Subject.teachers.innerHTML='';
                                for(let teacher of subject.teachers){
                                    let teachSpan = document.createElement('span')
                                    if(subject.teachers.length>1){
                                        teachSpan.innerText=`, ${teacher}`
                                    } else teachSpan.innerText=`${teacher}`
                                    Subject.teachers.appendChild(teachSpan)
                                }
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
            console.log('NO SUB')
            Subject.title.innerText='CONGÉ'
            Subject.start.innerText=lastRememberedSubject.end
            Subject.end.innerText='...'
            Subject.building.innerText=``
            Subject.room.innerText=``
            Subject.teachers.innerHTML='';
        }
    }
}