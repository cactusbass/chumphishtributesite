// Player functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing player...');
    
    // DOM Elements
    const audioPlayer = document.getElementById('audio-player');
    const playPauseButton = document.getElementById('play-pause');
    const prevTrackButton = document.getElementById('prev-track');
    const nextTrackButton = document.getElementById('next-track');
    const volumeSlider = document.getElementById('volume-slider');
    const progressBar = document.querySelector('.progress-bar');
    const progress = document.querySelector('.progress');
    const currentTimeSpan = document.getElementById('current-time');
    const durationSpan = document.getElementById('duration');
    const currentTrackTitle = document.getElementById('current-track-title');
    const trackList = document.getElementById('track-list');
    const showButtons = document.querySelectorAll('.show-button');

    // Check if all elements are found
    console.log('Audio player element:', audioPlayer);
    console.log('Play/pause button:', playPauseButton);
    console.log('Track list:', trackList);

    // Player State
    let currentShow = 'Chum2024-07-20'; // Default to Mink's show
    let currentTrackIndex = 0;
    let tracks = [];
    let isPlaying = false;

    // Hardcoded track data for all shows
    const showTracks = {
        'Chum2024-07-20': [   // Mink's show
            { id: 1, title: "Tuning", file: "1-01 Tuning.mp3" },
            { id: 2, title: "Blaze On", file: "1-02 Blaze On _.mp3" },
            { id: 3, title: "Rift", file: "1-03 Rift.mp3" },
            { id: 4, title: "Thanks and Shirts Banter", file: "1-04 Thanks and Shirts Banter.mp3" },
            { id: 5, title: "Plasma", file: "1-05 Plasma.mp3" },
            { id: 6, title: "Poor Heart", file: "1-06 Poor Heart.mp3" },
            { id: 7, title: "Channel 11 Isn't Patched", file: "1-07 Channel 11 Isn_t Patched.mp3" },
            { id: 8, title: "Poor Heart Take 2", file: "1-08 Poor Heart Take 2.mp3" },
            { id: 9, title: "Crosseyed & Painless", file: "1-09 Crosseyed & Painless _.mp3" },
            { id: 10, title: "Limb By Limb", file: "1-10 Limb By Limb.mp3" },
            { id: 11, title: "Kevin self-intro", file: "1-11 Kevin self-intro.mp3" },
            { id: 12, title: "Golden Age", file: "1-12 Golden Age -_.mp3" },
            { id: 13, title: "Say it to me S.A.N.T.O.S.", file: "1-13 Say it to me S.A.N.T.O.S..mp3" },
            { id: 14, title: "Walls of the Cave", file: "1-14 Walls of the Cave _.mp3" },
            { id: 15, title: "Golgi Apparatus", file: "1-15 Golgi Apparatus.mp3" },
            { id: 16, title: "Set 2 Announcements", file: "2-01 Set 2 Announcements.mp3" },
            { id: 17, title: "Don't Doubt Me", file: "2-02 Don_t Doubt Me -_.mp3" },
            { id: 18, title: "Undermind", file: "2-03 Undermind -_.mp3" },
            { id: 19, title: "Don't Doubt Me", file: "2-04 Don_t Doubt Me _.mp3" },
            { id: 20, title: "Life Saving Gun", file: "2-05 Life Saving Gun -_.mp3" },
            { id: 21, title: "Kevin's Shoelace", file: "2-06 Kevin_s Shoelace.mp3" },
            { id: 22, title: "Axilla Part 2", file: "2-07 Axilla Part 2 -_.mp3" },
            { id: 23, title: "Backwards Down the Number Line", file: "2-08 Backwards Down the Number Line.mp3" },
            { id: 24, title: "Mercury", file: "2-09 Mercury.mp3" },
            { id: 25, title: "2001", file: "2-10 2001 -_.mp3" },
            { id: 26, title: "Harry Hood", file: "2-11 Harry Hood.mp3" },
            { id: 27, title: "Rich, shirts, LLS QR code, and cowbell banter", file: "2-12 Rich, shirts, LLS QR code, and cowbell banter.mp3" },
            { id: 28, title: "We're an American Band", file: "2-13 We_re an American Band.mp3" },
            { id: 29, title: "Poor Heart (a capella)", file: "2-14 Poor Heart (a capella).mp3" },
            { id: 30, title: "Ride Captain Ride", file: "2-15 Ride Captain Ride.mp3" }
        ],
        'Chum2025-04-04': [   // Santa Cruz show
            { id: 1, title: "Tuning", file: "01 Tuning.mp3" },
            { id: 2, title: "Mozambique", file: "02 Mozambique.mp3" },
            { id: 3, title: "Dogs Stole Things", file: "03 Dogs Stole Things.mp3" },
            { id: 4, title: "Tube", file: "04 Tube.mp3" },
            { id: 5, title: "Paul and Silas", file: "05 Paul and Silas.mp3" },
            { id: 6, title: "Mike's Song", file: "06 Mike_s Song _.mp3" },
            { id: 7, title: "Frankie Says", file: "07 Frankie Says _.mp3" },
            { id: 8, title: "Esther", file: "08 Esther _.mp3" },
            { id: 9, title: "Punch You in the Eye", file: "09 Punch You in the Eye.mp3" },
            { id: 10, title: "Weekapaug Groove", file: "10 Weekapaug Groove.mp3" },
            { id: 11, title: "Tuning", file: "11 Tuning.mp3" },
            { id: 12, title: "The Curtain With", file: "12 The Curtain With.mp3" },
            { id: 13, title: "Rock and Roll", file: "13 Rock and Roll -_.mp3" },
            { id: 14, title: "Golden Age", file: "14 Golden Age -_.mp3" },
            { id: 15, title: "Cities", file: "15 Cities -_.mp3" },
            { id: 16, title: "My Soul", file: "16 My Soul.mp3" },
            { id: 17, title: "Santa Cruz and Andrew Myers", file: "17 Santa Cruz and Andrew Myers.mp3" },
            { id: 18, title: "Run Like an Antelope", file: "18 Run Like an Antelope.mp3" },
            { id: 19, title: "Band and Audience Photo", file: "19 Band and Audience Photo.mp3" }
        ],
        'Chum2025-04-05': [   // Berkeley show
            { id: 1, title: "Tuning", file: "01 Tuning.mp3" },
            { id: 2, title: "Gumbo", file: "02 Gumbo.mp3" },
            { id: 3, title: "The Old Home Place", file: "03 The Old Home Place.mp3" },
            { id: 4, title: "hey stranger", file: "04 hey stranger.mp3" },
            { id: 5, title: "One Yeah", file: "05 One Yeah.mp3" },
            { id: 6, title: "Colonel Forbin's Ascent", file: "06 Colonel Forbin_s Ascent _.mp3" },
            { id: 7, title: "Narratation", file: "07 Narratation.mp3" },
            { id: 8, title: "Time", file: "08 Time _.mp3" },
            { id: 9, title: "Breathe Reprise", file: "09 Breathe Reprise _.mp3" },
            { id: 10, title: "Fly Famous Mockingbird", file: "10 Fly Famous Mockingbird _.mp3" },
            { id: 11, title: "Tweezer", file: "11 Tweezer -_.mp3" },
            { id: 12, title: "Roggae", file: "12 Roggae _.mp3" },
            { id: 13, title: "No Men in No Man's Land", file: "13 No Men in No Man_s Land _.mp3" },
            { id: 14, title: "Tweezer Reprise", file: "14 Tweezer Reprise.mp3" },
            { id: 15, title: "Tuning, Car Wash, and Eric", file: "15 Tuning, Car Wash, and Eric.mp3" },
            { id: 16, title: "A Wave of Hope", file: "16 A Wave of Hope -_.mp3" },
            { id: 17, title: "Simple", file: "17 Simple -_.mp3" },
            { id: 18, title: "Meat", file: "18 Meat -_.mp3" },
            { id: 19, title: "My Left Toe", file: "19 My Left Toe _.mp3" },
            { id: 20, title: "The Connection", file: "20 The Connection.mp3" },
            { id: 21, title: "2.0 banter, Showtime, and techno-minorcalities", file: "21 2.0 banter, Showtime, and techno-minorcalities.mp3" },
            { id: 22, title: "Stash", file: "22 Stash.mp3" },
            { id: 23, title: "Ted, Dave, Pickles, Love, and Heather", file: "23 Ted, Dave, Pickles, Love, and Heather.mp3" },
            { id: 24, title: "Kill Devil Falls", file: "24 Kill Devil Falls -_.mp3" },
            { id: 25, title: "Birds of a Feather jam", file: "25 Birds of a Feather jam -_.mp3" },
            { id: 26, title: "2001", file: "26 2001 _.mp3" },
            { id: 27, title: "Suzy Greenberg", file: "27 Suzy Greenberg.mp3" },
            { id: 28, title: "Thanks and texts", file: "28 Thanks and texts.mp3" },
            { id: 29, title: "Izabella", file: "29 Izabella.mp3" }
        ]
    };

    // Initialize with default show
    function initializePlayer() {
        console.log('Initializing player with show:', currentShow);
        tracks = showTracks[currentShow] || [];
        renderTrackList();
        
        // Set the active show button
        showButtons.forEach(button => {
            if (button.dataset.show === currentShow) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // Render track list
    function renderTrackList() {
        console.log('Rendering track list...');
        trackList.innerHTML = '';
        
        if (tracks.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No tracks available for this show yet.';
            trackList.appendChild(emptyMessage);
            return;
        }
        
        tracks.forEach((track, index) => {
            const trackItem = document.createElement('div');
            trackItem.className = 'track-item';
            if (index === currentTrackIndex) {
                trackItem.classList.add('active');
            }
            
            trackItem.innerHTML = `
                <span class="track-number">${track.id}</span>
                <span class="track-title">${track.title}</span>
            `;
            
            trackItem.addEventListener('click', () => {
                currentTrackIndex = index;
                playTrack();
            });
            
            trackList.appendChild(trackItem);
        });
    }

    // Play a specific track
    function playTrack() {
        console.log('Playing track:', currentTrackIndex);
        
        if (tracks.length === 0) {
            console.error('No tracks available');
            return;
        }
        
        const track = tracks[currentTrackIndex];
        console.log('Track to play:', track);
        
        // Update audio source
        const audioPath = `audio/shows/${currentShow}/${track.file}`;
        console.log('Audio path:', audioPath);
        audioPlayer.src = audioPath;
        
        // Update UI
        currentTrackTitle.textContent = track.title;
        
        // Update active track in the list
        document.querySelectorAll('.track-item').forEach((item, index) => {
            if (index === currentTrackIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Play the track
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Audio started playing successfully');
                    isPlaying = true;
                    updatePlayPauseButton();
                })
                .catch(error => {
                    console.error('Error playing track:', error);
                    // Try to diagnose the issue
                    if (error.name === 'NotAllowedError') {
                        console.error('Playback was prevented by the browser. User interaction may be required.');
                    } else if (error.name === 'NotSupportedError') {
                        console.error('The audio format is not supported by the browser.');
                    } else {
                        console.error('Unknown error occurred:', error);
                    }
                });
        }
    }

    // Play/Pause toggle
    playPauseButton.addEventListener('click', function() {
        console.log('Play/Pause button clicked');
        if (audioPlayer.src) {
            if (isPlaying) {
                console.log('Pausing audio');
                audioPlayer.pause();
            } else {
                console.log('Resuming audio');
                audioPlayer.play()
                    .then(() => {
                        console.log('Audio resumed successfully');
                    })
                    .catch(error => console.error('Error resuming audio:', error));
            }
            isPlaying = !isPlaying;
            updatePlayPauseButton();
        } else if (tracks.length > 0) {
            console.log('No audio source, playing first track');
            playTrack();
        }
    });

    // Update play/pause button icon
    function updatePlayPauseButton() {
        const icon = playPauseButton.querySelector('i');
        if (isPlaying) {
            icon.className = 'fas fa-pause';
        } else {
            icon.className = 'fas fa-play';
        }
    }

    // Previous track
    prevTrackButton.addEventListener('click', function() {
        console.log('Previous track button clicked');
        if (tracks.length > 0) {
            currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
            playTrack();
        }
    });

    // Next track
    nextTrackButton.addEventListener('click', function() {
        console.log('Next track button clicked');
        if (tracks.length > 0) {
            currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
            playTrack();
        }
    });

    // Volume control
    volumeSlider.addEventListener('input', function() {
        audioPlayer.volume = this.value / 100;
        console.log('Volume set to:', this.value);
    });

    // Progress bar
    audioPlayer.addEventListener('timeupdate', function() {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progress.style.width = percent + '%';
        currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
    });

    // Duration update
    audioPlayer.addEventListener('loadedmetadata', function() {
        console.log('Audio metadata loaded, duration:', audioPlayer.duration);
        durationSpan.textContent = formatTime(audioPlayer.duration);
    });

    // Click on progress bar to seek
    progressBar.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = percent * audioPlayer.duration;
        console.log('Seeking to:', percent * 100, '%');
    });

    // Track ended
    audioPlayer.addEventListener('ended', function() {
        console.log('Track ended');
        isPlaying = false;
        updatePlayPauseButton();
        
        // Auto-play next track
        if (tracks.length > 0) {
            currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
            playTrack();
        }
    });

    // Format time as MM:SS
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Show selection
    showButtons.forEach(button => {
        button.addEventListener('click', function() {
            const showId = this.dataset.show;
            console.log('Show selected:', showId);
            
            // Update active button
            showButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update current show and tracks
            currentShow = showId;
            currentTrackIndex = 0;
            tracks = showTracks[showId] || [];
            
            // Update UI
            renderTrackList();
            currentTrackTitle.textContent = "Select a track";
            
            // Reset audio player
            audioPlayer.pause();
            isPlaying = false;
            updatePlayPauseButton();
            progress.style.width = '0%';
            currentTimeSpan.textContent = '0:00';
            durationSpan.textContent = '0:00';
        });
    });

    // Initialize player
    initializePlayer();
    
    // Log that initialization is complete
    console.log('Player initialization complete');
}); 