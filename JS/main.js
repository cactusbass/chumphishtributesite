console.log('Script loaded');

// Audio Player Elements
const audioPlayer = new Audio();
const playBtn = document.querySelector('.play-btn');
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const shuffleBtn = document.querySelector('.shuffle-btn');
const repeatBtn = document.querySelector('.repeat-btn');
const volumeBtn = document.querySelector('.volume-btn');
const volumeSlider = document.querySelector('.volume-slider');
const progressBar = document.querySelector('.progress-bar');
const progressFilled = document.querySelector('.progress-filled');
const currentTime = document.querySelector('.time-current');
const totalTime = document.querySelector('.time-total');
const nowPlayingTitle = document.querySelector('.now-playing-title');
const playlistItems = document.querySelectorAll('.playlist-item');

let currentTrack = 0;
let isPlaying = false;
let isShuffling = false;
let repeatMode = 'none'; // 'none', 'one', 'all'
let volume = 1;
let shuffledPlaylist = [];

// Show selector functionality
const showButtons = document.querySelectorAll('.show-btn');
const archivePlayer = document.getElementById('archive-player');
const trackListContainer = document.getElementById('track-list-container');

console.log('Found elements:', {
    showButtons: showButtons.length,
    archivePlayer: archivePlayer,
    trackListContainer: trackListContainer
});

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const showButtons = document.querySelectorAll('.show-btn');
    const archivePlayer = document.getElementById('archive-player');
    const trackListContainer = document.getElementById('track-list-container');

    // Function to load track listing for a show
    async function loadTrackListing(showId) {
        try {
            // Show loading state
            trackListContainer.innerHTML = 'Loading tracks...';
            
            // Fetch show metadata from Archive.org
            const response = await fetch(`https://archive.org/metadata/${showId}`);
            const data = await response.json();
            
            // Clear and prepare track list
            trackListContainer.innerHTML = '';
            
            // Add each track to the list
            data.files.forEach((file, index) => {
                if (file.format === 'VBR MP3' || file.format === 'FLAC') {
                    const trackItem = document.createElement('div');
                    trackItem.className = 'track-item';
                    trackItem.innerHTML = `
                        <span class="track-number">${(index + 1).toString().padStart(2, '0')}</span>
                        <span class="track-title">${file.title}</span>
                    `;
                    trackListContainer.appendChild(trackItem);
                }
            });
        } catch (error) {
            console.error('Error loading tracks:', error);
            trackListContainer.innerHTML = 'Error loading tracks. Please try again.';
        }
    }

    // Function to switch shows
    function switchShow(showId) {
        // Create a new iframe element
        const newIframe = document.createElement('iframe');
        newIframe.id = 'archive-player';
        newIframe.src = `https://archive.org/embed/${showId}`;
        newIframe.width = '100%';
        newIframe.height = '400';
        newIframe.frameBorder = '0';
        newIframe.setAttribute('webkitallowfullscreen', 'true');
        newIframe.setAttribute('mozallowfullscreen', 'true');
        newIframe.setAttribute('allowfullscreen', 'true');

        // Replace the old iframe with the new one
        const oldIframe = document.getElementById('archive-player');
        oldIframe.parentNode.replaceChild(newIframe, oldIframe);

        // Load the track listing
        loadTrackListing(showId);
    }

    // Add click handlers to show buttons
    showButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            showButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get show ID and switch
            const showId = button.dataset.show;
            switchShow(showId);
        });
    });

    // Load initial show
    const initialShowId = 'Chum2024-07-20';
    console.log('Loading initial show:', initialShowId);
    loadTrackListing(initialShowId);

    // Initialize audio player
    function initPlayer() {
        // Set initial volume
        audioPlayer.volume = volume;
        
        // Add click handlers to playlist items
        playlistItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                currentTrack = index;
                loadTrack(currentTrack);
                playTrack();
            });
        });
    }

    // Load track
    function loadTrack(index) {
        const track = playlistItems[index];
        const trackUrl = track.dataset.url;
        const trackTitle = track.querySelector('.track-title').textContent;
        
        // Update now playing
        nowPlayingTitle.textContent = trackTitle;
        
        // Update audio source
        audioPlayer.src = trackUrl;
        
        // Update active track styling
        playlistItems.forEach(item => item.classList.remove('playing'));
        track.classList.add('playing');
    }

    // Play/Pause
    function togglePlay() {
        if (audioPlayer.src) {
            if (isPlaying) {
                audioPlayer.pause();
            } else {
                audioPlayer.play();
            }
        } else {
            // If no track is loaded, load the first track
            loadTrack(0);
            audioPlayer.play();
        }
    }

    // Update play/pause button
    function updatePlayButton() {
        playIcon.style.display = isPlaying ? 'none' : 'block';
        pauseIcon.style.display = isPlaying ? 'block' : 'none';
    }

    // Play track
    function playTrack() {
        isPlaying = true;
        audioPlayer.play();
        updatePlayButton();
    }

    // Pause track
    function pauseTrack() {
        isPlaying = false;
        audioPlayer.pause();
        updatePlayButton();
    }

    // Previous track
    function prevTrack() {
        currentTrack = (currentTrack - 1 + playlistItems.length) % playlistItems.length;
        loadTrack(currentTrack);
        playTrack();
    }

    // Next track
    function nextTrack() {
        if (repeatMode === 'one') {
            audioPlayer.currentTime = 0;
            playTrack();
            return;
        }

        if (isShuffling) {
            currentTrack = Math.floor(Math.random() * playlistItems.length);
        } else {
            currentTrack = (currentTrack + 1) % playlistItems.length;
        }

        if (currentTrack === 0 && repeatMode !== 'all') {
            pauseTrack();
            return;
        }

        loadTrack(currentTrack);
        playTrack();
    }

    // Toggle shuffle
    function toggleShuffle() {
        isShuffling = !isShuffling;
        shuffleBtn.classList.toggle('active');
    }

    // Toggle repeat
    function toggleRepeat() {
        switch(repeatMode) {
            case 'none':
                repeatMode = 'one';
                repeatBtn.classList.add('active');
                break;
            case 'one':
                repeatMode = 'all';
                repeatBtn.classList.add('active');
                break;
            case 'all':
                repeatMode = 'none';
                repeatBtn.classList.remove('active');
                break;
        }
    }

    // Update progress bar
    function updateProgress() {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFilled.style.width = `${percent}%`;
        
        currentTime.textContent = formatTime(audioPlayer.currentTime);
        if (!isNaN(audioPlayer.duration)) {
            totalTime.textContent = formatTime(audioPlayer.duration);
        }
    }

    // Format time
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Set progress when clicking progress bar
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        audioPlayer.currentTime = (clickX / width) * duration;
    }

    // Volume control
    function handleVolumeChange(e) {
        volume = e.target.value / 100;
        audioPlayer.volume = volume;
        updateVolumeIcon();
    }

    // Toggle mute
    function toggleMute() {
        if (audioPlayer.volume > 0) {
            audioPlayer.volume = 0;
            volumeSlider.value = 0;
        } else {
            audioPlayer.volume = volume;
            volumeSlider.value = volume * 100;
        }
        updateVolumeIcon();
    }

    // Update volume icon
    function updateVolumeIcon() {
        // You can update the volume icon SVG here based on the volume level
    }

    // Event Listeners
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    volumeBtn.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', handleVolumeChange);
    progressBar.addEventListener('click', setProgress);

    // Audio player events
    audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        updatePlayButton();
    });

    audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayButton();
    });

    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', nextTrack);

    // Initialize player when page loads
    initPlayer();
});