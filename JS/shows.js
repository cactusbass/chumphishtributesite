// Archive.org player functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const showButtons = document.querySelectorAll('.show-btn');
    const trackListContainer = document.getElementById('track-list-container');
    const currentTrackDisplay = document.getElementById('current-track');
    const playerIframe = document.getElementById('archive-player');
    const albumArt = document.getElementById('album-art');

    // Function to fetch track listing and metadata from Archive.org
    async function fetchShowData(showId) {
        try {
            console.log('Fetching show data for:', showId);
            const response = await fetch(`https://archive.org/metadata/${showId}`);
            const data = await response.json();
            
            if (data.files) {
                // Filter for audio files and sort by track number
                const tracks = data.files
                    .filter(file => file.format === 'VBR MP3' || file.format === 'MP3')
                    .sort((a, b) => {
                        const trackA = parseInt(a.track) || 0;
                        const trackB = parseInt(b.track) || 0;
                        return trackA - trackB;
                    });

                console.log('Found tracks:', tracks);

                // Clear existing track list
                trackListContainer.innerHTML = '';

                // Add each track to the list
                tracks.forEach(track => {
                    const trackDiv = document.createElement('div');
                    trackDiv.className = 'track-item';
                    trackDiv.textContent = `${track.track || '?'}. ${track.title}`;
                    trackDiv.setAttribute('data-track', track.track || '');
                    trackDiv.style.cursor = 'pointer';
                    
                    // Add click handler for each track
                    trackDiv.addEventListener('click', function() {
                        const trackNumber = this.getAttribute('data-track');
                        const trackTitle = this.textContent.replace(`${trackNumber}. `, '');
                        updateCurrentTrack(trackNumber, trackTitle);
                        
                        // Show instruction message
                        showTrackInstruction(trackNumber, trackTitle);
                    });
                    
                    trackListContainer.appendChild(trackDiv);
                });

                // Update current track display
                if (tracks.length > 0) {
                    updateCurrentTrack('1', tracks[0].title);
                }

                // Update album art if available
                if (data.coverart) {
                    albumArt.src = `https://archive.org/download/${showId}/${data.coverart}`;
                }

                // Add manual track selector
                addManualTrackSelector(tracks);
            }
        } catch (error) {
            console.error('Error fetching show data:', error);
            trackListContainer.innerHTML = 'Error loading track list';
        }
    }

    // Function to update the current track display
    function updateCurrentTrack(trackNumber, trackTitle) {
        if (currentTrackDisplay) {
            currentTrackDisplay.textContent = `${trackNumber}. ${trackTitle}`;
        }
        
        // Highlight the current track in the list
        const trackElements = document.querySelectorAll('#track-list-container div');
        trackElements.forEach(el => {
            el.classList.remove('current-track');
            if (el.getAttribute('data-track') === trackNumber.toString()) {
                el.classList.add('current-track');
            }
        });
    }

    // Function to show track instruction message
    function showTrackInstruction(trackNumber, trackTitle) {
        const message = document.createElement('div');
        message.className = 'player-instruction';
        message.innerHTML = `
            <p>To play this track, please use the Archive.org player controls above.</p>
            <p>Track ${trackNumber}: ${trackTitle}</p>
        `;
        
        // Insert the message after the iframe
        playerIframe.parentNode.insertBefore(message, playerIframe.nextSibling);
        
        // Remove the message after 5 seconds
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    // Function to add manual track selector
    function addManualTrackSelector(tracks) {
        // Remove existing selector if it exists
        const existingSelector = document.querySelector('.manual-track-selector');
        if (existingSelector) {
            existingSelector.remove();
        }

        // Create new selector
        const trackSelector = document.createElement('div');
        trackSelector.className = 'manual-track-selector';
        trackSelector.innerHTML = `
            <h4>Manual Track Selection</h4>
            <p>If the automatic track detection isn't working, you can manually select the current track:</p>
            <select id="manual-track-select">
                <option value="">Select a track...</option>
            </select>
        `;
        
        // Add the selector to the page
        const trackInfo = document.querySelector('.track-info');
        if (trackInfo) {
            trackInfo.appendChild(trackSelector);
            
            // Populate the select element with tracks
            const select = document.getElementById('manual-track-select');
            tracks.forEach(track => {
                const option = document.createElement('option');
                option.value = track.track || '';
                option.textContent = `${track.track || '?'}. ${track.title}`;
                select.appendChild(option);
            });
            
            // Add event listener to the select
            select.addEventListener('change', function() {
                if (this.value) {
                    const selectedOption = this.options[this.selectedIndex];
                    const trackNumber = this.value;
                    const trackTitle = selectedOption.textContent.replace(`${trackNumber}. `, '');
                    updateCurrentTrack(trackNumber, trackTitle);
                }
            });
        }
    }

    // Handle show button clicks
    showButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all buttons
            showButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the show ID from data attribute
            const showId = this.getAttribute('data-show');
            console.log('Switching to show:', showId);
            
            // Update iframe source
            playerIframe.src = `https://archive.org/embed/${showId}`;
            
            // Fetch show data
            fetchShowData(showId);
        });
    });

    // Load initial show data
    const initialShowId = showButtons[0].getAttribute('data-show');
    console.log('Loading initial show:', initialShowId);
    fetchShowData(initialShowId);
}); 