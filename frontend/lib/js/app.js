document.addEventListener("DOMContentLoaded", () => {
  const song = document.querySelector(".song");
  const playButton = document.querySelector(".play-btn");
  const replayButton = document.querySelector(".replay-btn");
  const timeDisplay = document.querySelector(".time-display");
  const timeSelectButtons = document.querySelectorAll(".time-select button");
  const soundButtons = document.querySelectorAll(".sound-picker button");
  const video = document.querySelector(".bg-video");
  
  let fakeDuration = 120; // Default duration

  // Play & Pause button logic
  playButton.addEventListener("click", () => {
      if (song.paused) {
          song.play();
          video.play();
          playButton.innerHTML = '<img src="./lib/svg/pause.svg" alt="Pause">';
      } else {
          song.pause();
          video.pause();
          playButton.innerHTML = '<img src="./lib/svg/play.svg" alt="Play">';
      }
  });

  // Time selection logic
  timeSelectButtons.forEach(button => {
      button.addEventListener("click", function () {
          fakeDuration = this.getAttribute("data-time");
          resetTimer();
      });
  });

  // Sound selection logic
  soundButtons.forEach(button => {
      button.addEventListener("click", function () {
          let sound = this.getAttribute("data-sound");
          let videoSrc = this.getAttribute("data-video");

          song.src = sound;
          video.src = videoSrc;

          resetTimer();
      });
  });

  // Update time display
  song.ontimeupdate = () => {
      let currentTime = song.currentTime;
      let remainingTime = fakeDuration - currentTime;
      let minutes = Math.floor(remainingTime / 60);
      let seconds = Math.floor(remainingTime % 60);

      if (seconds < 10) seconds = "0" + seconds;
      timeDisplay.textContent = `${minutes}:${seconds}`;

      if (currentTime >= fakeDuration) {
          song.pause();
          song.currentTime = 0;
          video.pause();
          playButton.innerHTML = '<img src="./lib/svg/play.svg" alt="Play">';
      }
  };

  // Replay button logic
  replayButton.addEventListener("click", () => {
      resetTimer();
  });

  function resetTimer() {
      song.pause();
      song.currentTime = 0;
      video.pause();
      playButton.innerHTML = '<img src="./lib/svg/play.svg" alt="Play">';
      timeDisplay.textContent = "0:00";
  }
});
