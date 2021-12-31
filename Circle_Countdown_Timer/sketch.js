// Links to this script:
// https://editor.p5js.org/romibi/sketches/UF3JWTqzs
// https://github.com/romibi/p5.js-Playground/tree/master/Circle_Countdown_Timer/sketch.js
let radius = 100;
let startTimeH = 0;
let startTimeM = 55;
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

// MREM settings
let useMixedRealityEffectMode = false;
let experimentalHighQualityShadow = false;
let textImgDiv = 8;

let sColor, mColor, hColor, mCurrColor, hCurrColor, textColor, fgColor, bgColor, bg2Color = null;

let targettime = 0;
let maxMin = 60;
let maxHour = 12;
let radiusModifier = (17/12);
let textSizeModifier = 1;
let textImgTextSizeModifier = 1;
let pixelModifier = 1; // wrong at the start

let textImg;
let blurrBgImg;

function DateToYMDTimeString(dateObj) {
  return (new Date(dateObj + " UTC")).toISOString().replace('T', ' ').slice(0,-5);
}

function DefaultTimeStamp() {
  let date = new Date();
  if (params.time !== undefined) {
    let time = params.time.split(':');
    if (time[2] !== undefined) {
      date.setHours(time[0],time[1],time[2]);
    } else if (time[1] !== undefined) {
      date.setHours(time[0],time[1],0);
    } else {
      date.setHours(time[0],0,0);
    }
    useStartTimeStamp = true;
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
  //createCanvas(1000,1000);
  createCanvas(1920, 1080); 
  //createCanvas(3840, 2160);
  //createCanvas(768, 432);
    
  // URL param options
  params = getURLParams();
  
  useMixedRealityEffectMode = getParamBool('mrEffectMode',useMixedRealityEffectMode);
  experimentalHighQualityShadow = getParamBool('hqExp',experimentalHighQualityShadow);
  
  startTimeStamp = DateToYMDTimeString(DefaultTimeStamp());
  
  startTimeH = getParamInt('timeH',startTimeH);
  startTimeM = getParamInt('timeM',startTimeM);
  startTimeS = getParamInt('timeS',startTimeS);
  
  clockCircles = getParamBool('clockCircles',true);
  emptyInside = getParamBool('emptyInside',true);
   
  // other setup
  
  // [START] fakey fakey blurr image
  textImg = createGraphics(width/textImgDiv, height/textImgDiv);
  textImg.textFont(shears);
  textImg.noStroke();
  
  let backupVar = useMixedRealityEffectMode;
  useMixedRealityEffectMode = true;
  updateGlobalModifiers();
  blurrBgImg = getTimeTextImg(0,8,8, radius * 0.165, color(0,0,0,127), false, '88');
  blurrBgImg.filter(BLUR, 10/textImgDiv);
  
  useMixedRealityEffectMode = backupVar;
  // [END] fakey fakey blurr image
  
  textImg = createGraphics(width/textImgDiv, height/textImgDiv);
  
  textFont(shears);
  textImg.textFont(shears);

  frameRate(30);
  noStroke();  
  textImg.noStroke();

  resetTime();
  updateGlobalModifiers();
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
  clear();
  
  // calculate some stuff
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
  
  // draw
   
  push();
  if(useMixedRealityEffectMode){
    // draw main stuff centered in upper right quadrant
    translate(width * (3/4), height * (1/4));
    
    // draw mask bg
    fill(bgColor);
    // fill upper right quadrant
    rect(-width*(1/4),-height*(1/4),width/2,height/2);
  } else {
    // draw in middle
    translate(width / 2, height / 2);
  }
  
  renderMainClockView(sTot, h, m, s);
  
  if(showHelp) {
    renderHelpText(height * 0.085);
  }
  
  pop();
  
  // cleanup spilling to other quadrants
  if(useMixedRealityEffectMode) {
    erase();
    // clean upper left quadrant
    rect(0,0,width/2,height/2);
    // clean lower right quadrant
    rect(width/2,height/2,width/2,height/2);
    // don't clean lower left quadrant?
    noErase();
  
   
    push();
    // draw bg stuff centered in lower left quadrant
    translate(width * (1/4), height * (3/4));
    renderBGView(sTot, h, m, s);
    
    pop();
    push();
    // draw fg stuff centered in upper left quadrant
    translate(width * (1/4), height * (1/4));
    renderFGView(sTot, h, m, s);
    pop();
  }
}

function renderMainClockView(sTot, h, m, s) {
  // render
  if (sTot > 0) {
    renderCircles(h, m, s, radius * 0, radius * 0.33, radius * 0.66, radius);
  } else {
    h = 0;
    m = 0;
    s = 0;
  }
  
  textStyle(BOLD);
  fill(bgColor);
  renderTimeText(floor(h), floor(m), floor(s), radius * 0.163);
}

function renderBGView(sTot, h, m, s) {
  if (sTot <= 0) {
    h = 0;
    m = 0;
    s = 0;
  }
  
  textStyle(BOLD);
  
  // draw mask bg
  fill(bg2Color);
  // fill upper right quadrant
  rect(-width*(1/4),-height*(1/4),width/2,height/2);
  
  if (experimentalHighQualityShadow){
    let tImg = getTimeTextImg(floor(h), floor(m), floor(s), radius * 0.165, bgColor);
    tImg.filter(BLUR,5/textImgDiv);
    image(tImg,-tImg.width/2*textImgDiv,-tImg.height/2*textImgDiv, tImg.width*textImgDiv, tImg.height*textImgDiv);
  } else {
    image(blurrBgImg, -blurrBgImg.width/2*textImgDiv, -blurrBgImg.height/2*textImgDiv, blurrBgImg.width*textImgDiv, blurrBgImg.height*textImgDiv);
    image(blurrBgImg, -blurrBgImg.width/2*textImgDiv, -blurrBgImg.height/2*textImgDiv, blurrBgImg.width*textImgDiv, blurrBgImg.height*textImgDiv);
    renderTimeText(floor(h), floor(m), floor(s), radius * 0.163, bg2Color);
  }
  //renderTimeText(floor(h), floor(m), floor(s), radius * 0.163);
}

function renderFGView(sTot, h, m, s) {
  if (sTot <= 0) {
    h = 0;
    m = 0;
    s = 0;
  }
  
  textStyle(BOLD);
  renderTimeText(floor(h), floor(m), floor(s), radius * 0.163, fgColor);
}

function updateGlobalModifiers() {
  mCurrColor = color(255, 255, 255, 127);
  hCurrColor = color(255, 255, 255, 127);
  textColor = color(255, 255, 255, 255);
  
  if(useMixedRealityEffectMode){
    sColor = color(255, 255, 255, 230);
    mColor = color(255, 255, 255, 230);
    hColor = color(255, 255, 255, 230);
    fgColor = color(255, 255, 255, 200);
    bgColor = color(0,0,0,255);
    bg2Color = color(0,0,0,127);
    
    radius = height*radiusModifier / 2;
    textSizeModifier = 0.5;
  } else {
    sColor = color(255, 255, 255, 255);
    mColor = color(255, 255, 255, 255);
    hColor = color(255, 255, 255, 255);
    
    radius = height*radiusModifier;
    textSizeModifier = 1;
  }
  
  textImgTextSizeModifier = (textImg.height/height);
  
  // the arbitrary numbers in the text rendering were found while the canvas height was 1000 and the radius was half the canvas height
  pixelModifier = (radius/500);
}

function renderCircles(h, m, s, hInRad, hRad, mRad, sRad) {
  // make sure arc 0° is at top
  rotate(radians(-90));

  // render second circle
  fill(sColor);
  arc(0, 0, sRad, sRad, 0, radians(360 / 60 * s));

  if (emptyInside || m > 0) {
    conditionalErase();
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
      conditionalErase();
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
      conditionalErase();
      ellipse(0, 0, hInRad);
      noErase();
    }
  }

  rotate(radians(90));
}

function renderTimeText(h, m, s, tSize, tColor) {
  if (!doRenderTimeText) return;
  getTimeTextImg(h,m,s,tSize,tColor, true);
}

function getTimeTextImg(h, m, s, tSize, tColor, doRenderDirectly, textOverride) {
  if(typeof tColor === 'undefined') tColor = textColor;
  let useOverride = false;
  if(typeof textOverride !== 'undefined') useOverride = true;
  if(typeof doRenderDirectly === 'undefined') doRenderDirectly = false;
  
  let localPixelModifier = 1;
  let localtextImgTextSizeModifier = 1;
  
  let img;
  
  if(doRenderDirectly) {
    img = self;
  } else {
    img = textImg;
    img.clear();
    img.push();
    img.translate(textImg.width/2,textImg.height/2);
    localtextImgTextSizeModifier = textImgTextSizeModifier;
    localPixelModifier = pixelModifier * localtextImgTextSizeModifier;
  }
  
  
  img.fill(tColor);
  img.textAlign(CENTER, CENTER);
  img.textSize(tSize * localtextImgTextSizeModifier);
  
  var leftSideText = '';
  var rightSideText = '';
    
  var ShowHours = h>0 && timeEnterMode<3;
    
  var leftNum = ShowHours ? h : m;
  var rightNum = ShowHours ? m : s;
        
  leftSideText += (''+leftNum).length == 1 ? '0' : '';
  leftSideText += leftNum;
    
  rightSideText += (''+rightNum).length == 1 ? '0' : '';
  rightSideText += ''+rightNum;
  
  if(useOverride){
    leftSideText = textOverride;
    rightSideText = textOverride;
  }
    
  img.textAlign(RIGHT,CENTER);
  img.text(leftSideText, -5*localPixelModifier, 0);
  
  img.textAlign(LEFT,CENTER);
  img.text(rightSideText, 5*localPixelModifier,0);
  
  img.textAlign(CENTER, CENTER);
  img.text(':', 0, -12*localPixelModifier);
     
  img.textSize(tSize * 0.25 * localtextImgTextSizeModifier);
  
  if (timeEnterMode == 1) {
    img.text('Enter Hour', 0, -110*localPixelModifier);
  } else if (timeEnterMode == 2) {
    img.text('Enter Minutes', 0, -110*localPixelModifier);
  } else if (timeEnterMode == 3) {
    img.text('Enter Seconds', 0, -110*localPixelModifier);
  } else if (timeEnterMode == -1) {
    img.text(startTimeStamp, 0, 110*localPixelModifier);
    img.text('Enter Timestamp', 0, -110*localPixelModifier);
  }
  if(!doRenderDirectly) {
    img.pop();
  }
  return img;
}

function conditionalErase() {
  if(!useMixedRealityEffectMode) {
    erase();
  }else{
    fill(bgColor);
  }
}

function renderHelpText(tSize) {
  background('rgba(0%,0%,0%,0.5)');
  fill(textColor);
  textAlign(CENTER, CENTER);
  textSize(tSize * textSizeModifier);
  
  text('<space> - Enter Time\n'+
       '<t> - Enter TimeStamp\n'+
       '<c> - Toggle Clock circles\n'+
       '<e> - Toggle empty inside\n'+
       '<backspace> - Reset timer\n'+
       '<h> or <?> - Toggle this help text\n'+
       '<m> - MixedRealityEffect Mode',0,0);
}

function keyTyped() {
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
  } else if (key === 'm') {
    useMixedRealityEffectMode = !useMixedRealityEffectMode;
  }
  updateGlobalModifiers();
}

function keyPressed() {
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
