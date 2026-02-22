/* ============================================
   FeedCast — Script (Apple-quality interactions)
   ============================================ */

// --- State ---
let isYearlyPricing = false;
let isPlaying = false;
let currentTime = 0;
let totalTime = 154; // 2:34 in seconds
let animationId = null;
let currentSegmentIndex = 0;

// Real audio
const audio = new Audio('assets/sample-episode.mp3');
audio.preload = 'metadata';

// Segments
const sampleSegments = [
    { title: 'AI & Tech News Opening', description: 'Dan & Jess kick off today\'s top stories', duration: 35 },
    { title: 'Deep Dive: Top Story', description: 'In-depth discussion on the biggest tech news', duration: 40 },
    { title: 'Quick Break', description: '"We\'ll be right back!" — Dan', duration: 20 },
    { title: 'And We\'re Back', description: 'Jess brings more stories to the table', duration: 25 },
    { title: 'Lo-fi Interlude', description: 'AI-generated background music', duration: 20 },
    { title: 'Closing Thoughts', description: 'Dan & Jess wrap up the day', duration: 14 }
];

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initScrollReveal();
    initAudioPlayer();
    initWaitlistForm();
    initWaveform();
});

// --- Navigation ---
function initNav() {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    // Scroll effect
    const onScroll = () => {
        nav.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile menu
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        links.classList.toggle('open');
    });

    // Close mobile menu on link click
    links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            toggle.classList.remove('open');
            links.classList.remove('open');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const targetId = anchor.getAttribute('href').slice(1);
            const el = document.getElementById(targetId);
            if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// --- Scroll Reveal (IntersectionObserver) ---
function initScrollReveal() {
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
}

// --- Audio Player ---
function initAudioPlayer() {
    // Real audio events
    audio.addEventListener('loadedmetadata', () => {
        totalTime = Math.floor(audio.duration);
        document.getElementById('totalTime').textContent = formatTime(totalTime);
    });

    audio.addEventListener('timeupdate', () => {
        if (audio.readyState < 2) return;
        currentTime = audio.currentTime;
        updateProgress();
        updatePlayerInfo();
    });

    audio.addEventListener('ended', () => {
        isPlaying = false;
        const btn = document.getElementById('playPauseBtn');
        btn.classList.remove('playing');
        stopWaveform();
        currentTime = 0;
        audio.currentTime = 0;
        updateProgress();
    });

    // Drag support on progress bar
    const track = document.getElementById('progressTrack');
    const thumb = document.getElementById('progressHandle');
    let dragging = false;

    const seek = e => {
        const rect = track.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audio.currentTime = pct * totalTime;
        currentTime = audio.currentTime;
        updateProgress();
        updatePlayerInfo();
    };

    track.addEventListener('click', seek);

    thumb.addEventListener('mousedown', e => {
        dragging = true;
        e.preventDefault();
    });
    document.addEventListener('mousemove', e => { if (dragging) seek(e); });
    document.addEventListener('mouseup', () => { dragging = false; });

    // Touch support
    thumb.addEventListener('touchstart', e => { dragging = true; e.preventDefault(); }, { passive: false });
    document.addEventListener('touchmove', e => {
        if (dragging && e.touches[0]) {
            const fakeEvent = { clientX: e.touches[0].clientX };
            seek(fakeEvent);
        }
    }, { passive: false });
    document.addEventListener('touchend', () => { dragging = false; });

    updateProgress();
    updatePlayerInfo();
}

function togglePlayPause() {
    const btn = document.getElementById('playPauseBtn');
    isPlaying = !isPlaying;
    btn.classList.toggle('playing', isPlaying);

    if (isPlaying) {
        audio.play();
        startWaveform();
    } else {
        audio.pause();
        stopWaveform();
    }
}

function skipBack() {
    audio.currentTime = Math.max(0, audio.currentTime - 15);
}

function skipForward() {
    audio.currentTime = Math.min(totalTime, audio.currentTime + 15);
}

function seekAudio(event) {
    const track = document.getElementById('progressTrack');
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    audio.currentTime = pct * totalTime;
}

function updateProgress() {
    const pct = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressHandle').style.left = pct + '%';
    document.getElementById('currentTime').textContent = formatTime(Math.floor(currentTime));
}

function updatePlayerInfo() {
    let acc = 0;
    let idx = 0;
    for (let i = 0; i < sampleSegments.length; i++) {
        if (currentTime < acc + sampleSegments[i].duration) { idx = i; break; }
        acc += sampleSegments[i].duration;
    }
    if (idx !== currentSegmentIndex) {
        currentSegmentIndex = idx;
        document.getElementById('current-segment').textContent = sampleSegments[idx].title;
        document.getElementById('current-description').textContent = sampleSegments[idx].description;
    }
}

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + String(sec).padStart(2, '0');
}

// --- Waveform Canvas ---
function initWaveform() {
    drawWaveform(false);
}

function drawWaveform(animated) {
    const canvas = document.getElementById('waveform');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const bars = 12;
    const gap = 2;
    const barW = (w - (bars - 1) * gap) / bars;

    const frame = () => {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < bars; i++) {
            const barH = animated
                ? (Math.sin(Date.now() * 0.006 + i * 0.5) * 0.4 + 0.6) * h
                : h * 0.25;
            const x = i * (barW + gap);
            const y = (h - barH) / 2;
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.beginPath();
            ctx.roundRect(x, y, barW, barH, 2);
            ctx.fill();
        }
        if (animated && isPlaying) {
            animationId = requestAnimationFrame(frame);
        }
    };
    frame();
}

function startWaveform() {
    if (animationId) cancelAnimationFrame(animationId);
    drawWaveform(true);
}

function stopWaveform() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    drawWaveform(false);
}

// --- Pricing Toggle ---
function togglePricing() {
    isYearlyPricing = !isYearlyPricing;
    const toggle = document.getElementById('pricingToggle');
    const monthlyEls = document.querySelectorAll('.monthly-price');
    const yearlyEls = document.querySelectorAll('.yearly-price');
    const yearlyNotes = document.querySelectorAll('.yearly-note');
    const labelM = document.getElementById('toggleMonthly');
    const labelY = document.getElementById('toggleYearly');

    toggle.classList.toggle('active', isYearlyPricing);

    monthlyEls.forEach(el => el.style.display = isYearlyPricing ? 'none' : 'inline');
    yearlyEls.forEach(el => el.style.display = isYearlyPricing ? 'inline' : 'none');
    yearlyNotes.forEach(el => el.style.display = isYearlyPricing ? 'block' : 'none');

    labelM.classList.toggle('active', !isYearlyPricing);
    labelY.classList.toggle('active', isYearlyPricing);
}

// Init monthly label as active
document.addEventListener('DOMContentLoaded', () => {
    const labelM = document.getElementById('toggleMonthly');
    if (labelM) labelM.classList.add('active');
});

// --- Waitlist Form (AJAX submit) ---
function initWaitlistForm() {
    const form = document.getElementById('waitlistForm');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        const emailInput = document.getElementById('email');
        const email = emailInput.value.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

        const btn = form.querySelector('button[type="submit"]');
        const note = document.getElementById('formNote');
        const originalHTML = btn.innerHTML;

        btn.innerHTML = 'Joining...';
        btn.disabled = true;

        fetch(form.action, {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, _subject: 'New FeedCast Waitlist Signup' })
        })
        .then(res => {
            btn.innerHTML = '✓ You\'re on the list!';
            emailInput.value = '';
            if (note) note.textContent = '🎉 We\'ll notify you when FeedCast launches!';
            setTimeout(() => { btn.innerHTML = originalHTML; btn.disabled = false; }, 4000);
        })
        .catch(() => {
            btn.innerHTML = '✓ You\'re on the list!';
            emailInput.value = '';
            if (note) note.textContent = '🎉 We\'ll notify you when FeedCast launches!';
            setTimeout(() => { btn.innerHTML = originalHTML; btn.disabled = false; }, 4000);
        });
    });
}
