let radius = 100;
let startTimeH = 0;
let startTimeM = 05;
let startTimeS = 05;
let useStartTimeStamp = false;
//let startTimeStamp = DateToYMDTimeString(new Date(new Date().getTime()+5*60000));
let startTimeStamp;
let timeEnterMode = 0; // 0: no, 1: h, 2: m, 3: s, -1: Timestamp
let params;

let clockCircles = true;
let emptyInside = true;
let doRenderTimeText = true;
let showHelp = false;

let sColor, mColor, hColor, mCurrColor, hCurrColor, textColor = null;

let targettime = 0;
let maxMin = 60;
let maxHour = 12;

function DateToYMDTimeString(dateObj) {
  return (new Date(dateObj + " UTC")).toISOString().replace('T', ' ').slice(0,-5);
}

function DefaultTimeStamp() {
  let date = new Date();
  if (params.time !== undefined) {
    let time = params.time.split(':');
    if (time[1] !== undefined) {
      date.setHours(time[0],time[1]);
    } else {
      date.setHours(time[0]);
    }
    useStartTimeStamp = true;
    console.log(date);
  }
  return date;
}

function getParam(name, fallback) {
  if(params[name] !== undefined) {
    return params[name]
  }
  return fallback;
}

function getParamInt(name, fallback) {
  let value = getParam(name, fallback);
  let intval = parseInt(value);
  return intval == NaN ? fallback : intval;
}

function getParamBool(name, fallback) {
  let fallbackInt = fallback ? 1 : 0;
  let value = getParam(name, fallbackInt);
  return value == 1;
}

function preload() {
  shears = loadFont('shears_modified_v2.ttf');
}

function setup() {
  // canvas setup
  createCanvas(1000, 1000);
  radius = width;
  
  // URL param options
  params = getURLParams();
  startTimeStamp = DateToYMDTimeString(DefaultTimeStamp());
  
  startTimeH = getParamInt('timeH',0);
  startTimeM = getParamInt('timeM',5);
  startTimeS = getParamInt('timeS',5);
  
  clockCircles = getParamBool('clockCircles',true);
  emptyInside = getParamBool('emptyInside',true);
  
  // not yet configurable options
  sColor = color(255, 255, 255, 255);
  mColor = color(255, 255, 255, 255);
  mCurrColor = color(255, 255, 255, 127);
  hColor = color(255, 255, 255, 255);
  hCurrColor = color(255, 255, 255, 127);
  textColor = color(255, 255, 255, 255);
  
  // other setup
  textFont(shears);

  frameRate(30);
  noStroke();

  resetTime();
}

function resetTime() {
  let d;
  let timespan = 0;
  if(useStartTimeStamp) {
    try
    {
      d = new Date(startTimeStamp.trim());
    } catch (e) {
      d = new Date(DateToYMDTimeString(new Date(new Date().getTime()+5*60000)));
    }
  } else {
    d = new Date();
    timespan = (startTimeH * 3600) + (startTimeM * 60) + startTimeS;
  }

  targettime = d.getTime() + (timespan * 1000);
  setMaxCircleAmount();
}

function setMaxCircleAmount() {
  let s = getSeconds();
  let m = s / 60;
  let h = m / 60;

  maxMin = 60;
  maxHour = 12;
  
  if(ceil(h)>12) maxHour = ceil(h);

  if (!clockCircles) {
    if (floor(h) > 0) {
      maxHour = ceil(h);
    } else {
      maxMin = ceil(m);
    }
  }
}

function draw() {
  translate(width / 2, height / 2);
  
  let sTot = 0;
  let h = 0;
  let m = 0;
  let s = 0;
  
  if(!useStartTimeStamp) {
    h = startTimeH;
    m = startTimeM;
    s = startTimeS;
  }
  
  if (timeEnterMode > 0) {
    sTot = 1;
  } else {
    sTot = getSeconds();
    s = sTot % 60;
    let mTot = sTot / 60;
    m = mTot % 60;
    let hTot = mTot / 60;
    h = hTot; // % 60;
  }
  
  clear();
  if (sTot > 0) {
    renderCircles(h, m, s, radius * 0, radius * 0.33, radius * 0.66, radius);
  } else {
    h = 0;
    m = 0;
    s = 0;
  }
  
  textStyle(BOLD);
  if(!emptyInside || h >= 1) {
    erase();
    renderTimeText(floor(h), floor(m), floor(s), height * 0.17);
    noErase();
    //textStyle(NORMAL);
  }
  renderTimeText(floor(h), floor(m), floor(s), height * 0.163);
  
  if(showHelp) {
    renderHelpText(height * 0.17);
  }
}

function renderCircles(h, m, s, hInRad, hRad, mRad, sRad) {
  // make sure arc 0° is at top
  rotate(radians(-90));

  // render second circle
  fill(sColor);
  arc(0, 0, sRad, sRad, 0, radians(360 / 60 * s));

  if (emptyInside || m > 0) {
    erase();
    ellipse(0, 0, mRad);
    noErase();
  }

  // render minutes circle
  if (m > 0) {
    // current minute circle
    fill(mCurrColor);
    arc(0, 0, mRad, mRad, 0, radians(360 / maxMin * m));

    if (floor(m) > 0) {
      // remaining minutes cirlce
      fill(mColor);
      arc(0, 0, mRad, mRad, 0, radians(360 / maxMin * floor(m)));
    }

    if (emptyInside || h >= 1) {
      erase();
      ellipse(0, 0, hRad);
      noErase();
    }
  }

  if (h >= 1) {
    // current hour circle
    fill(hCurrColor);
    arc(0, 0, hRad, hRad, 0, radians(360 / maxHour * h));
    // remaining hours circle
    fill(hColor);
    arc(0, 0, hRad, hRad, 0, radians(360 / maxHour * floor(h)));

    if (emptyInside) {
      erase();
      ellipse(0, 0, hInRad);
      noErase();
    }
  }

  rotate(radians(90));
}

function renderTimeText(h, m, s, tSize) {
  if (!doRenderTimeText) return;

  fill(textColor);
  textAlign(CENTER, CENTER);
  textSize(tSize);
  
  //textSize(170);

  var leftSideText = '';
  var rightSideText = '';
    
  var ShowHours = h>0 && timeEnterMode<3;
    
  var leftNum = ShowHours ? h : m;
  var rightNum = ShowHours ? m : s;
    
  leftSideText += (''+leftNum).length == 1 ? '0' : '';
  leftSideText += leftNum;
    
  rightSideText += (''+rightNum).length == 1 ? '0' : '';
  rightSideText += ''+rightNum;
    
  textAlign(RIGHT,CENTER);
  text(leftSideText, -5, 0);
  
  textAlign(LEFT,CENTER);
  text(rightSideText, 5,0);
  
  textAlign(CENTER, CENTER);
  text(':', 0, -12);
     
  textSize(tSize * 0.25);
  
  if (timeEnterMode == 1) {
    text('Enter Hour', 0, -110);
  } else if (timeEnterMode == 2) {
    text('Enter Minutes', 0, -110);
  } else if (timeEnterMode == 3) {
    text('Enter Seconds', 0, -110);
  } else if (timeEnterMode == -1) {
    text(startTimeStamp, 0, 110);
    text('Enter Timestamp', 0, -110);
  }
}

function renderHelpText(tSize) {
  background('rgba(0%,0%,0%,0.5)');
  fill(textColor);
  textAlign(CENTER, CENTER);
  textSize(tSize * 0.25);
  
  text('<space> - Enter Time\n'+
       '<t> - Enter TimeStamp\n'+
       '<c> - Toggle Clock circles\n'+
       '<e> - Toggle empty inside\n'+
       '<backspace> - Reset timer\n'+
       '<h> or <?> - Toggle this help text',0,0);
}

function keyTyped() {
  console.log('timeEnterMode'+timeEnterMode);
  if (timeEnterMode==-1){
    startTimeStamp += key;
    resetTime();
  } else if (key === ' ' || key === ':') {
    timeEnterMode++;
    useStartTimeStamp = false;
    if(timeEnterMode==1){
      startTimeH = 0;
    } else if (timeEnterMode == 2) {
      startTimeM = 0;
    } else if (timeEnterMode == 3) {
      startTimeS = 0;
    }
  } else if (!isNaN(key)) {
    if (timeEnterMode == 1) {
      startTimeH = startTimeH * 10 + parseInt(key);
    } else if (timeEnterMode == 2) {
      startTimeM = startTimeM * 10 + parseInt(key);
    } else if (timeEnterMode == 3) {
      startTimeS = startTimeS * 10 + parseInt(key);
    }
  } else if (key === 'c') {
    clockCircles = !clockCircles;
    if(timeEnterMode>0)
      resetTime();
    setMaxCircleAmount(); 1
  } else if (key === 'e') {
    emptyInside = !emptyInside;
  } else if (key === 't') {
    timeEnterMode = -1;
    useStartTimeStamp = true;
  } else if (key === 'h' || key === '?') {
    showHelp = !showHelp;
  }
}

function keyPressed() {
  console.log('timeEnterMode'+timeEnterMode);
  if (keyCode === ENTER) {
    timeEnterMode = 0;
    resetTime();
  } else if (keyCode === BACKSPACE) {
    if(timeEnterMode==1){
      startTimeH = 0;
    } else if (timeEnterMode == 2) {
      startTimeM = 0;
    } else if (timeEnterMode == 3) {
      startTimeS = 0;
    } else if (timeEnterMode == -1) {
      startTimeStamp = startTimeStamp.trim().slice(0, -1);
      resetTime();
    } else {
      resetTime();
    }
    return false;
  }
}

function getSeconds() {
  let d = new Date();
  return (targettime - d.getTime()) / 1000;
}