// Global variables
let isYearlyPricing = false;
let audioContext;
let analyser;
let dataArray;
let isPlaying = false;
let currentTime = 0;
let totalTime = 154; // 2:34 in seconds
let animationId;

// Sample segments data
const sampleSegments = [
    {
        title: "Tech News Opening",
        description: "AI developments and startup updates",
        duration: 45
    },
    {
        title: "Lo-fi Interlude",
        description: "AI-generated background music",
        duration: 30
    },
    {
        title: "AI & Business",
        description: "Market analysis and trends",
        duration: 50
    },
    {
        title: "Closing Music",
        description: "Smooth outro with fade",
        duration: 29
    }
];

let currentSegmentIndex = 0;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAudioVisualization();
    initializeProgressBar();
    initializeWaitlistForm();
    initializeMobileMenu();
    updatePlayerInfo();
    startProgressSimulation();
});

// Navigation Functions
function scrollToWaitlist() {
    document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth' });
}

function scrollToSample() {
    document.getElementById('sample').scrollIntoView({ behavior: 'smooth' });
}

function toggleMobileMenu() {
    // Mobile menu toggle logic would go here
    console.log('Mobile menu toggle');
}

// Pricing Functions
function togglePricing() {
    isYearlyPricing = !isYearlyPricing;
    const toggleSwitch = document.querySelector('.toggle-switch');
    const monthlyPrices = document.querySelectorAll('.monthly-price');
    const yearlyPrices = document.querySelectorAll('.yearly-price');
    const yearlyNotes = document.querySelectorAll('.yearly-note');
    const toggleLabels = document.querySelectorAll('.toggle-label');
    
    toggleSwitch.classList.toggle('active');
    
    if (isYearlyPricing) {
        monthlyPrices.forEach(price => price.style.display = 'none');
        yearlyPrices.forEach(price => price.style.display = 'inline');
        yearlyNotes.forEach(note => note.style.display = 'block');
        toggleLabels[0].classList.remove('active');
        toggleLabels[1].classList.add('active');
    } else {
        monthlyPrices.forEach(price => price.style.display = 'inline');
        yearlyPrices.forEach(price => price.style.display = 'none');
        yearlyNotes.forEach(note => note.style.display = 'none');
        toggleLabels[1].classList.remove('active');
        toggleLabels[0].classList.add('active');
    }
}

// Audio Player Functions
function initializeAudioVisualization() {
    const canvas = document.getElementById('waveform');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Create mock waveform data
    const barCount = 50;
    const barWidth = width / barCount;
    
    function drawWaveform() {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < barCount; i++) {
            // Create animated waveform bars
            let barHeight = Math.sin((Date.now() * 0.005) + (i * 0.2)) * 20 + 30;
            if (!isPlaying) {
                barHeight = Math.random() * 10 + 5; // Static when paused
            }
            
            const x = i * barWidth;
            const y = (height - barHeight) / 2;
            
            // Create gradient
            const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
            gradient.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
            gradient.addColorStop(1, 'rgba(118, 75, 162, 0.8)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth - 2, barHeight);
        }
        
        if (isPlaying) {
            animationId = requestAnimationFrame(drawWaveform);
        }
    }
    
    drawWaveform();
}

function initializeProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    const progressHandle = document.getElementById('progressHandle');
    
    if (!progressBar || !progressHandle) return;
    
    progressBar.addEventListener('click', function(e) {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        currentTime = percentage * totalTime;
        updateProgress();
        updatePlayerInfo();
    });
    
    // Handle dragging
    let isDragging = false;
    
    progressHandle.addEventListener('mousedown', function(e) {
        isDragging = true;
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const rect = progressBar.getBoundingClientRect();
        const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const percentage = clickX / rect.width;
        currentTime = percentage * totalTime;
        updateProgress();
        updatePlayerInfo();
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });
}

function togglePlayPause() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const pulseRings = document.querySelector('.pulse-rings');
    
    isPlaying = !isPlaying;
    playPauseBtn.classList.toggle('playing');
    
    if (isPlaying) {
        startProgressSimulation();
        initializeAudioVisualization();
        pulseRings.style.opacity = '1';
    } else {
        stopProgressSimulation();
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        pulseRings.style.opacity = '0.3';
    }
}

function skipBack() {
    if (currentSegmentIndex > 0) {
        currentSegmentIndex--;
        // Calculate segment start time
        currentTime = sampleSegments.slice(0, currentSegmentIndex).reduce((acc, seg) => acc + seg.duration, 0);
        updateProgress();
        updatePlayerInfo();
    }
}

function skipForward() {
    if (currentSegmentIndex < sampleSegments.length - 1) {
        currentSegmentIndex++;
        // Calculate segment start time
        currentTime = sampleSegments.slice(0, currentSegmentIndex).reduce((acc, seg) => acc + seg.duration, 0);
        updateProgress();
        updatePlayerInfo();
    } else {
        // End of track
        currentTime = totalTime;
        isPlaying = false;
        document.getElementById('playPauseBtn').classList.remove('playing');
        updateProgress();
    }
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressHandle = document.getElementById('progressHandle');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    
    if (!progressFill || !progressHandle) return;
    
    const percentage = (currentTime / totalTime) * 100;
    progressFill.style.width = percentage + '%';
    progressHandle.style.left = percentage + '%';
    
    if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(currentTime);
    }
    
    if (totalTimeEl) {
        totalTimeEl.textContent = formatTime(totalTime);
    }
}

function updatePlayerInfo() {
    // Determine current segment
    let accumulatedTime = 0;
    let segmentIndex = 0;
    
    for (let i = 0; i < sampleSegments.length; i++) {
        if (currentTime >= accumulatedTime && currentTime < accumulatedTime + sampleSegments[i].duration) {
            segmentIndex = i;
            break;
        }
        accumulatedTime += sampleSegments[i].duration;
    }
    
    currentSegmentIndex = segmentIndex;
    
    const titleEl = document.getElementById('current-segment');
    const descEl = document.getElementById('current-description');
    
    if (titleEl && descEl) {
        titleEl.textContent = sampleSegments[segmentIndex].title;
        descEl.textContent = sampleSegments[segmentIndex].description;
    }
}

function startProgressSimulation() {
    if (!isPlaying) return;
    
    function updateTime() {
        if (isPlaying && currentTime < totalTime) {
            currentTime += 0.1;
            updateProgress();
            updatePlayerInfo();
            setTimeout(updateTime, 100);
        } else if (currentTime >= totalTime) {
            // Track ended
            isPlaying = false;
            document.getElementById('playPauseBtn').classList.remove('playing');
            currentTime = 0;
            currentSegmentIndex = 0;
            updateProgress();
            updatePlayerInfo();
        }
    }
    
    updateTime();
}

function stopProgressSimulation() {
    // Progress simulation stops naturally when isPlaying becomes false
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + secs.toString().padStart(2, '0');
}

// Waitlist Form Functions
function initializeWaitlistForm() {
    const form = document.getElementById('waitlistForm');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('email');
        const email = emailInput.value.trim();
        
        if (!isValidEmail(email)) {
            showFormMessage('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate form submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = 'Adding you...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            showFormMessage('🎉 Welcome to the waitlist! We\'ll be in touch soon.', 'success');
            emailInput.value = '';
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFormMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageEl = document.createElement('div');
    messageEl.className = `form-message form-message-${type}`;
    messageEl.textContent = message;
    
    // Add styles
    Object.assign(messageEl.style, {
        padding: '12px 16px',
        borderRadius: '8px',
        marginTop: '1rem',
        textAlign: 'center',
        fontWeight: '500',
        backgroundColor: type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        color: type === 'success' ? '#22c55e' : '#ef4444',
        border: `1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
    });
    
    // Insert after form
    const form = document.getElementById('waitlistForm');
    form.appendChild(messageEl);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}

// Mobile Menu Functions
function initializeMobileMenu() {
    // Mobile menu functionality would be implemented here
    // For now, just a placeholder
}

// Smooth scrolling for navigation links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animations
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.step, .pricing-card, .sample-feature');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add loading states and micro-interactions
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('click', function(e) {
        // Ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .btn-primary, .btn-secondary {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(style);