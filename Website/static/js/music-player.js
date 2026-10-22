// Orbit Floating Music Widget (G-Eazy - Lady Killers II)
(function() {
  const VIDEO_ID = 'QN0wVGckijc'; // Official Audio
  const FALLBACK_VIDEO_ID = 'i9L_Ew4t1xg'; // Alternate video

  let ytPlayer = null;
  let isPlaying = false;
  let isPlayerReady = false;
  let pendingPlay = false;
  let currentVolume = 50;
  let isMinimized = false; // Starts OPEN by default!

  function initMusicPlayer() {
    if (document.getElementById('orbit-music-widget')) return;

    // 1. Inject fully self-contained CSS rules
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

        /* Card Container Transitions */
        #orbit-music-box {
          width: 335px;
          height: 54px;
          transition: width 340ms cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 250ms ease, border-color 250ms ease;
        }
        #orbit-music-box.orbit-collapsed {
          width: 54px !important;
        }

        /* Details inner flex */
        #orbit-music-details {
          max-width: 280px;
          opacity: 1;
          pointer-events: auto;
          overflow: visible !important;
          transition: max-width 320ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 200ms ease;
        }
        #orbit-music-details.orbit-hidden {
          max-width: 0 !important;
          opacity: 0 !important;
          pointer-events: none !important;
          padding: 0 !important;
          margin: 0 !important;
          overflow: hidden !important;
        }

        /* Upward Volume Popup */
        #orbit-vol-popup {
          position: absolute;
          bottom: calc(100% + 14px);
          left: 50%;
          transform: translateX(-50%) translateY(8px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 200ms ease, transform 200ms cubic-bezier(0.2, 0.9, 0.3, 1);
          z-index: 99999;
          background: #18181b;
          border: 1px solid #3f3f46;
          border-radius: 16px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 8px;
          gap: 8px;
        }
        #orbit-vol-group:hover #orbit-vol-popup,
        #orbit-vol-group.is-open #orbit-vol-popup,
        #orbit-vol-popup:hover {
          opacity: 1 !important;
          transform: translateX(-50%) translateY(0) !important;
          pointer-events: auto !important;
        }

        /* Vertical range slider across browsers */
        #orbit-vol-slider {
          -webkit-appearance: slider-vertical;
          writing-mode: vertical-lr;
          direction: rtl;
          width: 8px;
          height: 75px;
          padding: 0;
          cursor: pointer;
        }
      `;
      document.head.appendChild(style);
    }

    // 2. Create Widget element anchored at bottom-right
    const widget = document.createElement('div');
    widget.id = 'orbit-music-widget';
    widget.className = 'fixed bottom-4 right-4 z-[85] select-none flex items-center justify-end';

    widget.innerHTML = `
      <div id="orbit-music-box" class="relative flex items-center rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.55)] overflow-visible p-1.5 cursor-pointer hover:border-neutral-700/80">
        
        <!-- Album Art Square (Always 42x42 inside 54x54 box) -->
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

        <!-- Controls container (Full Details) -->
        <div id="orbit-music-details" class="flex items-center gap-2.5 pl-2.5 pr-2 w-full whitespace-nowrap">
          
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

          <!-- Volume Group with upward rollout -->
          <div id="orbit-vol-group" class="relative flex items-center flex-shrink-0">
            <button type="button" id="orbit-vol-btn" aria-label="Volume" class="w-7 h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors cursor-pointer">
              <svg id="orbit-vol-icon-svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
            </button>
            
            <!-- Upward rollout popup -->
            <div id="orbit-vol-popup" class="px-2.5 py-3 rounded-2xl bg-neutral-900/95 border border-neutral-800 shadow-[0_8px_32px_rgba(0,0,0,0.65)] backdrop-blur-md flex flex-col items-center gap-2">
              <span id="orbit-vol-label" class="text-[10px] font-semibold text-neutral-300">50%</span>
              <input type="range" id="orbit-vol-slider" min="0" max="100" value="50" orient="vertical" class="accent-[#5865F2]">
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

      <!-- Offscreen 200x200 YouTube host so Chrome never blocks playback -->
      <div id="yt-player-host" style="position:fixed; bottom:0; left:-9999px; width:200px; height:200px; opacity:0.01; pointer-events:none; z-index:-10;"></div>
    `;

    document.body.appendChild(widget);

    const box = document.getElementById('orbit-music-box');
    const details = document.getElementById('orbit-music-details');
    const playBtn = document.getElementById('orbit-music-play-btn');
    const minBtn = document.getElementById('orbit-music-min-btn');
    const volGroup = document.getElementById('orbit-vol-group');
    const volBtn = document.getElementById('orbit-vol-btn');
    const volSlider = document.getElementById('orbit-vol-slider');
    const volLabel = document.getElementById('orbit-vol-label');

    function expandUI() {
      box.classList.remove('orbit-collapsed');
      details.classList.remove('orbit-hidden');
    }

    function collapseUI() {
      box.classList.add('orbit-collapsed');
      details.classList.add('orbit-hidden');
      volGroup.classList.remove('is-open');
    }

    // 1. Hover on widget: ONLY active when minimized!
    widget.addEventListener('mouseenter', () => {
      if (isMinimized) {
        expandUI();
      }
    });

    widget.addEventListener('mouseleave', () => {
      if (isMinimized) {
        collapseUI();
      }
    });

    // 2. Click on the widget while minimized -> Expands and locks open!
    box.addEventListener('click', (e) => {
      // Don't toggle if clicking on interactive controls
      if (e.target.closest('#orbit-music-play-btn') || 
          e.target.closest('#orbit-vol-btn') || 
          e.target.closest('#orbit-vol-popup') || 
          e.target.closest('#orbit-music-min-btn')) {
        return;
      }

      if (isMinimized) {
        isMinimized = false;
        expandUI();
      }
    });

    // 3. Click "-" -> minimizes to square
    minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isMinimized = true;
      collapseUI();
    });

    // 4. Play / Pause Button with FIRST-CLICK GUARANTEE
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      if (!isPlayerReady || !ytPlayer) {
        pendingPlay = true;
        updateUIState(true);
        loadYouTubePlayer();
        return;
      }

      try {
        if (isPlaying) {
          ytPlayer.pauseVideo();
          updateUIState(false);
        } else {
          ytPlayer.playVideo();
          updateUIState(true);
        }
      } catch (err) {
        console.warn('Error toggling playback:', err);
      }
    });

    // 5. Volume controls
    volSlider.addEventListener('input', (e) => {
      e.stopPropagation();
      currentVolume = parseInt(e.target.value, 10);
      if (volLabel) volLabel.textContent = `${currentVolume}%`;
      if (ytPlayer && ytPlayer.setVolume) {
        ytPlayer.setVolume(currentVolume);
      }
    });

    // Toggle mute or toggle popup on mobile
    volBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      volGroup.classList.toggle('is-open');
    });

    // Prevent click on popup from propagating to box
    const volPopup = document.getElementById('orbit-vol-popup');
    if (volPopup) {
      volPopup.addEventListener('click', (e) => e.stopPropagation());
    }

    // Initialize YouTube Player immediately in background
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
      loadYouTubePlayer();
      return;
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function() {
      if (typeof prevCallback === 'function') prevCallback();
      loadYouTubePlayer();
    };

    // If tag doesn't exist, inject it
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(tag, firstScript);
      } else {
        document.head.appendChild(tag);
      }
    }
  }

  function loadYouTubePlayer() {
    if (ytPlayer) {
      if (pendingPlay && isPlayerReady) {
        try {
          ytPlayer.playVideo();
          pendingPlay = false;
        } catch (e) {}
      }
      return;
    }

    if (!window.YT || !window.YT.Player) {
      return;
    }

    try {
      ytPlayer = new window.YT.Player('yt-player-host', {
        height: '200',
        width: '200',
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1
        },
        events: {
          onReady: function(event) {
            isPlayerReady = true;
            try {
              event.target.setVolume(currentVolume);
              if (pendingPlay) {
                event.target.playVideo();
                pendingPlay = false;
                updateUIState(true);
              }
            } catch (err) {}
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
