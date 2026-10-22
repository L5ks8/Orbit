// Orbit Floating Music Widget (G-Eazy - Lady Killers II)
// State logic:
// 1. Initially OPEN (expanded pill card, no hover-collapse).
// 2. Click "-" -> minimizes into a small rounded square showing only the album image.
// 3. When minimized: Hover unfolds smoothly to the left; unhover folds back to square.
// 4. Click while minimized: permanently expands and stays open until "-" is clicked.
// 5. Volume: Speaker icon button with smooth vertical popup rolling upwards.

(function() {
  const VIDEO_ID = 'QN0wVGckijc'; // Official Audio
  const FALLBACK_VIDEO_ID = 'i9L_Ew4t1xg'; // Alternate video

  let ytPlayer = null;
  let isPlaying = false;
  let isPlayerReady = false;
  let currentVolume = 50;
  let isMinimized = false; // Starts OPEN by default!

  function initMusicPlayer() {
    if (document.getElementById('orbit-music-widget')) return;

    // Inject custom CSS
    if (!document.getElementById('orbit-music-styles')) {
      const style = document.createElement('style');
      style.id = 'orbit-music-styles';
      style.textContent = `
        @keyframes orbitEq1 { 0%, 100% { height: 4px; } 50% { height: 16px; } }
        @keyframes orbitEq2 { 0%, 100% { height: 16px; } 50% { height: 6px; } }
        @keyframes orbitEq3 { 0%, 100% { height: 8px; } 50% { height: 18px; } }
        .orbit-eq-bar-1 { animation: orbitEq1 0.8s ease-in-out infinite; }
        .orbit-eq-bar-2 { animation: orbitEq2 0.7s ease-in-out infinite; }
        .orbit-eq-bar-3 { animation: orbitEq3 0.9s ease-in-out infinite; }

        #orbit-music-box {
          transition: width 340ms cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 250ms ease, border-color 250ms ease;
        }
        #orbit-music-details {
          transition: opacity 220ms ease, max-width 340ms cubic-bezier(0.2, 0.9, 0.3, 1);
        }
        #orbit-vol-popup {
          transition: opacity 220ms ease, transform 220ms cubic-bezier(0.2, 0.9, 0.3, 1);
        }
        /* Custom vertical range slider styling */
        input[type=range][orient=vertical] {
          writing-mode: vertical-lr;
          direction: rtl;
          appearance: slider-vertical;
          width: 6px;
          vertical-align: bottom;
        }
      `;
      document.head.appendChild(style);
    }

    // Main widget fixed bottom-right
    const widget = document.createElement('div');
    widget.id = 'orbit-music-widget';
    widget.className = 'fixed bottom-4 right-4 z-[85] select-none flex items-center justify-end';

    // Initial state: w-[335px] (fully open)
    widget.innerHTML = `
      <div id="orbit-music-box" class="relative flex items-center rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.55)] overflow-visible w-[335px] h-[54px] p-1.5 transition-all duration-300 ease-out cursor-pointer hover:border-neutral-700/80">
        
        <!-- Album Art Square (Always visible) -->
        <div id="orbit-music-cover-btn" class="relative w-[42px] h-[42px] flex-shrink-0 overflow-hidden rounded-xl bg-neutral-950 flex items-center justify-center border border-neutral-700/60 shadow-sm" title="Lady Killers II - G-Eazy">
          <img src="https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg" alt="Lady Killers II" class="w-full h-full object-cover">
          
          <!-- Equalizer overlay if playing -->
          <div id="orbit-music-eq" class="absolute inset-0 bg-black/60 backdrop-blur-[1px] hidden items-end justify-center gap-0.5 pb-1.5">
            <span class="w-1 bg-[#5865F2] rounded-full orbit-eq-bar-1"></span>
            <span class="w-1 bg-white rounded-full orbit-eq-bar-2"></span>
            <span class="w-1 bg-[#5865F2] rounded-full orbit-eq-bar-3"></span>
          </div>

          <!-- Pulsing playing dot -->
          <span id="orbit-music-pulse" class="absolute top-1 right-1 w-2 h-2 rounded-full bg-neutral-600 border border-neutral-900 transition-colors"></span>
        </div>

        <!-- Controls container (Full Pill details) -->
        <div id="orbit-music-details" class="flex items-center gap-2.5 pl-2.5 pr-2 w-full max-w-[280px] opacity-100 overflow-hidden whitespace-nowrap pointer-events-auto">
          
          <!-- Track Info -->
          <div class="flex flex-col min-w-0 flex-1 pr-1">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-semibold text-white tracking-tight truncate">Lady Killers II</span>
              <span class="text-[9px] font-bold px-1 py-0.2 rounded bg-white/[0.08] text-neutral-400 flex-shrink-0">AUDIO</span>
            </div>
            <span class="text-[11px] text-neutral-400 truncate">G-Eazy</span>
          </div>

          <!-- Play / Pause Button -->
          <button type="button" id="orbit-music-play-btn" aria-label="Play/Pause" class="w-8 h-8 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm flex-shrink-0">
            <!-- Play Icon -->
            <svg id="orbit-play-svg" class="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <!-- Pause Icon -->
            <svg id="orbit-pause-svg" class="w-4 h-4 hidden" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>

          <!-- Volume Button with vertical upward popup -->
          <div class="relative group/vol flex items-center flex-shrink-0">
            <button type="button" id="orbit-vol-btn" aria-label="Volume" class="w-7 h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors cursor-pointer">
              <svg id="orbit-vol-icon-svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
            </button>
            
            <!-- Upward rollout volume slider -->
            <div id="orbit-vol-popup" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-2.5 py-3 rounded-2xl bg-neutral-900/95 border border-neutral-800 shadow-[0_8px_32px_rgba(0,0,0,0.65)] backdrop-blur-md flex flex-col items-center gap-2 opacity-0 translate-y-2 pointer-events-none group-hover/vol:opacity-100 group-hover/vol:translate-y-0 group-hover/vol:pointer-events-auto z-30">
              <span id="orbit-vol-label" class="text-[10px] font-semibold text-neutral-300">50%</span>
              <input type="range" id="orbit-vol-slider" min="0" max="100" value="50" orient="vertical" class="h-20 w-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#5865F2]">
            </div>
          </div>

          <!-- Minimize Button ("-") -->
          <button type="button" id="orbit-music-min-btn" aria-label="Minimize" title="Minimize player" class="w-7 h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors cursor-pointer flex-shrink-0">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

        </div>

      </div>

      <!-- Hidden YouTube Player host -->
      <div id="yt-player-host" style="position:fixed; bottom:0; right:0; width:1px; height:1px; opacity:0.01; pointer-events:none; z-index:-1;"></div>
    `;

    document.body.appendChild(widget);

    const box = document.getElementById('orbit-music-box');
    const details = document.getElementById('orbit-music-details');
    const playBtn = document.getElementById('orbit-music-play-btn');
    const minBtn = document.getElementById('orbit-music-min-btn');
    const coverBtn = document.getElementById('orbit-music-cover-btn');
    const volSlider = document.getElementById('orbit-vol-slider');
    const volLabel = document.getElementById('orbit-vol-label');
    const volBtn = document.getElementById('orbit-vol-btn');

    function applyExpandedUI() {
      box.classList.remove('w-[54px]');
      box.classList.add('w-[335px]');
      details.classList.remove('max-w-0', 'opacity-0', 'pointer-events-none');
      details.classList.add('max-w-[280px]', 'opacity-100', 'pointer-events-auto');
    }

    function applyCollapsedUI() {
      box.classList.remove('w-[335px]');
      box.classList.add('w-[54px]');
      details.classList.remove('max-w-[280px]', 'opacity-100', 'pointer-events-auto');
      details.classList.add('max-w-0', 'opacity-0', 'pointer-events-none');
    }

    // 1. Hover behavior: ONLY active when minimized!
    widget.addEventListener('mouseenter', () => {
      if (isMinimized) {
        applyExpandedUI();
      }
    });

    widget.addEventListener('mouseleave', () => {
      // If minimized and not locked open, collapse back to square
      if (isMinimized) {
        applyCollapsedUI();
      }
    });

    // 2. Click on the widget while minimized -> EXPANDS & STAYS EXPANDED
    box.addEventListener('click', (e) => {
      // Ignore clicks on inner controls (play, volume, minus)
      if (e.target.closest('#orbit-music-play-btn') || 
          e.target.closest('#orbit-vol-btn') || 
          e.target.closest('#orbit-vol-popup') || 
          e.target.closest('#orbit-music-min-btn')) {
        return;
      }

      // If it was minimized, clicking expands it and locks it open permanently!
      if (isMinimized) {
        isMinimized = false;
        applyExpandedUI();
      }
    });

    // 3. Click "-" (minus button) -> MINIMIZES into square
    minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isMinimized = true;
      applyCollapsedUI();
    });

    // 4. Play / Pause logic
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isPlayerReady || !ytPlayer) {
        loadYouTubePlayer(true);
        return;
      }

      if (isPlaying) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    });

    // 5. Volume Slider logic
    volSlider.addEventListener('input', (e) => {
      e.stopPropagation();
      currentVolume = parseInt(e.target.value, 10);
      if (volLabel) volLabel.textContent = `${currentVolume}%`;
      if (ytPlayer && ytPlayer.setVolume) {
        ytPlayer.setVolume(currentVolume);
      }
    });

    // Volume icon button (click to mute/unmute)
    volBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!ytPlayer) return;
      if (ytPlayer.isMuted && ytPlayer.isMuted()) {
        ytPlayer.unMute();
        volSlider.value = currentVolume || 50;
        if (volLabel) volLabel.textContent = `${volSlider.value}%`;
      } else if (ytPlayer.mute) {
        ytPlayer.mute();
        volSlider.value = 0;
        if (volLabel) volLabel.textContent = `0%`;
      }
    });

    // Load YouTube API
    loadYouTubeAPI();
  }

  function updateUIState(playing) {
    isPlaying = playing;
    const playSvg = document.getElementById('orbit-play-svg');
    const pauseSvg = document.getElementById('orbit-pause-svg');
    const eq = document.getElementById('orbit-music-eq');
    const pulse = document.getElementById('orbit-music-pulse');

    if (playing) {
      if (playSvg) playSvg.classList.add('hidden');
      if (pauseSvg) pauseSvg.classList.remove('hidden');
      if (eq) {
        eq.classList.remove('hidden');
        eq.classList.add('flex');
      }
      if (pulse) {
        pulse.className = 'absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 border border-neutral-900 animate-pulse';
      }
    } else {
      if (playSvg) playSvg.classList.remove('hidden');
      if (pauseSvg) pauseSvg.classList.add('hidden');
      if (eq) {
        eq.classList.add('hidden');
        eq.classList.remove('flex');
      }
      if (pulse) {
        pulse.className = 'absolute top-1 right-1 w-2 h-2 rounded-full bg-neutral-600 border border-neutral-900';
      }
    }
  }

  function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
      loadYouTubePlayer(false);
      return;
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function() {
      if (typeof prevCallback === 'function') prevCallback();
      loadYouTubePlayer(false);
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(tag, firstScript);
    } else {
      document.head.appendChild(tag);
    }
  }

  function loadYouTubePlayer(autoPlayOnReady) {
    if (ytPlayer) return;

    try {
      ytPlayer = new window.YT.Player('yt-player-host', {
        height: '180',
        width: '320',
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: autoPlayOnReady ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: function(event) {
            isPlayerReady = true;
            event.target.setVolume(currentVolume);
            if (autoPlayOnReady) {
              event.target.playVideo();
            }
          },
          onStateChange: function(event) {
            if (event.data === 1) { // PLAYING
              updateUIState(true);
            } else if (event.data === 2) { // PAUSED
              updateUIState(false);
            } else if (event.data === 0) { // ENDED -> loop
              event.target.seekTo(0);
              event.target.playVideo();
            }
          },
          onError: function() {
            try {
              if (ytPlayer && ytPlayer.loadVideoById) {
                ytPlayer.loadVideoById(FALLBACK_VIDEO_ID);
              }
            } catch (err) {}
          }
        }
      });
    } catch (e) {
      console.warn('Could not initialize YouTube Player:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusicPlayer);
  } else {
    initMusicPlayer();
  }
})();
