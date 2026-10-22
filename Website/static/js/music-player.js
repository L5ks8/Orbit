// Orbit Floating Music Widget (G-Eazy - Lady Killers II)
(function() {
  const VIDEO_ID = 'QN0wVGckijc'; // Official Audio
  const FALLBACK_VIDEO_ID = 'i9L_Ew4t1xg'; // Alternate video ID

  let ytPlayer = null;
  let isPlaying = false;
  let isPlayerReady = false;
  let currentVolume = 50;
  let isMinimized = false;

  function initMusicPlayer() {
    // Inject custom CSS for equalizer animation
    if (!document.getElementById('orbit-music-styles')) {
      const style = document.createElement('style');
      style.id = 'orbit-music-styles';
      style.textContent = `
        @keyframes orbitEq1 { 0%, 100% { height: 4px; } 50% { height: 14px; } }
        @keyframes orbitEq2 { 0%, 100% { height: 14px; } 50% { height: 6px; } }
        @keyframes orbitEq3 { 0%, 100% { height: 8px; } 50% { height: 16px; } }
        .orbit-eq-bar-1 { animation: orbitEq1 0.8s ease-in-out infinite; }
        .orbit-eq-bar-2 { animation: orbitEq2 0.7s ease-in-out infinite; }
        .orbit-eq-bar-3 { animation: orbitEq3 0.9s ease-in-out infinite; }
        .orbit-disc-spin { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `;
      document.head.appendChild(style);
    }

    // Create container in body
    const widget = document.createElement('div');
    widget.id = 'orbit-music-widget';
    widget.className = 'fixed bottom-4 right-4 z-[85] select-none';
    widget.innerHTML = `
      <!-- Expanded Player Card -->
      <div id="orbit-music-card" class="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 max-w-[340px]">
        
        <!-- Thumbnail / Visualizer -->
        <div class="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-700/60 bg-neutral-950">
          <img src="https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg" alt="Cover" class="w-full h-full object-cover">
          <!-- Equalizer overlay when playing -->
          <div id="orbit-music-eq" class="absolute inset-0 bg-black/60 backdrop-blur-[1px] hidden items-end justify-center gap-0.5 pb-2">
            <span class="w-1 bg-[#5865F2] rounded-full orbit-eq-bar-1"></span>
            <span class="w-1 bg-white rounded-full orbit-eq-bar-2"></span>
            <span class="w-1 bg-[#5865F2] rounded-full orbit-eq-bar-3"></span>
          </div>
        </div>

        <!-- Song Info -->
        <div class="flex-1 min-w-0 pr-1">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-semibold text-white truncate tracking-tight">Lady Killers II</span>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/[0.08] text-neutral-400">AUDIO</span>
          </div>
          <div class="text-[11px] text-neutral-400 truncate">G-Eazy</div>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-1.5">
          <!-- Play / Pause Button -->
          <button type="button" id="orbit-music-toggle-btn" aria-label="Play Music" class="w-8 h-8 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm">
            <!-- Play SVG -->
            <svg id="orbit-music-play-icon" class="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <!-- Pause SVG -->
            <svg id="orbit-music-pause-icon" class="w-4 h-4 hidden" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>

          <!-- Volume Slider Container -->
          <div class="relative group/vol flex items-center">
            <button type="button" id="orbit-music-vol-btn" aria-label="Volume" class="w-7 h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors cursor-pointer">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
            </button>
            <!-- Mini volume slider popup/inline -->
            <div class="hidden group-hover/vol:flex absolute bottom-full right-0 mb-2 p-2 rounded-xl bg-neutral-900 border border-neutral-800 shadow-xl items-center gap-2">
              <input type="range" id="orbit-music-vol-slider" min="0" max="100" value="50" class="w-20 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#5865F2]">
            </div>
          </div>

          <!-- Minimize Button -->
          <button type="button" id="orbit-music-min-btn" aria-label="Minimize" title="Minimize player" class="w-7 h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors cursor-pointer">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Minimized Floating Bubble -->
      <button type="button" id="orbit-music-bubble" aria-label="Expand Music Player" title="Lady Killers II (G-Eazy)" class="hidden w-12 h-12 rounded-full border border-neutral-700/80 bg-neutral-900/95 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.6)] items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer relative">
        <svg class="w-5 h-5 text-neutral-200" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <span id="orbit-music-bubble-dot" class="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-neutral-500 border-2 border-neutral-900"></span>
      </button>

      <!-- Hidden YouTube Player Container -->
      <div id="yt-player-host" style="position:fixed; bottom:0; right:0; width:1px; height:1px; opacity:0.01; pointer-events:none; z-index:-1;"></div>
    `;

    document.body.appendChild(widget);

    // Event elements
    const card = document.getElementById('orbit-music-card');
    const bubble = document.getElementById('orbit-music-bubble');
    const toggleBtn = document.getElementById('orbit-music-toggle-btn');
    const playIcon = document.getElementById('orbit-music-play-icon');
    const pauseIcon = document.getElementById('orbit-music-pause-icon');
    const eq = document.getElementById('orbit-music-eq');
    const minBtn = document.getElementById('orbit-music-min-btn');
    const volSlider = document.getElementById('orbit-music-vol-slider');
    const bubbleDot = document.getElementById('orbit-music-bubble-dot');

    // Minimize / Expand logic
    minBtn.onclick = () => {
      card.classList.add('hidden');
      bubble.classList.remove('hidden');
      bubble.classList.add('flex');
      isMinimized = true;
    };

    bubble.onclick = () => {
      bubble.classList.add('hidden');
      bubble.classList.remove('flex');
      card.classList.remove('hidden');
      isMinimized = false;
    };

    // Toggle Play / Pause
    toggleBtn.onclick = () => {
      if (!isPlayerReady || !ytPlayer) {
        loadYouTubePlayer(true);
        return;
      }

      if (isPlaying) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    };

    // Volume Slider
    volSlider.oninput = (e) => {
      currentVolume = parseInt(e.target.value, 10);
      if (ytPlayer && ytPlayer.setVolume) {
        ytPlayer.setVolume(currentVolume);
      }
    };

    // Load YouTube API
    loadYouTubeAPI();
  }

  function updateUIState(playing) {
    isPlaying = playing;
    const playIcon = document.getElementById('orbit-music-play-icon');
    const pauseIcon = document.getElementById('orbit-music-pause-icon');
    const eq = document.getElementById('orbit-music-eq');
    const bubbleDot = document.getElementById('orbit-music-bubble-dot');

    if (playing) {
      if (playIcon) playIcon.classList.add('hidden');
      if (pauseIcon) pauseIcon.classList.remove('hidden');
      if (eq) {
        eq.classList.remove('hidden');
        eq.classList.add('flex');
      }
      if (bubbleDot) {
        bubbleDot.className = 'absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-neutral-900 animate-pulse';
      }
    } else {
      if (playIcon) playIcon.classList.remove('hidden');
      if (pauseIcon) pauseIcon.classList.add('hidden');
      if (eq) {
        eq.classList.add('hidden');
        eq.classList.remove('flex');
      }
      if (bubbleDot) {
        bubbleDot.className = 'absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-neutral-500 border-2 border-neutral-900';
      }
    }
  }

  function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
      loadYouTubePlayer(false);
      return;
    }

    // Define global callback
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function() {
      if (typeof prevCallback === 'function') prevCallback();
      loadYouTubePlayer(false);
    };

    // Inject YouTube API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(tag, firstScript);
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
            // YT.PlayerState.PLAYING === 1
            if (event.data === 1) {
              updateUIState(true);
            } else if (event.data === 2) { // PAUSED
              updateUIState(false);
            } else if (event.data === 0) { // ENDED -> loop
              event.target.seekTo(0);
              event.target.playVideo();
            }
          },
          onError: function() {
            // Fallback video ID if restricted
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

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusicPlayer);
  } else {
    initMusicPlayer();
  }
})();
