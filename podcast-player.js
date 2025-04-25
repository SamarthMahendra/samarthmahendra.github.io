// D3.js Podcast Player with Audio Visualization
document.addEventListener('DOMContentLoaded', function() {
  // Select main elements
  const audioElement = document.getElementById('podcast-audio');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const playPauseIcon = playPauseBtn.querySelector('i');
  const progressBar = document.querySelector('.d3-audio-progress-bar');
  const progressContainer = document.querySelector('.d3-audio-progress');
  const currentTimeDisplay = document.querySelector('.current-time');
  const durationDisplay = document.querySelector('.duration');
  const volumeIcon = document.querySelector('.d3-audio-volume i');
  const volumeSlider = document.querySelector('.d3-volume-slider');
  const volumeProgress = document.querySelector('.d3-volume-progress');
  const visualizerContainer = document.getElementById('podcast-visualizer');
  const podcastTrigger = document.getElementById('podcast-trigger');
  const podcastPlayer = document.getElementById('podcast-mini-player');
  const podcastCloseBtn = document.querySelector('.podcast-mini-close');
  
  // Audio context setup for visualization
  let audioContext;
  let analyser;
  let dataArray;
  let source;
  let animationId;
  let barElements = [];
  let isInitialized = false;
  let isPlaying = false;
  
  // Toggle podcast player
  podcastTrigger.addEventListener('click', () => {
    podcastPlayer.classList.add('active');
    
    if (!isInitialized) {
      d3Setup();
    }
  });
  
  // Close podcast player
  podcastCloseBtn.addEventListener('click', () => {
    podcastPlayer.classList.remove('active');
    
    if (isPlaying) {
      audioElement.pause();
      playPauseIcon.className = 'fas fa-play';
      isPlaying = false;
      cancelAnimationFrame(animationId);
    }
  });
  
  // Set up D3 for audio visualization
  const d3Setup = () => {
    const width = visualizerContainer.clientWidth;
    const height = visualizerContainer.clientHeight;
    
    // Clear any existing visualization
    d3.select(visualizerContainer).selectAll('*').remove();
    barElements = [];
    
    // Create SVG container
    const svg = d3.select(visualizerContainer)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    // Add a gradient background
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'visualizer-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
      
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(0,0,0,0.2)');
      
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(0,0,0,0.4)');
    
    // Add background rectangle
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#visualizer-gradient)');
    
    // Add decorative circles
    for (let i = 0; i < 3; i++) {
      const radius = Math.random() * 20 + 5;
      svg.append('circle')
        .attr('class', 'visualizer-circle')
        .attr('cx', Math.random() * width)
        .attr('cy', Math.random() * height)
        .attr('r', radius)
        .style('opacity', Math.random() * 0.3 + 0.1);
    }
    
    // Create frequency bars
    const barCount = Math.floor(width / 4); // More responsive number of bars
    const barWidth = width / barCount;
    const g = svg.append('g');
    
    // Create initial bars
    for (let i = 0; i < barCount; i++) {
      const bar = g.append('rect')
        .attr('class', 'audio-bar')
        .attr('x', i * barWidth)
        .attr('width', barWidth - 1)
        .attr('height', 0)
        .attr('fill', getBarColor(i, barCount))
        .style('opacity', 0.75);
      
      barElements.push(bar);
    }
  };
  
  // Generate gradient colors for bars
  function getBarColor(index, total) {
    const hue = (index / total) * 180 + 180; // Blue to purple gradient
    return `hsl(${hue}, 80%, 60%)`;
  }
  
  // Initialize audio context and analyzer
  const initAudio = () => {
    if (isInitialized) return;
    
    try {
      // Create audio context
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      
      // Connect audio element to analyzer
      source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      // Set up data array for visualization
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      isInitialized = true;
    } catch (e) {
      console.error('Web Audio API is not supported in this browser', e);
    }
  };
  
  // Update visualization
  const updateVisualization = () => {
    if (!isInitialized || !isPlaying) return;
    
    analyser.getByteFrequencyData(dataArray);
    
    const height = visualizerContainer.clientHeight;
    
    // Update each bar with new frequency data
    for (let i = 0; i < Math.min(dataArray.length, barElements.length); i++) {
      const value = dataArray[i];
      const barHeight = (value / 255) * height;
      
      barElements[i]
        .attr('y', height - barHeight)
        .attr('height', barHeight);
    }
    
    animationId = requestAnimationFrame(updateVisualization);
  };
  
  // Format time in MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Update progress bar and time display
  const updateProgress = () => {
    if (!audioElement.duration) return;
    
    const currentTime = audioElement.currentTime;
    const duration = audioElement.duration;
    const progress = (currentTime / duration) * 100;
    
    progressBar.style.width = `${progress}%`;
    currentTimeDisplay.textContent = formatTime(currentTime);
    durationDisplay.textContent = formatTime(duration);
  };
  
  // Event listeners
  playPauseBtn.addEventListener('click', () => {
    if (!isInitialized) {
      initAudio();
    }
    
    if (audioElement.paused) {
      audioElement.play()
        .then(() => {
          playPauseIcon.className = 'fas fa-pause';
          isPlaying = true;
          updateVisualization();
        })
        .catch(error => {
          console.error('Error playing audio:', error);
        });
    } else {
      audioElement.pause();
      playPauseIcon.className = 'fas fa-play';
      isPlaying = false;
      cancelAnimationFrame(animationId);
    }
  });
  
  // Seek functionality
  progressContainer.addEventListener('click', (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioElement.currentTime = percent * audioElement.duration;
  });
  
  // Volume control functionality
  volumeSlider.addEventListener('click', (e) => {
    const rect = volumeSlider.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioElement.volume = Math.max(0, Math.min(1, percent));
    volumeProgress.style.width = `${percent * 100}%`;
    
    // Update volume icon
    updateVolumeIcon();
  });
  
  // Update volume icon based on current volume
  const updateVolumeIcon = () => {
    if (audioElement.volume === 0) {
      volumeIcon.className = 'fas fa-volume-mute';
    } else if (audioElement.volume < 0.5) {
      volumeIcon.className = 'fas fa-volume-down';
    } else {
      volumeIcon.className = 'fas fa-volume-up';
    }
  };
  
  // Mute/unmute toggle
  volumeIcon.addEventListener('click', () => {
    if (audioElement.volume > 0) {
      audioElement.dataset.prevVolume = audioElement.volume;
      audioElement.volume = 0;
      volumeProgress.style.width = '0%';
    } else {
      const prevVolume = parseFloat(audioElement.dataset.prevVolume) || 1;
      audioElement.volume = prevVolume;
      volumeProgress.style.width = `${prevVolume * 100}%`;
    }
    updateVolumeIcon();
  });
  
  // Update audio progress and display
  audioElement.addEventListener('timeupdate', updateProgress);
  
  // Handle metadata loaded (for duration)
  audioElement.addEventListener('loadedmetadata', () => {
    durationDisplay.textContent = formatTime(audioElement.duration);
  });
  
  // Handle audio end
  audioElement.addEventListener('ended', () => {
    playPauseIcon.className = 'fas fa-play';
    isPlaying = false;
    progressBar.style.width = '0%';
    audioElement.currentTime = 0;
    cancelAnimationFrame(animationId);
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (podcastPlayer.classList.contains('active')) {
      d3Setup();
      if (isPlaying) {
        updateVisualization();
      }
    }
  });
  
  // Handle document click to close player when clicking outside
  document.addEventListener('click', (e) => {
    if (podcastPlayer.classList.contains('active') && 
        !podcastPlayer.contains(e.target) && 
        e.target !== podcastTrigger) {
      podcastPlayer.classList.remove('active');
      
      if (isPlaying) {
        // Don't stop playback when clicking outside, just hide the player
        // This allows users to continue listening while browsing the site
      }
    }
  });
  
  // Initial setup
  d3Setup();
  
  // Set initial volume
  audioElement.volume = 0.75;
  volumeProgress.style.width = '75%';
});