let currentSongIndex = -1;
let currentSong = new Audio(); //point as global var
// create a JavaScript function to convert seconds to the "minutes:seconds"
let songs;
let currFolder;
function secondsToMinutesSecond(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    currentSongIndex = -1;

    // show all the song in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                                <img class="invert" src="./music.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div>Wahaj</div>
                                </div>
                                <div class="playNow">
                                    <span>Play Now</span>
                                    <img class="invert" src="./img/play.svg" alt="">
                                </div> </li>`
    }
    // Har song pe ek event listener attach karein
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", async element => {
            // Pichle playlist item se highlight hataye (if any)
            const previousPlaylistItem = document.querySelector('.songList ul li.highlight');
            if (previousPlaylistItem) {
                previousPlaylistItem.classList.remove('highlight');
            }

            // Clicked playlist item ko green border se highlight karein
            e.classList.add('highlight');

            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());

            // Update the currentSongIndex
            currentSongIndex = index;

            // Highlight the first playlist item with green border
            const firstPlaylistItem = document.querySelector('.songList ul li:first-child');
            if (firstPlaylistItem) {
                firstPlaylistItem.classList.add('highlight');
            }
        });
    });

    // Playlist kisi bhi jagah pe click ho, to green border hataye
    document.querySelector(".songList ul").addEventListener("click", () => {
        const previousPlaylistItem = document.querySelector('.songList ul li.highlight');
        if (previousPlaylistItem) {
            previousPlaylistItem.classList.remove('highlight');
        }
    });

    
    return songs;
}
currentSong.addEventListener("ended", () => {
        playNextSong()
})

function playNextSong(){
    if(currentSongIndex !== -1 && currentSongIndex < songs.length - 1){
        // increment the current song index 
        currentSongIndex++;

        // play next song 
        playMusic(songs[currentSongIndex]);

        // highlight the white border on next song 
        highlightCard(currentSongIndex)
    }
}

const playMusic = (track, pause = false) => {
    // Remove highlight from the previous playlist item
    const previousPlaylistItem = document.querySelector('.songList ul li.highlight');
    if (previousPlaylistItem) {
        previousPlaylistItem.classList.remove('highlight');
    }

    currentSong.src = `/${currFolder}/` + track; // Playing the current song once at a time

    if (!pause) { // If the song was not paused, then play
        currentSong.play();
        play.src = "./img/pause.svg";
    }

    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";

    // Highlight the first playlist item with green border
    const firstPlaylistItem = document.querySelector('.songList ul li:first-child');
    if (firstPlaylistItem) {
        firstPlaylistItem.classList.add('highlight');
    }
};



async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-1)[0];
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);

            if (a.ok) {
                let response = await a.json();

                cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                stroke="black" stroke-width="1.5" stroke-linejoin="round" fill="black" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;

                // add an event listener to each card
                cardContainer.lastElementChild.addEventListener("click", async item => {
                    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                });
            } else {
                console.error(`Error fetching info.json for ${folder}: ${a.status} ${a.statusText}`);
            }
        }
    };

    // load the playlist whenever card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach((e, index) => {
        e.addEventListener("click", async item => {
            // Highlight the clicked card
            highlightCard(index);

            // Highlight the first playlist item with green border
            const firstPlaylistItem = document.querySelector('.songList ul li:first-child');
            if (firstPlaylistItem) {
                firstPlaylistItem.classList.add('highlight');
            }

            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })
    })

    // aadd an event listener to previous  
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
            highlightCard(index - 1);
        }
    });

    // aadd an event listener to next  
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
            highlightCard(index + 1);
        }
    });
}

// highlight playlist border 
function highlightCard(index) {
    // Remove highlight from the previous card
    const previousCard = document.querySelector('.highlight');
    if (previousCard) {
        previousCard.classList.remove('highlight');
    }

    // Highlight the current card
    const currentCard = document.querySelector(`.cardContainer .card:nth-child(${index + 1})`);
    if (currentCard) {
        currentCard.classList.add('highlight');
    }

    // Update the currentSongIndex
    currentSongIndex = index;
}


// listen for timeupdate event
currentSong.addEventListener("timeupdate", () => {
    // ... (your existing code)

    // Update the playlist highlight based on the current time
    highlightPlaylistBasedOnTime();
});

function highlightPlaylistBasedOnTime() {
    if (currentSongIndex !== -1) {
        const currentTime = currentSong.currentTime;
        const duration = currentSong.duration;

        // Calculate the percentage of song completion
        const percentage = (currentTime / duration) * 100;

        // Highlight the playlist item based on the current time
        const playlistItem = document.querySelector(`.songList ul li:nth-child(${currentSongIndex + 1})`);
        if (playlistItem) {
            if (percentage >= 100) {
                // If the song is completed, remove the highlight
                playlistItem.classList.remove('highlight');
            } else {
                // Add or update the highlight based on the current time
                playlistItem.classList.add('highlight');
            }
        }
    }
}




async function main() {
    // get the list of all the song 
    await getSongs("songs/abdul-hannan");
    playMusic(songs[0], true)  //song ko by default play bar main lany k liye


    // removing songUl and moved to getSongs 

    // display all the albums on the page 
    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "./img/pause.svg"

        } else {
            currentSong.pause()
            play.src = "./img/play.svg"
        }
    })

    // listen for timeupdate event 
    currentSong.addEventListener("timeupdate", () => {
        const currentTime = currentSong.currentTime;
        const duration = currentSong.duration;
        const percentage = (currentTime / duration) * 100;

        // Update the position of the seekbar circle
        document.querySelector(".circle").style.left = `${percentage}%`;

        // Update the background color of the seekbar line
        document.querySelector(".seekBar").style.background = `linear-gradient(to right, palevioletred ${percentage}%, white ${percentage}%)`;

        // Update the time display
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSecond(currentTime)} / ${secondsToMinutesSecond(duration)}`;
    });

    document.querySelector(".seekBar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })


    // add event on hamburger 
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    // add event on close button 
    document.querySelector(".logo").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-105%";
    });

    // add an event on volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })
    // Add event listener to mute the track 
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume")) {
            e.target.src = e.target.src.replace("volume", "mute")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("mute", "volume")
            currentSong.volume = .10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })


}

main()

