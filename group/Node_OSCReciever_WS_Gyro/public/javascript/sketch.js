

// Create connection to Node.JS Server
const socket = io();


let canvas;
let roll = 0;
let pitch = 0;
let yaw = 0;
let cubes = [];
let spheres=[]
let numCubes = 100;
let numSpheres=100
let x1, y1; // 物体的位置
let radius; // 光晕的半径
let brightness; // 光晕的亮度





function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
 
  createEasyCam();

  x1 = width / 2;
  y1 = height / 2;
  radius = 200;
  brightness = 400;

  for (let i = 0; i < numCubes; i++) {
    let cube = new Cube(random(-200, 800), random(-200, 800), random(-200, 800));
    cubes.push(cube);
  }
  for (let i = 0; i < numSpheres; i++) {
    let sphere = new Sphere(random(-200, 600), random(-200, 600), random(-200, 600));
    
    spheres.push(sphere);
  }
 
 
}

function draw() {
  background(0);

  // 下面的东西不要改
// 基础设置和样式和材质
  // noStroke();
  stroke(255)
  strokeWeight(2)
  // lights();
  ambientLight(100);
  pointLight(255, 255, 255, 0, 0, 200);
  emissiveMaterial(255, 255, 183);
  rotateZ(pitch);
  rotateX(roll);
  rotateY(yaw);

  fill(0, 150, 255);
  ellipse(x1, y1, 200, 200);
  noStroke()

  drawGlow(x1, y1, radius, brightness);

  for (let i = 0; i < numCubes; i++) {
    cubes[i].update();
    cubes[i].display();
  }

  for (let i = 0; i < numSpheres; i++) {
    spheres[i].update();
    spheres[i].display();
  }


}

function drawGlow(x1, y1, radius, brightness) {
  // 使用多个圆圈层叠，每个圆圈透明度逐渐减小，形成光晕效果
  for (let i = 0; i < 5; i++) {
    let alpha = map(i, 0, 5, brightness, 0);
    fill(0, 150, 255, alpha);
    ellipse(x1, y1, radius + i * 10, radius + i * 10);
  }
}


class Cube {
  constructor(x, y, z) {
    this.position = createVector(x, y, z);
    this.color = color(random(255), random(255), random(255));
    // 随机大小
    this.size = random(10, 100);
    // 和重力有关的设置
    // this.velocity = createVector(0, 0, 0); // 初始速度
    // this.acceleration = createVector(0, 0.05, 0); // 重力加速度

   
  }

  update() {
    // 和重力有关的设置
    // this.velocity.add(this.acceleration);
    // this.position.add(this.velocity);
  }

  display() {
    push();
    translate(this.position.x, this.position.y, this.position.z);
    emissiveMaterial(this.color); // 使用 normalMaterial() 设置材质

    stroke(255)
    strokeWeight(2)
    

    box(this.size); // 绘制正方体
    pop();
  }
}

class Sphere {
  constructor(x, y, z) {
    this.position = createVector(x, y, z);
    this.color = color(random(255), random(255), random(255));

    // 颜色测试
    // for (let i = 0; i < 5; i++) {
    //   let alpha = map(i, 0, 5, brightness, 0);
    // this.color =  fill(255, 182, 193, alpha);
    // }

    // 随机大小
    this.size = random(10, 100);
    // 和重力有关的设置
    // this.velocity = createVector(0, 0, 0); // 初始速度
    // this.acceleration = createVector(0, 0.05, 0); // 重力加速度

    
  }

  update() {
    // 和重力有关的设置
    // this.velocity.add(this.acceleration);
    // this.position.add(this.velocity);
  }

  display() {
    push();
    translate(this.position.x, this.position.y, this.position.z);
    emissiveMaterial(this.color); // 使用 normalMaterial() 设置材质
    
 
    stroke(255)
    strokeWeight(2)
    fill(this.color);
    sphere(this.size/2,55,55); // 绘制球体

    // 测试光晕效果
    // sphere(this.size/2,radius + i * 10, radius + i * 10); // 绘制球体

    pop();
  }
}

//process the incoming OSC message and use them for our sketch
function unpackOSC(message){

  /*-------------

  This sketch is set up to work with the gryosc app on the apple store.
  Use either the gyro OR the rrate to see the two different behaviors
  TASK: 
  Change the gyro address to whatever OSC app you are using to send data via OSC
  ---------------*/

  //maps phone rotation directly 
  // if(message.address == "/gyrosc/gyro"){
  //   roll = message.args[0]; 
  //   pitch = message.args[1];
  //   yaw = message.args[2];
  // }

  //uses the rotation rate to keep rotating in a certain direction
  if(message.address == "/gyrosc/rrate"){
    roll += map(message.args[0],-3,3,-0.1,0.1);
    pitch += map(message.args[1],-3,3,-0.1,0.1);
    yaw += map(message.args[2],-3,3,-0.1,0.1);
  }
}

//Events we are listening for
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Connect to Node.JS Server
socket.on("connect", () => {
  console.log(socket.id);
});

// Callback function on the event we disconnect
socket.on("disconnect", () => {
  console.log(socket.id);
});

// Callback function to recieve message from Node.JS
socket.on("message", (_message) => {

  console.log(_message);

  unpackOSC(_message);

});