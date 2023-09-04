document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('videoPropertiesForm');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const bpm = parseFloat(form.bpm.value);
        const framerate = parseInt(form.framerate.value, 10);
        const length = parseFloat(form.length.value);
        const highStrength = parseFloat(form.highStrength.value);
        const lowStrength = parseFloat(form.lowStrength.value);
        const holdFrames = parseInt(form.holdFrames.value, 10);

        // You can use the values (bpm, framerate, length) for further processing here
        console.log('BPM:', bpm);
        console.log('Framerate:', framerate);
        console.log('Length (seconds):', length);

        // Add your logic to handle the form data as needed
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
    
    
   
    // Example usage:
    const fps = 15; // Replace with the user's input for FPS
    const videoLength = 4; // Replace with the user's input for Video Length (seconds)
    const bpm = 150; // Replace with the user's input for BPM
    const highStrength = 0.8; // Replace with the user's input for High Strength
    const lowStrength = 0.15; // Replace with the user's input for Low Strength
    const holdFrames = 3; // Replace with the user's input for Hold Frames
        
    const dataString = generateDataString(fps, videoLength, bpm, highStrength, lowStrength, holdFrames);
    console.log(dataString);    
    

  });
  