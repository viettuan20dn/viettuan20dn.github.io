const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("audio");
const player = $(".player");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");
const PLAYER_STORAGE_KEY = "T4-Player";

const app = {
  currentIndex: 0,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  songs: [
    {
      name: "Nevada",
      singer: "Vicetone x Cozi",
      path: "./assets/music/nevada.mp3",
      image: "./assets/img/nevada.jpg",
    },
    {
      name: "Chúng ta của hiện tại",
      singer: "Sơn Tùng MTP",
      path: "./assets/music/ctcht.mp3",
      image: "./assets/img/ctcht.jpg",
    },
    {
      name: "Đếm ngày xa em",
      singer: "Chipmunk",
      path: "./assets/music/dnxe.mp3",
      image: "./assets/img/dnxe.jpg",
    },
    {
      name: "Hôm nay tôi buồn",
      singer: "Phùng Khánh Link",
      path: "./assets/music/hntb.mp3",
      image: "./assets/img/hntb.jpg",
    },
    {
      name: "Sứ thanh hoa",
      singer: "Châu Kiệt Luân",
      path: "./assets/music/suthanhhoa.mp3",
      image: "./assets/img/sth.jpg",
    },
    {
      name: "forever young",
      singer: "Alan Walker",
      path: "./assets/music/foreveryoung.mp3",
      image: "./assets/img/fy.jpg",
    },
  ],
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
      <div class="song ${index ? "" : "active"}" data-idx=${index}>
        <div class="thumb" style="background-image: url('${song.image}')"></div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
        <div class="option">
          <i class="fas fa-ellipsis-h"></i>
        </div>
      </div>
    `;
    });
    playlist.innerHTML = htmls.join("");
  },
  handleEvents: function () {
    let cdWidth = cd.offsetWidth;
    let _this = this;
    document.onscroll = function () {
      let scrollNum = window.scrollY || document.documentElement.scrollTop;
      let newWidth = cdWidth - scrollNum;
      cd.style.width = (newWidth >= 0 ? newWidth : 0) + "px";
      cd.style.opacity = newWidth / cdWidth;
    };
    //Handle next song
    nextBtn.onclick = function () {
      if (randomBtn.classList.contains("active")) {
        _this.randomSong();
        audio.play();
      } else {
        _this.nextSong();
        audio.play();
      }
      _this.scrollIntoViewSong();
    };

    //Handle prev song
    prevBtn.onclick = function () {
      if (randomBtn.classList.contains("active")) {
        _this.randomSong();
        audio.play();
      } else {
        _this.prevSong();
        audio.play();
      }
      _this.scrollIntoViewSong();
    };

    //Handle random song
    randomBtn.onclick = function () {
      if (randomBtn.classList.contains("active")) {
        _this.setConfig('isRandom',false);
        randomBtn.classList.remove("active");
      } else {
        _this.setConfig('isRandom',true);
        randomBtn.classList.add("active");
      }
    };

    //Handle ended song
    audio.onended = function () {
      if (repeatBtn.classList.contains("active")) {
        audio.play();
      } else {
        nextBtn.click();
      }
      _this.scrollIntoViewSong();
    };

    //Handle repeat
    repeatBtn.onclick = function () {
      if (repeatBtn.classList.contains("active")) {
        _this.setConfig('isRepeat',false);
        repeatBtn.classList.remove("active");
      } else {
        _this.setConfig('isRepeat',true);
        repeatBtn.classList.add("active");
      }
    };

    //Handle click a song
    playlist.onclick = function (e) {
      const clickSong = e.target.closest(".song:not(.active)");
      if (clickSong && !e.target.closest(".option")) {
        _this.currentIndex = clickSong.dataset.idx;
        _this.loadCurrentSong();
        _this.activeCurrentSong();
        audio.play();
      }
    };
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  loadCurrentSong: function () {
    heading.innerHTML = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  handlePlaySong: function () {
    // Bắt sự kiện audio đang chạy.
    audio.ontimeupdate = function () {
      let currentProgressByPercent = (audio.currentTime / audio.duration) * 100;
      progress.value = isNaN(currentProgressByPercent)
        ? 0
        : currentProgressByPercent;
    };

    let rotateCd = cdThumb.animate(
      [
        {
          transform: "rotate(360deg)",
        },
      ],
      {
        duration: 10000,
        iterations: Infinity,
      }
    );
    rotateCd.pause();

    audio.onplay = function () {
      rotateCd.play();
      player.classList.add("playing");
    };
    audio.onpause = function () {
      rotateCd.pause();
      const player = $(".player");
      player.classList.remove("playing");
    };

    playBtn.onclick = function () {
      if (player.classList.contains("playing")) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    progress.oninput = function (e) {
      let seekTime = Math.floor((progress.value / 100) * audio.duration);
      audio.currentTime = seekTime;
    };
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
    this.activeCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
    this.activeCurrentSong();
  },
  randomSong: function () {
    let randomNum;
    do {
      randomNum = Math.round(Math.random() * (this.songs.length - 1));
    } while (randomNum == this.currentIndex);

    this.currentIndex = randomNum;
    this.loadCurrentSong();
    this.activeCurrentSong();
  },
  activeCurrentSong: function () {
    const songsNode = $$(".song");

    Array.from(songsNode).forEach((element) => {
      if (element.classList.contains("active")) {
        element.classList.remove("active");
      }
    });
    songsNode[this.currentIndex].classList.add("active");
  },
  scrollIntoViewSong: function () {
    let activeSong = $(".song.active");
    if (this.currentIndex < 1) {
      activeSong.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      activeSong.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  },
  loadConfig: function(){
    (this.config.isRepeat)?repeatBtn.classList.add('active'):"";
    (this.config.isRandom)?randomBtn.classList.add('active'):"";
  }
  ,
  start: function () {
    this.defineProperties();
    this.handleEvents();
    this.loadCurrentSong();
    this.handlePlaySong();
    this.loadConfig();
    this.render();
  },
};

app.start();
