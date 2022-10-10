const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const wrapper = document.querySelector(".wrapper")

const PlAYER_STORAGE_KEY = "F8_PLAYER";

const playlist = $('.playlist')
const cd =$('.cd')
const cdWidth = cd.offsetWidth

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const player = $('.player')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')

const btnNext = $('.btn-next')
const btnPrev = $('.btn-prev')

const randomBtn = $('.btn-random')
const repeatBtn = $(".btn-repeat");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  // (1/2) Uncomment the line below to use localStorage
  config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Có Chơi Có Chịu",
      singer: "KARIK x ONLY C",
      path: "./acsets/Music/song2.mp3",
      image: "./acsets/img/img2.jpg",
    },
    {
      name: "Waiting For You",
      singer: "MONO x Onionn",
      path: "./acsets/Music/song1.mp3",
      image: "./acsets/img/img1.jpg",
    },
    {
      name: "Mặt Mộc",
      singer: "Phạm Nguyên Ngọc x VAnh x Ân Nhi",
      path: "./acsets/Music/song3.mp3",
      image: "./acsets/img/img3.jpg",
    },
    {
      name: "Em Còn Nhớ Anh Không?",
      singer: "Hoàng Tôn (Feat. Koo)",
      path: "./acsets/Music/song4.mp3",
      image: "./acsets/img/img4.jpg",
    },
    {
      name: "Lời Tạm Biệt Chưa Nói",
      singer: "Kai Đinh x CaoTri",
      path: "./acsets/Music/song5.mp3",
      image: "./acsets/img/img5.jpg",
    },
    {
      name: "Chờ Đợi Có Đáng Sợ",
      singer: "Andiez",
      path: "./acsets/Music/song6.mp3",
      image: "./acsets/img/img6.jpg",
    },
    {
      name: "Yêu Một Nguời Có Lẽ",
      singer: "Miu Le x Lou Hoang",
      path: "./acsets/Music/song7.mp3",
      image: "./acsets/img/img7.jpg",
    },
  ],

  setConfig: function (key, value) {
    this.config[key] = value;
    // (2/2) Uncomment the line below to use localStorage
    localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

    defineProperty: function() {
      Object.defineProperty(this, 'currentSong', {
        get: function() {
          return this.songs[this.currentIndex]
        }
      })
    },

     //Hàm Render code
     render: function() {
      const html = this.songs.map((song, index) => {
        return `
        <div class="song ${index === this.currentIndex ? 'active' : ""}" data-index = ${index}>
          <div class="thumb" style="background-image: url('${song.image}')">
          </div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
              </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>
        `  
      })
      playlist.innerHTML = html.join("");


    },

    // Hàm bắt sự kiện
    handleEvent: function() {
      const _this = this;


      // Xử lí xoay ảnh khi play
      const cdThumbAnimate = cdThumb.animate(
        { transform: 'rotate(360deg)' },
        {
          duration: 10000,
          iterations: Infinity
        }
      )
      cdThumbAnimate.pause();

      
      // Xử lí phóng to/ thu nhỏ đĩa CD
      document.onscroll = function () {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const newCdWidth = cdWidth - scrollTop;
  
        cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
        cd.style.opacity = newCdWidth / cdWidth;
      };

      // Khi tiến độ bài hát thay đổi
      audio.addEventListener("timeupdate", (e)=>{
        const currentTime = e.target.currentTime; //đang phát bài hát hiện tại
        const duration = e.target.duration; //nhận tổng thời lượng phát bài hát
        if (audio.duration) {
          const progressPercent = Math.floor(
            (audio.currentTime / duration) * 100
          );
          progress.value = progressPercent;
        }
        let musicCurrentTime = $(".current-time"),
        musicDuartion = $(".max-duration");
        audio.addEventListener("loadeddata", ()=>{
          // update song total duration
          let mainAdDuration = audio.duration;
          let totalMin = Math.floor(mainAdDuration / 60);
          let totalSec = Math.floor(mainAdDuration % 60);
          if(totalSec < 10){ //if sec is less than 10 then add 0 before it
            totalSec = `0${totalSec}`;
          }
          musicDuartion.innerText = `${totalMin}:${totalSec}`;
        });
        // update playing song current time
        let currentMin = Math.floor(currentTime / 60);
        let currentSec = Math.floor(currentTime % 60);
        if(currentSec < 10){ //if sec is less than 10 then add 0 before it
          currentSec = `0${currentSec}`;
        }
        musicCurrentTime.innerText = `${currentMin}:${currentSec}`;
      });

      // Xử lí khi chạy play
      playBtn.onclick = function() {
        if(_this.isPlaying) {
            audio.pause()
        } else {
            audio.play()
        }
      }

      // Khi song duoc play
      audio.onplay = function(){
        _this.isPlaying = true;
        player.classList.add('playing')
        cdThumbAnimate.play();
      }

      // Khi song duoc pause
      audio.onpause = function(){
        _this.isPlaying = false;
        player.classList.remove('playing')
        cdThumbAnimate.pause();
      }
      

      // Xử lí khi tua song
      progress.onchange = function(e) {
        const seekTime = audio.duration / 100 * e.target.value
        audio.currentTime = seekTime
      }

      // Xử lí next song
      btnNext.onclick = function() {
        if (_this.isRandom){
          _this.playRandom();
        } else {
          _this.nextSong()
        }
        audio.play()
        _this.render()
        _this.scrollToActiveSong();
      }

      // Xử lí prev song
      btnPrev.onclick = function() {
        if (_this.isRandom){
          _this.playRandom();
        } else {
          _this.prevSong()
        }
        audio.play()
        _this.render()
        _this.scrollToActiveSong();
      }

      // random bài hát
      randomBtn.onclick = function(e) {
        _this.isRandom = !_this.isRandom
        randomBtn.classList.toggle('active', _this.isRandom)
        _this.setConfig("isRandom", _this.isRandom);
      }

      // Xử lí phát lại song
      repeatBtn.onclick = function(e) {
        _this.isRepeat = !_this.isRepeat
        repeatBtn.classList.toggle('active', _this.isRepeat)
        _this.setConfig("isRepeat", _this.isRepeat);
      }

      // Xử lí next song audio ended
      audio.onended = function() {
        if(_this.isRepeat) {
          audio.play()
        } else {
          nextBtn.click()
        }
      }

      // Lắng nghe hành vi click vào playlist
      playlist.onclick = function(e) {
        songNode = e.target.closest('.song:not(.active)')
        if(songNode || e.target.closest('.option')){

          if(songNode) {
            _this.currentIndex = Number(songNode.dataset.index);
            _this.loodCurrentSong();
            _this.render();
            audio.play();
          }
          if(option) {

          }
        }
      }
    },



    loodCurrentSong: function() {
      heading.textContent = this.currentSong.name
      cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
      audio.src = this.currentSong.path
    },

    // Hàm next
    nextSong: function() {
      this.currentIndex ++;
      if(this.currentIndex > this.songs.length) {
        this.currentIndex = 0;
      }
      this.loodCurrentSong();
    },

    // Hàm prev
    prevSong: function() {
      this.currentIndex --;
      if(this.currentIndex < 0) {
        this.currentIndex = this.songs.length - 1;
      }
      this.loodCurrentSong();
    },

    // Hàm config
    loadConfig: function() {
      this.isRandom = this.config.isRandom
      this.isRepeat = this.config.isRepeat
    },
    

    // Hàm random
    playRandom: function() {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * this.songs.length)
      } while (newIndex === this.currentIndex ) {
        this.currentIndex = newIndex;
        this.loodCurrentSong();
      }
    },

    // scroll list
    scrollToActiveSong: function () {
      let _this = this;
        setTimeout(() =>{
          $('.song.active').scrollIntoView({
            behavior: 'smooth',
            block: _this.currentIndex < 2 ? "end" : "center",
          })
        }, 300)
    },

    start: function() {
      this.loadConfig()

      // Định nghĩa thuộc tính cho Object
      this.defineProperty()

      // Lắng nghe xử lí xự kiện (DOM event)
      this.handleEvent();

      // Get ra bài hát đầu tiên
      this.loodCurrentSong();

      // Render Playlist
      this.render();

      randomBtn.classList.toggle("active", this.isRandom);
      repeatBtn.classList.toggle("active", this.isRepeat);
    },
}

app.start();

