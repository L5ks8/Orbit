// Orbit Floating Music Widget (G-Eazy - Lady Killers II)
// Features: Collapsible square with rounded corners, unfolds to the left on hover, pins open on click.
(function() {
  const VIDEO_ID = 'QN0wVGckijc'; // Official Audio
  const FALLBACK_VIDEO_ID = 'i9L_Ew4t1xg'; // Alternate video

  let ytPlayer = null;
  let isPlaying = false;
  let isPlayerReady = false;
  let currentVolume = 50;
  let isLockedOpen = false; // Pinned open on click
  let isHovered = false;

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
        
        #orbit-music-widget {
          transition: width 350ms cubic-bezier(0.2, 0.9, 0.3, 1), transform 200ms ease;
        }
        #orbit-music-details {
          transition: opacity 250ms ease, max-width 350ms cubic-bezier(0.2, 0.9, 0.3, 1);
        }
      `;
      document.head.appendChild(style);
    }

    // Create widget container anchored bottom-right
    const widget = document.createElement('div');
    widget.id = 'orbit-music-widget';
    widget.className = 'fixed bottom-4 right-4 z-[85] select-none flex items-center justify-end';
    
    // Inner box: initially compact square (w-13 h-13 / 52px)
    widget.innerHTML = `
      <div id="orbit-music-box" class="relative flex items-center rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.55)] overflow-hidden cursor-pointer w-[52px] h-[52px] transition-all duration-300 ease-out">
        
        <!-- Album Art Square (Always visible) -->
        <div id="orbit-music-square" class="relative w-[52px] h-[52px] flex-shrink-0 overflow-hidden rounded-2xl bg-neutral-950 flex items-center justify-center">
          <img src="https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg" alt="Lady Killers II" class="w-full h-full object-cover">
          
          <!-- Equalizer overlay if playing -->
          <div id="orbit-music-eq" class="absolute inset-0 bg-black/60 backdrop-blur-[1px] hidden items-end justify-center gap-1 pb-2.5">
            <span class="w-1 bg-[#5865F2] rounded-full orbit-eq-bar-1"></span>
            <span class="w-1 bg-white rounded-full orbit-eq-bar-2"></span>
            <span class="w-1 bg-[#5865F2] rounded-full orbit-eq-bar-3"></span>
          </div>

          <!-- Pulsing playing dot -->
          <span id="orbit-music-pulse" class="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-neutral-600 border border-neutral-900 transition-colors"></span>
        </div>

        <!-- Unfolding Details Container (Hidden when collapsed, unfolds left on hover/click) -->
        <div id="orbit-music-details" class="flex items-center gap-3 pl-3 pr-4 max-w-0 opacity-0 overflow-hidden whitespace-nowrap pointer-events-none">
          
          <!-- Song Info -->
          <div class="flex flex-col min-w-[105px] pr-1">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-semibold text-white tracking-tight">Lady Killers II</span>
              <span class="text-[9px] font-bold px-1 py-0.2 rounded bg-white/[0.08] text-neutral-400">AUDIO</span>
            </div>
            <span class="text-[11px] text-neutral-400">G-Eazy</span>
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

          <!-- Volume Slider Group -->
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <button type="button" id="orbit-vol-icon-btn" aria-label="Volume" class="w-7 h-7 rounded-lg text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
            </button>
            <input type="range" id="orbit-vol-slider" min="0" max="100" value="50" class="w-16 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#5865F2]">
          </div>

          <!-- Minimize / Lock Icon -->
          <button type="button" id="orbit-minimize-btn" title="Minimize to square" class="w-7 h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.08] flex items-center justify-center transition-colors cursor-pointer flex-shrink-0">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

        </div>

      </div>

      <!-- Hidden YouTube Player Container -->
      <div id="yt-player-host" style="position:fixed; bottom:0; right:0; width:1px; height:1px; opacity:0.01; pointer-events:none; z-index:-1;"></div>
    `;

    document.body.appendChild(widget);

    const box = document.getElementById('orbit-music-box');
    const details = document.getElementById('orbit-music-details');
    const square = document.getElementById('orbit-music-square');
    const playBtn = document.getElementById('orbit-music-play-btn');
    const minimizeBtn = document.getElementById('orbit-minimize-btn');
    const volSlider = document.getElementById('orbit-vol-slider');
    const volIconBtn = document.getElementById('orbit-vol-icon-btn');

    // Expand helper
    function expandPlayer() {
      box.classList.remove('w-[52px]');
      box.classList.add('w-[350px]');
      details.classList.remove('max-w-0', 'opacity-0', 'pointer-events-none');
      details.classList.add('max-w-[300px]', 'opacity-100', 'pointer-events-auto');
    }

    // Collapse helper
    function collapsePlayer() {
      box.classList.remove('w-[350px]');
      box.classList.add('w-[52px]');
      details.classList.remove('max-w-[300px]', 'opacity-100', 'pointer-events-auto');
      details.classList.add('max-w-0', 'opacity-0', 'pointer-events-none');
    }

    // 1. Hover unfold to the left
    widget.addEventListener('mouseenter', () => {
      isHovered = true;
      expandPlayer();
    });

    widget.addEventListener('mouseleave', () => {
      isHovered = false;
      // Only collapse if not locked open by click
      if (!isLockedOpen) {
        collapsePlayer();
      }
    });

    // 2. Click to toggle lock / stay open
    box.addEventListener('click', (e) => {
      // If clicking interactive controls, do not toggle collapse
      if (e.target.closest('#orbit-music-play-btn') || 
          e.target.closest('#orbit-vol-slider') || 
          e.target.closest('#orbit-vol-icon-btn')) {
        return;
      }

      // If clicking minimize button, close and unlock
      if (e.target.closest('#orbit-minimize-btn')) {
        e.stopPropagation();
        isLockedOpen = false;
        collapsePlayer();
        return;
      }

      // Clicking on the player box locks it open
      if (!isLockedOpen) {
        isLockedOpen = true;
        expandPlayer();
      } else if (e.target.closest('#orbit-music-square')) {
        // Clicking album image while locked toggles it back to minimized square
        isLockedOpen = false;
        if (!isHovered) {
          collapsePlayer();
        }
      }
    });

    // Minimize button click
    minimizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isLockedOpen = false;
      collapsePlayer();
    });

    // 3. Play / Pause button
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

    // 4. Volume Slider
    volSlider.addEventListener('input', (e) => {
      e.stopPropagation();
      currentVolume = parseInt(e.target.value, 10);
      if (ytPlayer && ytPlayer.setVolume) {
        ytPlayer.setVolume(currentVolume);
      }
    });

    // Mute toggle on vol icon
    volIconBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!ytPlayer) return;
      if (ytPlayer.isMuted && ytPlayer.isMuted()) {
        ytPlayer.unMute();
        volSlider.value = currentVolume;
      } else if (ytPlayer.mute) {
        ytPlayer.mute();
        volSlider.value = 0;
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
        pulse.className = 'absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-neutral-900 animate-pulse';
      }
    } else {
      if (playSvg) playSvg.classList.remove('hidden');
      if (pauseSvg) pauseSvg.classList.add('hidden');
      if (eq) {
        eq.classList.add('hidden');
        eq.classList.remove('flex');
      }
      if (pulse) {
        pulse.className = 'absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-neutral-600 border border-neutral-900';
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
