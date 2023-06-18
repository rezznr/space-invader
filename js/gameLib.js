/*----------------------------------------- gameLib.js ------------------------------
	gamelib merupakan kumpulan kode yang digunakan untuk mempermudah pembuatan game menggunakan kode HTML 5
	Programer 		: Wandah Wibawanto
	Lisensi			: CC, SA, BY (Creative Common, Share Alike, Credit)
	LOG :
	2 juli	2021	: penambahan fitur mobile
	5 Juli 2021		: menghapus fitur lain, tinggal fitur dasar saja
	20 juli 2021	: penambahan fitur platformer buildmap
	31 juli 2021	: penambahan fitur RPG
//----------------------------------------------------------------------------------*/
var dataGambar = {};
var dataSuara = {};
var konten;
var canvas;
var gameArea;
var touchScale;
var smoothing = false;
var warnaBG;
var funcDB = [];
var isMobile = false;
var joyStick = {
  stat: true,
  out: false,
  px: 0,
  py: 0,
  sx: 0,
  sy: 0,
  id: 0,
  rad: 100,
  pos: "left",
  angle: 0,
  kanan: false,
  atas: false,
  kiri: false,
  bawah: false,
};
var isTouch = false;
//---mouse
var totalOffsetX = 0;
var totalOffsetY = 0;
var canvasX = 0;
var canvasY = 0;
var currentElement;
var newWidth;
var newHeight;
var arena = {};
var game = {};
var gravitasi = 0.5;
var screenW = 0;
var screenH = 0;

var sizeBtn;
//-----------------preload-------------------------------
function loading(img, snd, func) {
  siapkanGambar(img, function (images) {
    dataGambar = images;
    // //("gfx loaded");
    siapkanSuara(snd, function (sound) {
      dataSuara = sound;
      // //("sfx loaded");
      jalankan(func);
    });
  });
}

function siapkanSuara(sources, callback) {
  var sound = {};
  var loadedSound = 0;
  var numSound = 0;
  // get num of sources
  for (var src in sources) {
    numSound++;
  }
  if (numSound > 0) {
    //gambar preloader
    hapusLayar();
    //teks("loading sound", canvas.width/2, canvas.height/2-20);
    kotakr(
      canvas.width / 2 - 150,
      canvas.height / 2 - 10,
      300,
      15,
      4,
      2,
      "white",
      "none"
    );
    for (var src in sources) {
      sound[src] = game.folder + "/" + sources[src];
      hapusLayar();
      teks("loading sound", canvas.width / 2, canvas.height / 2 - 20);
      var persen = (loadedSound / numSound) * 300; //300 = panjang preloader
      kotakr(
        canvas.width / 2 - 150,
        canvas.height / 2 - 10,
        persen,
        15,
        4,
        2,
        "white",
        "white"
      );
      kotakr(
        canvas.width / 2 - 150,
        canvas.height / 2 - 10,
        300,
        15,
        4,
        2,
        "white",
        "none"
      );
      if (++loadedSound >= numSound) {
        callback(sound);
      }
    }
  } else {
    callback(sound);
  }
}

function siapkanGambar(sources, callback) {
  var images = {};
  var loadedImages = 0;
  var numImages = 0;
  konten.webkitImageSmoothingEnabled = smoothing;
  konten.mozImageSmoothingEnabled = smoothing;
  konten.imageSmoothingEnabled = smoothing;
  // get num of sources
  for (var src in sources) {
    numImages++;
  }
  //gambar preloader
  hapusLayar();
  //teks("loading graphic", canvas.width/2, canvas.height/2-20);
  kotakr(
    canvas.width / 2 - 150,
    canvas.height / 2 - 10,
    300,
    15,
    4,
    2,
    "white",
    "none"
  );

  for (var src in sources) {
    images[src] = new Image();
    images[src].onload = function () {
      //tampilkan preloading baris
      hapusLayar();
      teks("loading graphic", canvas.width / 2, canvas.height / 2 - 20);
      var persen = (loadedImages / numImages) * 300; //300 = panjang preloader
      kotakr(
        canvas.width / 2 - 150,
        canvas.height / 2 - 10,
        persen,
        15,
        4,
        2,
        "white",
        "white"
      );
      kotakr(
        canvas.width / 2 - 150,
        canvas.height / 2 - 10,
        300,
        15,
        4,
        2,
        "white",
        "none"
      );
      if (++loadedImages >= numImages) {
        callback(images);
      }
    };
    images[src].src = game.folder + "/" + sources[src];
  }
}
//--------------------
function animasi(data) {
  sprite(data);
  if (data.frameRate == undefined) {
    data.frameRate = 3;
    data.frameTimer = 0;
  }
  if (!game.pause) data.frameTimer++;
  if (data.frameTimer > data.frameRate) {
    data.frameTimer = 0;
    data.frame++;
    if (data.frame > data.maxFrame) data.frame = 1;
  }
}

function setSprite(img, lebar = 0, tinggi = 0) {
  var ob = {};
  var imgW = img.width;
  var imgH = img.height;
  ob.img = img;
  if (lebar == 0 || tinggi == 0) {
    ob.lebar = img.width;
    ob.tinggi = img.height;
  } else {
    ob.lebar = lebar;
    ob.tinggi = tinggi;
  }
  var divX = Math.floor(imgW / ob.lebar);
  var divY = Math.floor(imgH / ob.tinggi);
  var maxFrame = divX * divY;
  ob.x = 0;
  ob.y = 0;
  ob.frame = 1;
  ob.step = 1;
  ob.skalaX = 1;
  ob.skalaY = 1;
  ob.rotasi = 0;
  ob.timer = 0;
  ob.playOnce = false;
  ob.mati = false;
  ob.maxFrame = maxFrame;
  //animasi delay
  ob.delay = 10;
  ob.offsetX = 2; //tepat ditengah
  ob.offsetY = 2;
  ob.animJalan = 0;
  ob.animLompat = 0;
  ob.animJatuh = 0;
  ob.animMati = 0;
  ob.animKena = 0;
  ob.animTangga = 0;
  ob.animDiam = 0;
  return ob;
}

function sprite(data, frm = 0) {
  var imgW = data.img.width;
  var imgH = data.img.height;
  if (data.lebar == undefined) data.lebar = imgW;
  if (data.tinggi == undefined) data.tinggi = imgH;
  var divX = Math.floor(imgW / data.lebar);
  var divY = Math.floor(imgH / data.tinggi);
  var maxFrame = divX * divY;
  data.maxFrame = maxFrame;
  var fr;
  if (frm == 0) {
    if (data.frame == undefined) {
      data.frame = 1;
    }
  } else {
    data.frame = frm;
  }
  if (data.frame > data.maxFrame) data.frame = data.maxFrame;
  fr = data.frame;
  var frameY = Math.floor((fr - 1) / divX);
  var frameX = fr - 1 - frameY * divX;
  if (data.x == undefined || data.y == undefined) {
    data.x = 0;
    data.y = 0;
  }
  if (data.skalaX == undefined || data.skalaX == null) data.skalaX = 1;
  if (data.skalaY == undefined || data.skalaY == null) data.skalaY = 1;
  if (data.rotasi == undefined) data.rotasi = 0;
  if (data.mati == undefined || data.mati == false) {
    if (data.rotasi == 0) {
      if (data.skalaX == 1 && data.skalaY == 1) {
        konten.drawImage(
          data.img,
          frameX * data.lebar,
          frameY * data.tinggi,
          data.lebar,
          data.tinggi,
          data.x - (data.lebar * game.skalaSprite) / data.offsetX,
          data.y - (data.tinggi * game.skalaSprite) / data.offsetY,
          data.lebar * game.skalaSprite,
          data.tinggi * game.skalaSprite
        );
      } else {
        konten.save();
        konten.translate(data.x, data.y);
        konten.scale(data.skalaX, data.skalaY);
        konten.drawImage(
          data.img,
          frameX * data.lebar,
          frameY * data.tinggi,
          data.lebar,
          data.tinggi,
          -(data.lebar * game.skalaSprite) / data.offsetX,
          -(data.tinggi * game.skalaSprite) / data.offsetY,
          data.lebar * game.skalaSprite,
          data.tinggi * game.skalaSprite
        );
        konten.restore();
      }
    } else {
      //gambar berotasi
      konten.save();
      konten.translate(data.x, data.y);
      konten.rotate((data.rotasi * Math.PI) / 180.0);
      konten.translate(-data.x, -data.y);
      konten.drawImage(
        data.img,
        frameX * data.lebar,
        frameY * data.tinggi,
        data.lebar,
        data.tinggi,
        data.x - (data.lebar * game.skalaSprite) / data.offsetX,
        data.y - (data.tinggi * game.skalaSprite) / data.offsetY,
        data.lebar * game.skalaSprite,
        data.tinggi * game.skalaSprite
      );
      konten.restore();
    }
  }
}

function tampilkanGambar(img, px = 0, py = 0, stat = "") {
  if (stat == "") {
    konten.drawImage(img, px - img.width / 2, py - img.height / 2);
  } else {
    if (stat.indexOf("skala=") > -1) {
      var skl = Number(stat.substr(6)) / 100;
      konten.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        px - (img.width * skl) / 2,
        py - (img.height * skl) / 2,
        img.width * skl,
        img.height * skl
      );
    } else if (stat.indexOf("rotasi=") > -1) {
      var rot = Number(stat.substr(7));
      konten.save();
      konten.translate(px, py);
      konten.rotate((rot * Math.PI) / 180.0);
      konten.translate(-px, -py);
      konten.drawImage(img, px - img.width / 2, py - img.height / 2);
      konten.restore();
    } else if (stat.indexOf("alpha=") > -1) {
      var alp = Number(stat.substr(6));
      konten.save();
      konten.globalAlpha = alp / 100;
      konten.drawImage(img, px - img.width / 2, py - img.height / 2);
      konten.globalAlpha = 1;
      konten.restore();
    } else {
      konten.drawImage(img, px - img.width / 2, py - img.height / 2);
    }
  }
}

function gambarFull(img) {
  konten.drawImage(
    img,
    0,
    0,
    img.width,
    img.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
}

function loopSprite(data) {
  data.timer++;
  if (data.maxFrame == 1) {
    data.frame = 1;
  } else {
    if (data.timer > 2) {
      data.timer = 0;
      data.frame++;
      //karakter
      if (data.playOnce) {
        data.frame = data.maxFrame;
      } else {
        if (data.frame > data.maxFrame) {
          data.frame = 1;
        }
      }
    }
  }
  sprite(data);
}

function hapusLayar(wrn = warnaBG, ob = {}) {
  warnaBG = wrn;
  game.timer++;
  konten.clearRect(0, 0, canvas.width, canvas.height);
  konten.fillStyle = warnaBG;
  konten.fillRect(0, 0, canvas.width, canvas.height);
  if (ob.stat == "run") {
    funcDB.push(ob.func);
  }
  if (ob.stat == "clear") {
    funcDB = [];
  }
  if (funcDB.length > 0) jalankan(funcDB[0]);
}

//kotak rounded
function kotakr(
  x,
  y,
  width,
  height,
  radius = 5,
  tbl = 1,
  stroke = "#000",
  fill = "#fff"
) {
  radius = { tl: radius, tr: radius, br: radius, bl: radius };
  konten.beginPath();
  konten.moveTo(x + radius.tl, y);
  konten.lineTo(x + width - radius.tr, y);
  konten.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  konten.lineTo(x + width, y + height - radius.br);
  konten.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius.br,
    y + height
  );
  konten.lineTo(x + radius.bl, y + height);
  konten.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  konten.lineTo(x, y + radius.tl);
  konten.quadraticCurveTo(x, y, x + radius.tl, y);
  konten.closePath();
  if (fill != "none") {
    konten.fillStyle = fill;
    konten.fill();
  }
  if (stroke != "none") {
    konten.lineWidth = tbl;
    konten.strokeStyle = stroke;
    konten.stroke();
  }
}

function setGame(res = "") {
  canvas = document.getElementById("canvas");
  konten = canvas.getContext("2d");
  gameArea = document.getElementById("gameArea").getBoundingClientRect();
  score = 0;
  if (res == "") {
    konten.canvas.width = window.innerWidth;
    konten.canvas.height = window.innerHeight;
    screenW = window.innerWidth;
    screenH = window.innerHeight;
  } else {
    var sz = res.split("x");
    screenW = parseInt(sz[0]);
    screenH = parseInt(sz[1]);
    konten.canvas.width = screenW;
    konten.canvas.height = screenH;
  }
  game = {};
  game.aktif = true;
  game.lebar = screenW;
  game.tinggi = screenH;
  game.oriW = screenW;
  game.oriH = screenH;
  game.areaW = gameArea.width;
  game.areaH = gameArea.height;
  game.font = "Calibri-normal-20pt-left-hitam-normal-1.6";
  game.smoothing = false;
  game.pause = false;
  game.folder = "assets";
  game.orient = "landscape";
  game.fullscreen = false;
  game.isMobile = false;
  game.lompat = false;
  game.suaraAktif = true;
  game.musikAktif = false;
  game.transisi = false;
  game.lastAktif = game.aktif;
  game.debug = true;
  game.mouse = { x: 0, y: 0 };
  game.score = 0;
  game.hiScore = 0;
  game.fps = 30;
  game.timer = 0;
  game.level = 1;
  game.skalaSprite = 1;
  game.warnaTransisi = "#000";
  // trace("ukuran layar = " + konten.canvas.width + " x " + konten.canvas.height);
  // trace("ukuran canvas = " + canvas.width + " x " + canvas.height);
  // trace("ukuran game Area = " + gameArea.width + " x " + gameArea.height);
  // trace("ukuran display  = " + game.oriW + " x " + game.oriH);

  touchScale = {
    x: gameArea.width / konten.canvas.width,
    y: gameArea.height / konten.canvas.height,
  };
  aktifkanKeyboard();
  // trace("input keyboard & mouse aktif");
  hapusLayar("#333");
  //mouse
  canvas.onmousedown = mouseDown;
  canvas.onmouseup = mouseUp;
  canvas.onmousemove = mouseMove;
  canvas.oncontextmenu = function (e) {
    e.preventDefault();
    e.stopPropagation();
  };
  //updateOffset();
}

function updateOffset() {
  //mouse pos
  currentElement = canvas;
  totalOffsetX = 0;
  totalOffsetY = 0;
  do {
    totalOffsetX += currentElement.offsetLeft;
    totalOffsetY += currentElement.offsetTop;
  } while ((currentElement = currentElement.offsetParent));
}

//mouse
function mousePos(e) {
  updateOffset();
  canvasX = e.pageX - totalOffsetX;
  canvasY = e.pageY - totalOffsetY;

  // Fix for variable canvas width
  canvasX = Math.round(canvasX * (canvas.width / canvas.offsetWidth));
  canvasY = Math.round(canvasY * (canvas.height / canvas.offsetHeight));

  //return {x:canvasX, y:canvasY}
}
function mouseDown(e) {
  updateOffset();
  game.mouseDitekan = true;
  mousePos(e);
  game.mouse = { x: canvasX, y: canvasY };
  game.dragX = game.mouse.x;
  game.dragY = game.mouse.y;
  game.clickX = game.mouse.x;
  game.clickY = game.mouse.y;
  //trace(game.clickX+" "+game.clickY);
  //trace(touchScale.x+" "+touchScale.y);
}
function mouseUp(e) {
  game.mouseDitekan = false;
  mousePos(e);
  game.mouse = { x: canvasX, y: canvasY };
  game.dragX = game.mouse.x;
  game.dragY = game.mouse.y;
  game.clickX = game.mouse.x;
  game.clickY = game.mouse.y;
}
function mouseMove(e) {
  mousePos(e);
  game.dragX = game.mouse.x;
  game.dragY = game.mouse.y;
}

//---------------------- keyboard --------------------
var atas = false;
var bawah = false;
var kiri = false;
var kanan = false;
var spasi = false;
var tombolP = false;
//-----------------keyboard listener -------------------------
function tombolditekan(event) {
  game.keyCode = event.keyCode;
  game.kodeTombol = event.keyCode;
  if (!game.pause && game.aktif) {
    if (event.keyCode == 37) {
      kiri = true;
      game.kiri = true;
    }
    if (event.keyCode == 38) {
      atas = true;
      game.atas = true;
    }
    if (event.keyCode == 39) {
      kanan = true;
      game.kanan = true;
    }
    if (event.keyCode == 40) {
      bawah = true;
      game.bawah = true;
    }
    if (event.keyCode == 32) {
      spasi = true;
      game.spasi = true;
    }
  }
  if (event.keyCode == 80) {
    tombolP = true;
  }
}
function tomboldilepas(event) {
  if (event.keyCode == 37) {
    kiri = false;
    game.kiri = false;
  }
  if (event.keyCode == 38) {
    atas = false;
    game.atas = false;
  }
  if (event.keyCode == 39) {
    kanan = false;
    game.kanan = false;
  }
  if (event.keyCode == 40) {
    bawah = false;
    game.bawah = false;
  }
  if (event.keyCode == 32) {
    spasi = false;
    game.spasi = false;
  }
  if (event.keyCode == 80) {
    tombolP = false;
    game.pause = !game.pause;
  }
  game.keyCode = null;
}
function aktifkanKeyboard() {
  addEventListener("keydown", tombolditekan);
  addEventListener("keyup", tomboldilepas);
  isMobile = deteksiMobile();
  game.isMobile = isMobile;
  if (isMobile) {
    //set touch
    // console.log("touch active");
    canvas.addEventListener("touchend", touchEnd, false);
    canvas.addEventListener("touchmove", touchMove, false);
    canvas.addEventListener("touchstart", touchStart, false);
    window.addEventListener("orientationchange", resizeMobile, false);
    window.addEventListener("resize", resizeMobile, false);
  }
}

//------------- tombol------
function tombol(img, px = 0, py = 0) {
  tampilkanGambar(img, px, py);
  var rx = px;
  var ry = py;
  var obx = { x: rx, y: ry, lebar: img.width, tinggi: img.height };
  //kotakr(rx,ry, img.width,img.height, 5, 1, "#000", "none");
  return obx;
}

function tekan(tom) {
  var res = false;
  if (game.mouseDitekan) {
    if (
      game.mouse.x > tom.x - tom.lebar / 2 &&
      game.mouse.x < tom.x + tom.lebar / 2 &&
      game.mouse.y > tom.y - tom.tinggi / 2 &&
      game.mouse.y < tom.y + tom.tinggi / 2
    ) {
      game.mouseDitekan = false;
      res = true;
    }
  }
  return res;
}

function trace(str) {
  if (game.debug) console.log(str);
}
//---------------------- GAME RUNNING ----------------
var loopFunc = null;
var fpsInterval = 1000 / 30;
var then = Date.now();
var startTime = then;
function jalankan(func) {
  /*movingOb = {};
    clearInterval(game.loop);
    var speed = 900/game.fps;
    game.loop = setInterval(func, speed);
    */
  loopFunc = func;
  fpsInterval = 900 / game.fps;
  cancelAnimationFrame(game.loop);
  setTimeout(rafLoops, 1);
}

function rafLoops() {
  game.loop = requestAnimationFrame(rafLoops);
  //var now = Date.now();
  //var elapsed = now - then;
  //if (elapsed > fpsInterval) {
  //	then = now - (elapsed % fpsInterval);
  loopFunc();
  //}
}

var kedip = 0;
function cekAlign(txt) {
  var res = txt;
  if (txt == "tengah") res = "center";
  if (txt == "kiri") res = "left";
  if (txt == "kanan") res = "kanan";
  return res;
}
function cekWarna(txt) {
  var res = txt;
  var cl = txt.split("|");
  if (cl[0] == "hitam") res = "black";
  if (cl[0] == "putih") res = "white";
  if (cl[0] == "biru") res = "#0066ff";
  if (cl[0] == "hijau") res = "#39f43e";
  if (cl[0] == "merah") res = "#ed2d2d";
  if (cl[0] == "jingga") res = "#ffd146";
  if (cl[0] == "kuning") res = "#ffea00";
  if (cl[0] == "ungu") res = "#b026ff";
  if (cl[0] == "pink") res = "#ff7e7e";
  if (cl[0] == "tosca") res = "#0faf9a";
  if (cl[0] == "abuabu") res = "#7a7a7a";
  var res2 = "none";
  if (cl.length > 1) {
    if (cl[1] == "hitam") res2 = "black";
    if (cl[1] == "putih") res2 = "white";
    if (cl[1] == "biru") res2 = "#0066ff";
    if (cl[1] == "hijau") res2 = "#39f43e";
    if (cl[1] == "merah") res2 = "#ed2d2d";
    if (cl[1] == "jingga") res2 = "#ffd146";
    if (cl[1] == "kuning") res2 = "#ffea00";
    if (cl[1] == "ungu") res2 = "#b026ff";
    if (cl[1] == "pink") res2 = "#ff7e7e";
    if (cl[1] == "tosca") res2 = "#0faf9a";
    if (cl[1] == "abuabu") res2 = "#7a7a7a";
  }
  var ob = { c1: res, c2: res2 };
  return ob;
}
function teks(txt, px, py, stl = "") {
  var efek = 0;
  var st = stl;
  if (stl == "") {
    //Calibri-normal-30pt-left-hitam-normal-1.6
    st = game.font;
  }
  st = st.split("-");
  //konten.font = "bold 14pt Calibri";
  //konten.fillStyle = '#000';
  //konten.textAlign = 'center';
  //}else{
  //parsing dulu font nya
  //"Calibri-bold-30pt-left-biru|hitam-kedip
  var fnt = "";
  if (st.length == 1) {
    konten.font = "bold 14pt " + st[0];
    konten.fillStyle = "#000";
    konten.textAlign = "center";
  }
  if (st.length == 2) {
    konten.font = st[1] + " 14pt " + st[0];
    konten.fillStyle = "#000";
    konten.textAlign = "center";
  }
  if (st.length == 3) {
    konten.font = st[1] + " " + st[2] + " " + st[0];
    konten.fillStyle = "#000";
    konten.textAlign = "center";
  }
  if (st.length == 4) {
    konten.font = st[1] + " " + st[2] + " " + st[0];
    konten.fillStyle = "#000";
    konten.textAlign = cekAlign(st[3]);
  }
  if (st.length == 5) {
    konten.font = st[1] + " " + st[2] + " " + st[0];
    konten.fillStyle = cekWarna(st[4]).c1;
    konten.textAlign = cekAlign(st[3]);
    //stroke
    if (cekWarna(st[4]).c2 != "none") {
      konten.strokeStyle = cekWarna(st[4]).c2;
    }
  }
  if (st.length >= 6) {
    konten.font = st[1] + " " + st[2] + " " + st[0];
    konten.fillStyle = cekWarna(st[4]).c1;
    konten.textAlign = cekAlign(st[3]);
    //stroke
    if (cekWarna(st[4]).c2 != "none") {
      konten.strokeStyle = cekWarna(st[4]).c2;
    }
    //kedip
    if (st[5] == "kedip") {
      efek = 1;
      kedip++;
      if (kedip > 30) kedip = 0;
    }
  }
  //}
  if (efek == 1 && kedip < 13) {
    if (st.length > 4 && cekWarna(st[4]).c2 != "none")
      konten.strokeText(txt, px, py);
    konten.fillText(txt, px, py);
  }
  if (efek == 0) {
    if (st.length > 4 && cekWarna(st[4]).c2 != "none")
      konten.strokeText(txt, px, py);
    konten.fillText(txt, px, py);
  }
  return txt;
}

function mainkanSuara(snd, vol = 100) {
  if (game.suaraAktif) {
    var sa = new Sound(snd);

    sa.volume(vol / 100);
    sa.play();
  }
}

/* View in fullscreen */
function openFullscreen() {
  var scene = document.getElementById("gameArea");
  // if (scene.requestFullscreen) {
  //   scene.requestFullscreen();
  // } else if (scene.webkitRequestFullscreen) {
  //   /* Safari */
  //   scene.webkitRequestFullscreen();
  // } else if (scene.msRequestFullscreen) {
  //   /* IE11 */
  //   scene.msRequestFullscreen();
  // }
  // Supports most browsers and their versions.
  var requestMethod =
    scene.requestFullScreen ||
    scene.webkitRequestFullScreen ||
    scene.mozRequestFullScreen ||
    scene.msRequestFullScreen;

  if (requestMethod) {
    // Native full screen.
    requestMethod.call(scene);
  } else if (typeof window.ActiveXObject !== "undefined") {
    // Older IE.
    var wscript = new ActiveXObject("WScript.Shell");
    if (wscript !== null) {
      wscript.SendKeys("{F11}");
    }
  }
  resize(true);
}
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    /* IE11 */
    document.msExitFullscreen();
  }
  resize(false);
}
function screenSize(full) {
  if (full) {
    newWidth = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    newHeight = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );
  } else {
    newWidth = game.oriW;
    newHeight = game.oriH;
  }
}
function resize(full = true) {
  screenSize(full);
  var gA = document.getElementById("gameArea");
  if (full) {
    gameArea.width = newWidth;
    gameArea.height = newHeight;
    setTimeout(function () {
      screenSize(true);
      gameArea.height = newHeight;
      getOrient();
      trace("area full = " + gameArea.width + " x " + gameArea.height);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      gA.style.width = newWidth + "px";
      gA.style.height = newHeight + "px";
    }, 10);
  } else {
    //setTimeout(function() {
    gameArea.width = game.areaW;
    screenSize(false);
    gameArea.height = game.areaH;
    getOrient();
    trace("area = " + gameArea.width + " x " + gameArea.height);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    gA.style.width = game.areaW + "px";
    gA.style.height = game.areaH + "px";
    //}, 1000);
  }
}

function forceFullscreen() {
  var gA = document.getElementById("gameArea");
  if (isMobile && game.fullscreen) {
    newWidth = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    newHeight = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );
    if (gameArea.height != newHeight) {
      gameArea.height = newHeight;
    }
  }
}

function getOrient() {
  //orientasi
  if (isMobile) {
    if (window.innerWidth < window.innerHeight) {
      game.orient = "portrait";
    } else {
      game.orient = "landscape";
    }
  }
}

function resizeMobile() {
  if (game.fullscreen) {
    resize(true);
  } else {
    resize(false);
  }
}
//--------------------touch ----------------------------
function deteksiMobile() {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}

function resizeBtn(px, py) {
  if (dataGambar.maxBtn != undefined && dataGambar.minBtn != undefined) {
    if (!game.fullscreen) {
      sizeBtn = tombol(dataGambar.maxBtn, px, py);
      if (tekan(sizeBtn)) {
        game.fullscreen = true;
        game.mouseDitekan = false;
        openFullscreen();
      }
      if (document.fullscreenElement != null) {
        game.fullscreen = true;
        resize(true);
      }
    } else {
      sizeBtn = tombol(dataGambar.minBtn, px, py);
      if (tekan(sizeBtn)) {
        game.fullscreen = false;
        game.mouseDitekan = false;
        closeFullscreen();
      }
      //escape
      if (document.fullscreenElement === null) {
        game.fullscreen = false;
        resize(false);
      }
    }
  }
}

function tiltWarn() {
  gambarFull(dataGambar.tilt);
}

function isOK() {
  var res = true;
  if (isMobile) {
    if (game.fullscreen && game.orient != "landscape") {
      res = false;
    }
  }
  return res;
}

function cloneArray(arr) {
  return JSON.parse(JSON.stringify(arr));
}
