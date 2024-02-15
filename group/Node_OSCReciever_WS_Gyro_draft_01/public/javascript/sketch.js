

// Create connection to Node.JS Server
const socket = io();


let canvas;
let roll = 0;
let pitch = 0;
let yaw = 0;
let cubes = [];
let shapes = []
let numCubes = 100;
let numShapes = 100
let x1, y1; // 物体的位置
let radius; // 光晕的半径
let brightness; // 光晕的亮度

let px, py, pz;
let prepx, prepy, prepz;
let fireDirX, fireDirY, fireDirZ
let fireworkVel
let fireworkState = 0


function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);

  createEasyCam();

  x1 = width / 2;
  y1 = height / 2;
  radius = 200;
  brightness = 400;
  px = 0
  py = 0
  pz = 0
  prepx = px
  prepy = py
  prepz = pz
  fireworkVel = createVector(0, 0)
  createShapes()
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
  if (fireworkState == 0) {
    translate(px, py, pz)
  }
  // rotateZ(pitch);
  // rotateX(roll);
  rotateY(yaw);
  fill(0, 150, 255);
  noStroke()

  // drawGlow(x1, y1, radius, brightness);

  for (let i = 0; i < shapes.length; i++) {
    shapes[i].update();
    shapes[i].display();
  } for (let i = shapes.length - 1; i >= 0; i--) {
    if (shapes[i].position.y > height * 2) {
      shapes.splice(i, 1)
    }
  }

  if (shapes.length == 0) {
    createShapes()
    fireworkState=0
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



function createShapes() {
  for (let i = 0; i < numCubes; i++) {
    let cube = new Shape(random(-300, 300), random(-300, 300), random(-600, 100), 0);
    shapes.push(cube);
  }
  for (let i = 0; i < numShapes; i++) {
    let sphere = new Shape(random(-300, 300), random(-300, 300), random(-600, 100), 1);
    shapes.push(sphere);
  }
}
class Shape {
  constructor(x, y, z, t) {
    this.position = createVector(x, y, z);
    this.color = color(random(255), random(255), random(255));
    this.velocity = createVector(0, 0)
    this.acceleration = createVector(0, 0)
    this.type = t
    this.state = 0;

    this.currentSize = 0
    // 颜色测试
    // for (let i = 0; i < 5; i++) {
    //   let alpha = map(i, 0, 5, brightness, 0);
    //   this.color =  fill(255, 182, 193, alpha);
    // }

    // 随机大小
    this.targetSize = random(12, 36);


  }

  update() {
    if (this.targetSize > this.currentSize + 0.5) {
      this.currentSize = lerp(this.currentSize, this.targetSize, 0.03)

    }
    // 和速度有关的设置
    if (this.state == 1) {
      this.position.add(this.velocity)
      this.velocity.add(0, 0.02 * this.currentSize)
      this.velocity.mult(0.998)
    }
  }
  firework() {
    this.velocity = createVector(0, 0)
    this.acceleration = fireworkVel.copy().mult(random(80, 100))
    this.acceleration.add(p5.Vector.random3D().mult(random(50, 150)))
    this.velocity.add(this.acceleration)
    this.velocity.limit(30)
    this.state = 1;
  }
  display() {
    push();
    translate(this.position.x, this.position.y, this.position.z);
    emissiveMaterial(this.color); // 使用 normalMaterial() 设置材质


    stroke(255)
    strokeWeight(2)
    if (this.type == 0) {
      rotateX(this.position.y * 0.003)
      rotateY(this.position.x * 0.003)
      box(this.currentSize); // 绘制正方体
    } else {
      fill(this.color);
      sphere(this.currentSize / 2, 55, 55); // 绘制球体
    }
    // 测试光晕效果

    pop();
  }

}

//process the incoming OSC message and use them for our sketch
function unpackOSC(message) {

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
  if (message.address == "/gyrosc/grav") {
    let scl = 20000
    px = map(message.args[0], -3, 3, -0.1, 0.1) * scl;
    py = map(message.args[1], -3, 3, -0.1, 0.1) * scl;
    pz = map(message.args[2], -3, 3, -0.1, 0.1) * scl;
    // print(dist(px, py, pz, prepx, prepy, prepz))
    if (fireworkState == 0 && py - prepy < 90 && dist(px, py, pz, prepx, prepy, prepz) > 200 && frameCount > 10) {
      fireDirX = px - prepx
      fireDirY = py - prepy
      fireDirZ = pz - prepz
      fireworkVel.set(fireDirX, fireDirY, fireDirZ).setMag(5)
      fireAll()
    }
    prepx = px
    prepy = py
    prepz = pz
  }

  if (message.address == "/gyrosc/rrate") {
    roll += map(message.args[0], -3, 3, -0.1, 0.1);
    pitch += map(message.args[1], -3, 3, -0.1, 0.1);
    yaw += map(message.args[2], -3, 3, -0.1, 0.1);
  }
}

function fireAll() {
  fireworkState = 1
  for (let i = 0; i < shapes.length; i++) {
    shapes[i].firework();
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

  // console.log(_message);

  unpackOSC(_message);

});