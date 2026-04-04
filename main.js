document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
    Player.init();
    Shows.init();
    Forms.init();
});

const Navigation = {
    init() {
        this.header = document.querySelector('.main-header');
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section[id]');
        this.bindEvents();
        this.initScrollSpy();
    },
    bindEvents() {
        this.navToggle?.addEventListener('click', () => this.toggleMenu());
        this.navLinks.forEach(link => { link.addEventListener('click', () => this.closeMenu()); });
        document.addEventListener('click', (e) => { if (!e.target.closest('.main-nav') && this.navMenu?.classList.contains('open')) { this.closeMenu(); } });
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    },
    toggleMenu() { const isOpen = this.navMenu.classList.toggle('open'); this.navToggle.setAttribute('aria-expanded', isOpen); },
    closeMenu() { this.navMenu?.classList.remove('open'); this.navToggle?.setAttribute('aria-expanded', 'false'); },
    handleScroll() { const scrolled = window.scrollY > 50; this.header?.classList.toggle('scrolled', scrolled); },
    initScrollSpy() {
        const observerOptions = { root: null, rootMargin: '-20% 0px -70% 0px', threshold: 0 };
        const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { const id = entry.target.getAttribute('id'); this.setActiveLink(id); } }); }, observerOptions);
        this.sections.forEach(section => observer.observe(section));
    },
    setActiveLink(sectionId) { this.navLinks.forEach(link => { const href = link.getAttribute('href').slice(1); link.classList.toggle('active', href === sectionId); }); }
};

const Player = {
    collectionId: 'ChumATributeToPhish',
    shows: [
        { id: 'Chum2025-04-05', date: '2025-04-05', venue: 'Ivy Room', location: 'Albany, CA' },
        { id: 'Chum2025-04-04', date: '2025-04-04', venue: 'Woodhouse Brewery', location: 'Santa Cruz, CA' },
        { id: 'Chum2025-02-01', date: '2025-02-01', venue: 'Crazy Horse', location: 'Nevada City, CA' },
        { id: 'Chum2024-03-15', date: '2024-03-15', venue: 'Ivy Room', location: 'Albany, CA' },
        { id: 'Chum2024-07-20', date: '2024-07-20', venue: "Mink's", location: 'San Rafael, CA' },
    ],
    currentShow: null, tracks: [], currentTrackIndex: 0, isPlaying: false, elements: {},
    init() { this.cacheElements(); this.renderShowPicker(); this.bindEvents(); },
    cacheElements() {
        this.elements = {
            showPicker: document.getElementById('show-picker'),
            audio: document.getElementById('audio-player'),
            playBtn: document.getElementById('play-btn'),
            playIcon: document.getElementById('play-icon'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            progressBar: document.getElementById('progress-bar'),
            progressFill: document.getElementById('progress-fill'),
            progressHandle: document.getElementById('progress-handle'),
            timeCurrent: document.getElementById('time-current'),
            timeDuration: document.getElementById('time-duration'),
            trackTitle: document.getElementById('current-track-title'),
            showName: document.getElementById('current-show-name'),
            trackList: document.getElementById('track-list'),
            nowPlayingArt: document.querySelector('.now-playing-art'),
            volumeBtn: document.getElementById('volume-btn'),
            volumeIcon: document.getElementById('volume-icon'),
            volumeSlider: document.getElementById('volume-slider')
        };
    },
    renderShowPicker() {
        const { showPicker } = this.elements;
        if (!showPicker) return;
        showPicker.innerHTML = this.shows.map((show, index) => `<button class="show-picker-btn ${index === 0 ? 'active' : ''}" data-show-id="${show.id}"><span class="show-date">${this.formatDate(show.date)}</span><span class="show-venue">${show.venue}</span></button>`).join('');
        showPicker.querySelectorAll('.show-picker-btn').forEach(btn => { btn.addEventListener('click', () => { const showId = btn.dataset.showId; this.loadShow(showId); showPicker.querySelectorAll('.show-picker-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); }); });
    },
    bindEvents() {
        const { audio, playBtn, prevBtn, nextBtn, progressBar, volumeBtn, volumeSlider } = this.elements;
        playBtn?.addEventListener('click', () => this.togglePlay());
        prevBtn?.addEventListener('click', () => this.prevTrack());
        nextBtn?.addEventListener('click', () => this.nextTrack());
        audio?.addEventListener('timeupdate', () => this.updateProgress());
        audio?.addEventListener('loadedmetadata', () => this.updateDuration());
        audio?.addEventListener('ended', () => this.onTrackEnd());
        audio?.addEventListener('play', () => this.onPlay());
        audio?.addEventListener('pause', () => this.onPause());
        progressBar?.addEventListener('click', (e) => this.seek(e));
        volumeBtn?.addEventListener('click', () => this.toggleMute());
        volumeSlider?.addEventListener('input', (e) => this.setVolume(e.target.value));
        if (audio && volumeSlider) { audio.volume = volumeSlider.value / 100; }
    },
    async loadShow(showId) {
        this.currentShow = this.shows.find(s => s.id === showId);
        if (!this.currentShow) return;
        this.elements.showName.textContent = `${this.currentShow.venue} - ${this.formatDate(this.currentShow.date)}`;
        try {
            const response = await fetch(`https://archive.org/metadata/${showId}`);
            const data = await response.json();
            if (data.files) {
                this.tracks = data.files
                    .filter(file => file.format === 'VBR MP3' || file.name?.endsWith('.mp3'))
                    .filter(file => !file.name?.includes('_files.xml'))
                    .sort((a, b) => { const trackA = parseInt(a.track) || parseInt(a.name?.match(/^(\d+)/)?.[1]) || 999; const trackB = parseInt(b.track) || parseInt(b.name?.match(/^(\d+)/)?.[1]) || 999; return trackA - trackB; })
                    .map((file, index) => ({ id: index, name: file.name, title: file.title || this.cleanTrackName(file.name), url: `https://archive.org/download/${showId}/${encodeURIComponent(file.name)}`, duration: file.length }));
                this.renderTrackList();
                this.currentTrackIndex = 0;
                this.pause();
                this.elements.trackTitle.textContent = 'Select a track to play';
            }
        } catch (error) { console.error('Error loading show:', error); this.elements.trackList.innerHTML = `<div class="track-list-empty"><i class="fas fa-exclamation-triangle"></i><span>Error loading tracks</span></div>`; }
    },
    cleanTrackName(filename) { return filename.replace(/\.mp3$/i, '').replace(/^\d+[-_\s]*/, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim(); },
    renderTrackList() {
        const { trackList } = this.elements;
        if (!trackList || !this.tracks.length) return;
        trackList.innerHTML = this.tracks.map((track, index) => `<div class="track-item ${index === this.currentTrackIndex ? 'active' : ''}" data-index="${index}"><span class="track-num">${String(index + 1).padStart(2, '0')}</span><span class="track-name">${track.title}</span></div>`).join('');
        trackList.querySelectorAll('.track-item').forEach(item => { item.addEventListener('click', () => { const index = parseInt(item.dataset.index); this.playTrack(index); }); });
    },
    playTrack(index) {
        if (index < 0 || index >= this.tracks.length) return;
        this.currentTrackIndex = index;
        const track = this.tracks[index];
        this.elements.audio.src = track.url;
        this.elements.audio.play().catch(e => console.log('Playback prevented:', e));
        this.elements.trackTitle.textContent = track.title;
        this.updateActiveTrack();
    },
    updateActiveTrack() { const { trackList } = this.elements; trackList?.querySelectorAll('.track-item').forEach((item, index) => { item.classList.toggle('active', index === this.currentTrackIndex); }); const activeTrack = trackList?.querySelector('.track-item.active'); activeTrack?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); },
    togglePlay() { if (this.isPlaying) { this.pause(); } else { this.play(); } },
    play() { const { audio } = this.elements; if (!audio.src && this.tracks.length) { this.playTrack(0); } else { audio.play().catch(e => console.log('Playback prevented:', e)); } },
    pause() { this.elements.audio?.pause(); },
    onPlay() { this.isPlaying = true; this.elements.playIcon.className = 'fas fa-pause'; this.elements.nowPlayingArt?.classList.add('playing'); },
    onPause() { this.isPlaying = false; this.elements.playIcon.className = 'fas fa-play'; this.elements.nowPlayingArt?.classList.remove('playing'); },
    prevTrack() { const newIndex = this.currentTrackIndex - 1; if (newIndex >= 0) { this.playTrack(newIndex); } },
    nextTrack() { const newIndex = this.currentTrackIndex + 1; if (newIndex < this.tracks.length) { this.playTrack(newIndex); } },
    onTrackEnd() { if (this.currentTrackIndex < this.tracks.length - 1) { this.nextTrack(); } else { this.onPause(); } },
    updateProgress() { const { audio, progressFill, progressHandle, timeCurrent } = this.elements; if (!audio.duration) return; const percent = (audio.currentTime / audio.duration) * 100; progressFill.style.width = `${percent}%`; progressHandle.style.left = `${percent}%`; timeCurrent.textContent = this.formatTime(audio.currentTime); },
    updateDuration() { const { audio, timeDuration } = this.elements; timeDuration.textContent = this.formatTime(audio.duration); },
    seek(e) { const { audio, progressBar } = this.elements; if (!audio.duration) return; const rect = progressBar.getBoundingClientRect(); const percent = (e.clientX - rect.left) / rect.width; audio.currentTime = percent * audio.duration; },
    toggleMute() { const { audio, volumeIcon, volumeSlider } = this.elements; audio.muted = !audio.muted; volumeIcon.className = audio.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up'; volumeSlider.value = audio.muted ? 0 : audio.volume * 100; },
    setVolume(value) { const { audio, volumeIcon } = this.elements; audio.volume = value / 100; audio.muted = false; volumeIcon.className = value == 0 ? 'fas fa-volume-mute' : 'fas fa-volume-up'; },
    formatTime(seconds) { if (isNaN(seconds)) return '0:00'; const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${mins}:${secs.toString().padStart(2, '0')}`; },
    formatDate(dateStr) { const date = new Date(dateStr + 'T00:00:00'); return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
};

const Shows = {
    // Google Sheets configuration
    // To set up:
    // 1. Create a Google Sheet with columns: date, venue, location, archiveId, ticketLink
    // 2. Go to File > Share > Publish to web > Select "CSV" format
    // 3. Copy the URL and paste it below
    sheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRDg2BLQStfvp9iaR0Mypw1MmX6xCeURVemGfLwi1FIywrNnsTA_0-XXdof8TB6SIFCf0On5TZbEmfr/pub?gid=316725428&single=true&output=csv',

    // Fallback data (used if Google Sheet fails to load)
    fallbackShows: [
        { date: '2026-06-26', venue: 'Oakland Ballers Phish Night', location: 'Oakland, CA' },
        { date: '2026-06-20', venue: 'Cornerstone Berkeley', location: 'Berkeley, CA' },
        { date: '2026-06-19', venue: 'Felton Music Hall', location: 'Felton, CA' },
        { date: '2026-05-16', venue: 'Hopmonk Sebastopol', location: 'Sebastopol, CA', ticketLink: 'https://www.eventim.us/wafform.aspx?_act=eventtickets&_pky=687207' },
        { date: '2026-04-18', venue: 'Shakedown Tuscany', location: 'Phish After Party' },
        { date: '2026-03-07', venue: 'The Crepe Place', location: 'Santa Cruz, CA' },
        { date: '2025-04-05', venue: 'Ivy Room', location: 'Albany, CA', archiveId: 'Chum2025-04-05' },
        { date: '2025-04-04', venue: 'Woodhouse Brewery', location: 'Santa Cruz, CA', archiveId: 'Chum2025-04-04' },
        { date: '2025-02-01', venue: 'Crazy Horse', location: 'Nevada City, CA', archiveId: 'Chum2025-02-01' },
        { date: '2024-12-06', venue: 'The Ivy Room', location: 'Albany, CA' },
        { date: '2024-11-08', venue: 'Private Party', location: '' },
        { date: '2024-10-18', venue: 'Hopmonk Sebastopol', location: 'Sebastopol, CA' },
        { date: '2024-07-20', venue: "Mink's", location: 'San Rafael, CA', archiveId: 'Chum2024-07-20' },
        { date: '2024-03-15', venue: 'Ivy Room', location: 'Albany, CA', archiveId: 'Chum2024-03-15' },
    ],

    allShows: [],

    async init() {
        await this.loadShows();
        this.render();
    },

    async loadShows() {
        // If no Google Sheet URL configured, use fallback data
        if (!this.sheetUrl) {
            console.log('No Google Sheet URL configured, using fallback show data');
            this.allShows = this.fallbackShows;
            return;
        }

        try {
            // Add cache-busting parameter to force fresh data
            const cacheBuster = `&_=${Date.now()}`;
            const response = await fetch(this.sheetUrl + cacheBuster);
            const csvText = await response.text();
            this.allShows = this.parseCSV(csvText);
            console.log(`Loaded ${this.allShows.length} shows from Google Sheet`);
        } catch (error) {
            console.error('Error loading shows from Google Sheet:', error);
            this.allShows = this.fallbackShows;
        }
    },

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        return lines.slice(1).map(line => {
            // Handle commas within quoted fields
            const values = [];
            let current = '';
            let inQuotes = false;

            for (const char of line) {
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());

            const show = {};
            headers.forEach((header, index) => {
                const value = values[index] || '';
                // Map common column names
                if (header === 'date') show.date = value;
                else if (header === 'venue') show.venue = value;
                else if (header === 'location' || header === 'city') show.location = value;
                else if (header === 'archiveid' || header === 'archive_id') show.archiveId = value;
                else if (header === 'ticketlink' || header === 'ticket_link' || header === 'tickets') show.ticketLink = value;
            });

            return show;
        }).filter(show => show.date && show.venue); // Only include rows with required fields
    },

    render() {
        const now = new Date(); now.setHours(0, 0, 0, 0);
        const upcoming = this.allShows.filter(show => new Date(show.date + 'T00:00:00') >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
        const past = this.allShows.filter(show => new Date(show.date + 'T00:00:00') < now).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
        const upcomingGrid = document.getElementById('upcoming-shows-grid');
        if (upcomingGrid) { if (upcoming.length === 0) { upcomingGrid.innerHTML = `<div class="shows-empty"><p>No upcoming shows scheduled at the moment.</p><p>Join the mailing list below to be notified when new shows are announced!</p></div>`; } else { upcomingGrid.innerHTML = upcoming.map(show => this.renderShowCard(show)).join(''); } }
        const pastGrid = document.getElementById('past-shows-grid');
        if (pastGrid) { pastGrid.innerHTML = past.map(show => this.renderShowCard(show, true)).join(''); }
    },
    renderShowCard(show, isPast = false) {
        const dateObj = new Date(show.date + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        const archiveLink = show.archiveId ? `<a href="https://archive.org/details/${show.archiveId}" target="_blank" rel="noopener" class="show-card-link"><i class="fas fa-headphones"></i> Listen on Archive.org</a>` : '';
        const ticketLink = show.ticketLink ? `<a href="${show.ticketLink}" target="_blank" rel="noopener" class="show-card-link show-card-tickets"><i class="fas fa-ticket-alt"></i> Get Tickets</a>` : '';
        return `<div class="show-card"><div class="show-card-date">${formattedDate}</div><div class="show-card-venue">${show.venue}</div>${show.location ? `<div class="show-card-location">${show.location}</div>` : ''}${isPast ? archiveLink : ticketLink}</div>`;
    }
};

const Forms = {
    mailingListUrl: 'https://formspree.io/f/manrbapn',

    init() { this.initMailingForm(); this.initContactForm(); },

    initMailingForm() {
        const form = document.getElementById('mailing-form');
        const message = document.getElementById('mailing-message');
        const url = this.mailingListUrl;

        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
            btn.disabled = true;

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                if (!response.ok) throw new Error('Submission failed');

                message.textContent = `Thanks! ${email} has been added to our mailing list.`;
                message.className = 'mailing-message success';
                form.reset();
            } catch (error) {
                message.textContent = 'Something went wrong. Please try again.';
                message.className = 'mailing-message error';
            }

            btn.innerHTML = originalText;
            btn.disabled = false;
            setTimeout(() => { message.textContent = ''; message.className = 'mailing-message'; }, 5000);
        });
    },
    initContactForm() {
        const form = document.getElementById('contact-form');
        form?.addEventListener('submit', (e) => { e.preventDefault(); const formData = new FormData(form); const data = { name: formData.get('name'), email: formData.get('email'), message: formData.get('message') }; const subject = `Message from ${data.name} via Chum Website`; const body = `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`; const mailtoLink = `mailto:chumphishtribute@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; window.location.href = mailtoLink; const btn = form.querySelector('button[type="submit"]'); const originalText = btn.innerHTML; btn.innerHTML = '<i class="fas fa-check"></i> Opening Email...'; setTimeout(() => { btn.innerHTML = originalText; form.reset(); }, 2000); });
    }
};
