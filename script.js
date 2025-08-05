const songs = [
    { title: "Bachna Ae Haseeno", src: "songs/Bachna Ae Haseeno.mp3", cover: "covers/bachna.jpg", isFavorite: false },
    { title: "Badtameez Dil", src: "songs/Badtameez Dil.mp3", cover: "covers/badtameez.jpg", isFavorite: false },
    { title: "Tu Hai Ki Nahi", src: "songs/Tu Hai Ki Nahi.mp3", cover: "covers/tuhai.jpg", isFavorite: false },
    { title: "Tera Hone Laga Hoon", src: "songs/Tera Hone Laga Hoon.mp3", cover: "covers/tera.jpg", isFavorite: false },
    { title: "Channa Mereya", src: "songs/Channa Mereya.mp3", cover: "covers/channa.jpg", isFavorite: false },
    { title: "Agar Tum Saath Ho", src: "songs/Agar Tum Saath Ho.mp3", cover: "covers/agar.jpg", isFavorite: false },
    { title: "Kabira", src: "songs/Kabira.mp3", cover: "covers/kabira.jpg", isFavorite: false },
    { title: "Tum Ho", src: "songs/Tum Ho.mp3", cover: "covers/tumho.jpg", isFavorite: false },
    { title: "Galti Se Mistake", src: "songs/Galti Se Mistake.mp3", cover: "covers/galti.jpg", isFavorite: false }
];

let currentSong = 0;
const audioPlayer = document.getElementById("audio-player");
const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const songTitle = document.getElementById("song-title");
const cover = document.getElementById("cover");
const progressContainer = document.getElementById("progress-bar");
const progress = document.getElementById("progress");
const progressThumb = document.getElementById("progress-thumb");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const volumeBtn = document.getElementById("volume");
const volumeControl = document.getElementById("volume-control");
const playlistContainer = document.getElementById("playlist");
const favoritesListContainer = document.getElementById("favorites-list");
const favoriteMainBtn = document.getElementById("favorite-main");

// Load Favorites from localStorage
function loadFavorites() {
    try {
        const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];

        // Reset all songs to not favorite first
        songs.forEach(song => song.isFavorite = false);

        // Then mark saved ones as favorites
        savedFavorites.forEach(index => {
            if (index >= 0 && index < songs.length) {
                songs[index].isFavorite = true;
            }
        });
    } catch (e) {
        console.error("Error loading favorites:", e);
        localStorage.removeItem("favorites"); // Reset if corrupted
    }
}

// Save Favorites to localStorage
function saveFavorites() {
    const favoriteIndexes = songs
        .map((song, index) => song.isFavorite ? index : null)
        .filter(index => index !== null);
    localStorage.setItem("favorites", JSON.stringify(favoriteIndexes));
}

// Toggle Favorite
function toggleFavorite(index) {
    songs[index].isFavorite = !songs[index].isFavorite;
    saveFavorites();
    updatePlaylist();
    updateFavoritesList();
    updateMainFavoriteButton();
}

// Update Main Favorite Button
function updateMainFavoriteButton() {
    const icon = favoriteMainBtn.querySelector('i');

    if (songs[currentSong].isFavorite) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        favoriteMainBtn.classList.add('favorite');
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        favoriteMainBtn.classList.remove('favorite');
    }
}

// Initialize Playlist
function updatePlaylist() {
    playlistContainer.innerHTML = '';
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.classList.add('playlist-item');
        if (index === currentSong) li.classList.add('active');

        li.innerHTML = `
            <span class="playlist-title">${song.title}</span>
            <button class="favorite-btn ${song.isFavorite ? 'favorite' : ''}">
                <i class="${song.isFavorite ? 'fas' : 'far'} fa-heart"></i>
            </button>
        `;

        li.addEventListener('click', () => {
            currentSong = index;
            loadSong(currentSong);
            audioPlayer.play();
            updatePlayButtonIcon();
        });

        const favoriteBtn = li.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(index);
        });

        playlistContainer.appendChild(li);
    });
}

// Update Favorites List
function updateFavoritesList() {
    favoritesListContainer.innerHTML = '';
    const favorites = songs.filter(song => song.isFavorite);

    if (favorites.length === 0) {
        const emptyMsg = document.createElement('li');
        emptyMsg.textContent = "No favorites yet";
        emptyMsg.style.textAlign = "center";
        emptyMsg.style.opacity = "0.7";
        emptyMsg.style.padding = "10px";
        favoritesListContainer.appendChild(emptyMsg);
        return;
    }

    favorites.forEach(song => {
        const index = songs.findIndex(s => s.title === song.title);
        const li = document.createElement('li');
        li.classList.add('favorite-item');
        if (index === currentSong) li.classList.add('active');

        li.innerHTML = `
            <span class="playlist-title">${song.title}</span>
            <button class="favorite-btn favorite">
                <i class="fas fa-heart"></i>
            </button>
        `;

        li.addEventListener('click', () => {
            currentSong = index;
            loadSong(currentSong);
            audioPlayer.play();
            updatePlayButtonIcon();
        });

        const favoriteBtn = li.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(index);
        });

        favoritesListContainer.appendChild(li);
    });
}

function loadSong(index) {
    songTitle.textContent = songs[index].title;
    audioPlayer.src = songs[index].src;
    cover.src = songs[index].cover;

    // Update active song in playlist and favorites
    document.querySelectorAll('.playlist-item').forEach((item, idx) => {
        item.classList.toggle('active', idx === index);
    });

    document.querySelectorAll('.favorite-item').forEach((item) => {
        const title = item.querySelector('.playlist-title').textContent;
        item.classList.toggle('active', title === songs[index].title);
    });

    // Update main favorite button
    updateMainFavoriteButton();

    // Update background theme based on cover art
    updateThemeColor(songs[index].cover);
}

// Time formatting
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Update play button icon
function updatePlayButtonIcon() {
    const icon = playBtn.querySelector('i');
    if (audioPlayer.paused) {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    } else {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    }
}

// Update progress bar
function updateProgress() {
    const { currentTime, duration } = audioPlayer;
    if (isNaN(duration)) return;

    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    progressThumb.style.left = `calc(${progressPercent}% - 6px)`;

    // Update time display
    currentTimeEl.textContent = formatTime(currentTime);
    durationEl.textContent = formatTime(duration || 0);
}

// Set progress when clicked
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (clickX / width) * duration;
}

// Update theme color based on cover art
function updateThemeColor(coverSrc) {
    // For a real implementation, you would use an algorithm to extract dominant colors
    // from the image. For this demo, we'll use a simple mapping
    const colorMap = {
        'covers/bachna.jpg': '#d35400',
        'covers/badtameez.jpg': '#8e44ad',
        'covers/tuhai.jpg': '#2c3e50',
        'covers/tera.jpg': '#16a085',
        'covers/channa.jpg': '#c0392b',
        'covers/agar.jpg': '#2980b9',
        'covers/kabira.jpg': '#27ae60',
        'covers/tumho.jpg': '#f39c12',
        'covers/galti.jpg': '#e74c3c',
    };

    const color = colorMap[coverSrc] || '#681f02';
    document.body.style.background = color;
    document.body.style.transition = 'background 1s ease';
}

// Event Listeners
playBtn.addEventListener("click", () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
    updatePlayButtonIcon();
});

nextBtn.addEventListener("click", () => {
    currentSong = (currentSong + 1) % songs.length;
    loadSong(currentSong);
    audioPlayer.play();
    updatePlayButtonIcon();
});

prevBtn.addEventListener("click", () => {
    currentSong = (currentSong - 1 + songs.length) % songs.length;
    loadSong(currentSong);
    audioPlayer.play();
    updatePlayButtonIcon();
});

// Main favorite button event listener
favoriteMainBtn.addEventListener("click", () => {
    toggleFavorite(currentSong);
});

// Duration and time update
audioPlayer.addEventListener("timeupdate", updateProgress);
audioPlayer.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audioPlayer.duration);
});

// Click on progress bar
progressContainer.addEventListener("click", setProgress);

// Volume control
volumeControl.addEventListener("input", () => {
    audioPlayer.volume = volumeControl.value;
    updateVolumeIcon();
});

// Update volume icon
function updateVolumeIcon() {
    const icon = volumeBtn.querySelector('i');
    icon.classList.remove('fa-volume-up', 'fa-volume-down', 'fa-volume-off');

    if (audioPlayer.volume > 0.7) {
        icon.classList.add('fa-volume-up');
    } else if (audioPlayer.volume > 0) {
        icon.classList.add('fa-volume-down');
    } else {
        icon.classList.add('fa-volume-off');
    }
}

volumeBtn.addEventListener("click", () => {
    if (audioPlayer.volume > 0) {
        audioPlayer.volume = 0;
    } else {
        audioPlayer.volume = 1;
    }
    volumeControl.value = audioPlayer.volume;
    updateVolumeIcon();
});

// When song ends, play next song
audioPlayer.addEventListener("ended", () => {
    currentSong = (currentSong + 1) % songs.length;
    loadSong(currentSong);
    audioPlayer.play();
});

// Initialize
loadFavorites();
updatePlaylist();
updateFavoritesList();
loadSong(currentSong);
updatePlayButtonIcon();
updateVolumeIcon();