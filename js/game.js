import EnemyController from "./EnemyController.js";
import Player from "./Player.js";
import BulletController from "./BulletController.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

const background = new Image();
background.src = "images/space.png";

var score = 0;

const playerBulletController = new BulletController(canvas, 10, "red", true);
const enemyBulletController = new BulletController(canvas, 4, "white", false);
const enemyController = new EnemyController(
  canvas,
  enemyBulletController,
  playerBulletController
);
const player = new Player(canvas, 3, playerBulletController);

let isGameOver = false;
let didWin = false;

setGame("1200x600");
game.folder = "assets";
//file gambar yang dipakai dalam game
var gambar = {
  // logo: "logo.png",
  // startBtn: "tombolStart.png",
  cover: "cover.png",
  playBtn: "btn-play.png",
  maxBtn: "maxBtn.png",
  minBtn: "minBtn.png",
  restartBtn: "restartbtn.png",
  homeBtn: "homeBtn.png",
};
//file suara yang dipakai dalam game
var suara = {};

//load gambar dan suara lalu jalankan startScreen
loading(gambar, suara, halamanCover);

function halamanCover() {
  gambarFull(dataGambar.cover);
  var playBtn = tombol(dataGambar.playBtn, 580, 450);
  if (tekan(playBtn)) {
    setAwal();
    jalankan(gameLoop);
  }
  resizeBtn(1150, 50);
}

function Game() {
  const game = () => {
    checkGameOver();
    // drawScore();
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    displayGameOver();
    if (!isGameOver) {
      enemyController.draw(ctx);
      player.draw(ctx);
      playerBulletController.draw(ctx);
      enemyBulletController.draw(ctx);
    }
  };

  const displayGameOver = () => {
    if (isGameOver) {
      let text = didWin ? "YOU WIN" : "GAME OVER";
      // let textOffset = didWin ? 3.5 : 5;
      if (!didWin) {
        var restartBtn = tombol(dataGambar.restartBtn, 580, 450);
        if (tekan(restartBtn)) {
          // halamanCover();
          // isGameOver = false;
          // jalankan(gameLoop);
          restartGame();
          console.log("restart btn");
        }
      } else {
        var restartBtn = tombol(dataGambar.homeBtn, 580, 450);
        if (tekan(restartBtn)) {
          // halamanCover();
          // isGameOver = false;
          // jalankan(gameLoop);
          restartGame();
          console.log("home btn");
        }
      }

      ctx.fillStyle = "white";
      ctx.font = "70px Copperplate";
      ctx.textAlign = "center";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
  };

  function restartGame() {
    // Mengulang permainan dari awal dengan me-reload halaman
    location.reload();
  }

  const checkGameOver = () => {
    // if (isGameOver) {
    //   return;
    // }

    if (enemyBulletController.collideWith(player)) {
      isGameOver = true;
    }

    if (enemyController.collideWith(player)) {
      isGameOver = true;
    }

    if (enemyController.enemyRows.length === 0) {
      didWin = true;
      isGameOver = true;
    }
  };
  // game();
  // displayGameOver();
  // checkGameOver();
  setInterval(game, 1000 / 60);
}

function setAwal() {
  // Game();
  Game();
}

function gameLoop() {
  // hapusLayar("#67d2d6");
}

// setAwal();
