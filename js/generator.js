document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('videoPropertiesForm');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const bpm = parseFloat(form.bpm.value);
        const framerate = parseInt(form.framerate.value, 10);
        const length = parseFloat(form.length.value);
        const highStrength = parseFloat(form.highstrength.value);
        const lowStrength = parseFloat(form.lowstrength.value);
        const holdFrames = parseInt(form.holdframes.value, 10);

        const dataString = generateDataString(framerate, length, bpm, highStrength, lowStrength, holdFrames);
        console.log(dataString);
    });

    function generateXValues(fps, videoLength) {
      const frameCount = Math.ceil(fps * videoLength);
      return Array.from({ length: frameCount }, (_, index) => index);
    }
    
    function generateDataString(fps, videoLength, bpm, highStrength, lowStrength, holdFrames) {
      const xValues = generateXValues(fps, videoLength);
    
      // Calculate the beat intervals based on BPM
      const beatInterval = Math.ceil(fps * (60 / bpm));
    
      // Create an array to store the data pairs (x:y)
      const dataPairs = xValues.map((x, index) => {
        // Calculate the current beat position
        const beatPosition = index % beatInterval;
    
        // Calculate the y-value based on beat position and hold frames
        let y;
        if (beatPosition < holdFrames) {
          y = highStrength;
        } else {
          y = lowStrength;
        }
    
        return `${x}:(${y.toFixed(2)})`;
      });
    
      // Join the data pairs with commas and create the final data string
      const dataString = dataPairs.join(', ');
    
      return dataString;
    }
    
    
    const fps = 15;
    const videoLength = 4;
    const bpm = 150;
    const highStrength = 0.8;
    const lowStrength = 0.15;
    const holdFrames = 3;
        
    const dataString = generateDataString(fps, videoLength, bpm, highStrength, lowStrength, holdFrames);
    console.log(dataString);    
    

  });
  