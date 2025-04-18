// Track updater for Archive.org player
document.addEventListener('DOMContentLoaded', function() {
    // Function to update the current track display
    function updateCurrentTrack(trackNumber, trackTitle) {
        const currentTrackDisplay = document.getElementById('current-track');
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
    
    // Function to make track list items clickable
    function makeTracksClickable() {
        const trackElements = document.querySelectorAll('#track-list-container div');
        trackElements.forEach(el => {
            el.style.cursor = 'pointer';
            el.addEventListener('click', function() {
                const trackNumber = this.getAttribute('data-track');
                const trackTitle = this.textContent.replace(`${trackNumber}. `, '');
                updateCurrentTrack(trackNumber, trackTitle);
                
                // We can't directly control the player, but we can provide instructions to the user
                const playerIframe = document.getElementById('archive-player');
                if (playerIframe) {
                    // Create a temporary message to guide the user
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
            });
        });
    }
    
    // Set up a mutation observer to detect when the track list changes
    const trackListContainer = document.getElementById('track-list-container');
    if (trackListContainer) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Track list has been updated, make the new tracks clickable
                    makeTracksClickable();
                }
            });
        });
        
        observer.observe(trackListContainer, { childList: true, subtree: true });
    }
    
    // Initial setup
    makeTracksClickable();
    
    // Add a manual track selector
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
        const trackElements = document.querySelectorAll('#track-list-container div');
        
        trackElements.forEach(el => {
            const option = document.createElement('option');
            option.value = el.getAttribute('data-track');
            option.textContent = el.textContent;
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
}); 