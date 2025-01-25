let currentsong = new Audio();
let tracker = false;
let songs;
let currFolder;
let index;
let left;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  seconds = Math.round(seconds);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

function libraryscroll() {
  const upper = document.querySelector(".upper");
  let y = upper.scrollTop;
}

const playMusic = (track, pause = false) => {
  tracker = true;
  currentsong.src = `/${currFolder}/${track}` + ".mp3";
  if (!pause) {
    currentsong.play().catch((e) => {
      alert("don't change the music so fast");
    });
    play.src = "svgs/paused.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
};

async function getsongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songsul = document.querySelector(".songs").getElementsByTagName("ul")[0];
  songsul.innerHTML = "";
  for (const song of songs) {
    let artist = song.replaceAll("%20", " ").split(".mp3")[0].split("-")[0];
    let songname = song.replaceAll("%20", " ").split(".mp3")[0].split("-")[1];
    songsul.innerHTML =
      songsul.innerHTML +
      `<li class="gradborder flex alignitems-center spacebetween">
                              <div class="flex flexcolumn maingap">
                                <div id="artist">${artist}</div>
                                <div id="songname">${songname}</div>
                                </div>
                              <img src="svgs/playbtn.svg" alt="">
                            </li>`;
  }

  Array.from(
    document.querySelector(".songs").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(
        `${e.querySelector("#artist").innerHTML.trim()} - ${e
          .querySelector("#songname")
          .innerHTML.trim()}`
      );
    });
  });
  return songs;
}

async function displayalbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let array = Array.from(div.getElementsByTagName("a"));
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-2)[0];
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      let cardcontainer = document.querySelector(".cardcontainer");
      cardcontainer.innerHTML =
        cardcontainer.innerHTML +
        `<div data-folder="${folder}" class="card flex flexcolumn borderad gap">
              <div class="relative">
                <img src="/songs/${folder}/cover.jpg" alt="albumcover" class="borderad cardwidth" />
                <div class="playbutton">
                  <img src="svgs/playbutton.svg" alt="playbutton" />
                </div>
              </div>
              <div class="cardwidth smal">${response.title}</div>
              <p class="small cardwidth">
                ${response.description}
              </p>
            </div>`;
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      index = 0;
      playMusic(songs[index].split(".mp3")[0]);
    });
  });
}

(async function main() {
  await getsongs("songs/21");

  play.addEventListener("click", () => {
    if (tracker === false) {
      alert("Play a song first");
    } else {
      if (currentsong.paused) {
        currentsong.play().catch((e) => {
          alert("don't change the music so fast");
        });
        play.src = "svgs/paused.svg";
      } else {
        currentsong.pause();
        play.src = "svgs/play.svg";
      }
    }
  });

  displayalbums();

  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentsong.currentTime
    )}
    /
    ${formatTime(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 99 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    left = document.querySelector(".left").style.left;
    document.querySelector(".left").style.left = "0%";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = `${left}`;
  });

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index > 0) {
      playMusic(songs[index - 1].split(".mp3")[0]);
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (!(index == songs.length - 1)) {
      playMusic(songs[index + 1].split(".mp3")[0]);
    }
  });

  document.querySelector("#range").addEventListener("change", (e) => {
    currentsong.volume = parseInt(e.target.value) / 100;
    if(currentsong.volume>0){
      document.querySelector(".volbutton").src = "svgs/volume.svg";
    }
  });

  document.querySelector(".volbutton").addEventListener("click", (e) => {
    if (currentsong.volume !== 0) {
      document.querySelector(".volbutton").src = "svgs/mute.svg";
      currentsong.volume = 0;
      document.querySelector("#range").value = 0;
    } else {
      document.querySelector(".volbutton").src = "svgs/volume.svg";
      currentsong.volume = 0.1;
      document.querySelector("#range").value = 10;
    }
  });
  currentsong.addEventListener("timeupdate", () => {
    if (currentsong.currentTime == currentsong.duration) {
      if (index < songs.length) {
        index += 1;
        playMusic(songs[index].split(".mp3")[0]);
      }
    }
  });
})();
