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

let updateInterval = setInterval(()=>{
    updateTime()
    subjectListener()
    /*time.hour=8
    time.min=55*/
},500)

function updateTime() {
    function dayOfWeekAsString(dayIndex) {
        return ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dayIndex] || '';
    }      
    let actualTime = new Date();
    time.hour=actualTime.getHours();
    time.min=actualTime.getMinutes();
    time.sec=actualTime.getSeconds();
    time.day=dayOfWeekAsString(actualTime.getDay());
    console.log(`${time.day}, ${time.hour}h${time.min}:${time.sec}`);
}

function subjectListener() {
    for(let week in data){
        let weekObj=data[week]
        if(!(parseInt(week)===config.weektype-1)) continue;
        for(let day of Object.entries(weekObj)){
            if(!(day[0]===time.day)) continue;
            for(let subject of day[1]){
                
            }
        }
    }
}