document.addEventListener('DOMContentLoaded', () => {
  const textAreasChartsContainer = document.getElementById('text-areas-charts-container');
  let chartData = {}; // Store chart instances and data

  const form = document.getElementById('videoPropertiesForm');


  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Get the input values from the form
    const bpm           = parseFloat(form.bpm.value);
    const framerate     = parseInt(form.framerate.value, 10);
    const length        = parseFloat(form.length.value);
    const highStrength  = parseFloat(form.highstrength.value);
    const lowStrength   = parseFloat(form.lowstrength.value);
    const holdFrames    = parseInt(form.holdframes.value, 10);
    const falloffValue  = parseFloat(form.falloff.value);
    const steepness     = parseFloat(form.steepness.value)

    // Update the scatter chart with the new data
    updateScatterChart(framerate, length, bpm, highStrength, lowStrength, holdFrames, falloffValue, steepness);
  });

    function generateXValues(fps, videoLength) {
      const frameCount = Math.ceil(fps * videoLength);
      return Array.from({ length: frameCount }, (_, index) => index);
    }
    
    let currentHold = 0;

    function generateDataString(fps, videoLength, bpm, highStrength, lowStrength, holdFrames, falloff, power) {
      const xValues = generateXValues(fps, videoLength);
          
      // Calculate the beat intervals based on BPM
      const beatInterval = Math.ceil(fps * (60 / bpm));
    
      // Create an array to store the data pairs (x:y)
      const dataPairs = xValues.map((x, index) => {
        // Calculate the current beat position
        const beatPosition = index % beatInterval;
    
        // Calculate the y-value based on beat position and hold frames
        let maxHold = falloff;
        let y;
        if (beatPosition < holdFrames) {
          y = highStrength;
          currentHold = 0;
        } else {
          if (index >= holdFrames && currentHold < maxHold) {
            const falloffDistance = beatPosition - holdFrames;
            const falloffFactor = highStrength - Math.pow(falloffDistance / falloff, power) * (highStrength - lowStrength);
            currentHold++;
            y = falloffFactor;
          } else {
            y = lowStrength;
          }
        }
    
        return `${x}:(${y.toFixed(2)})`;
      });
    
      // Join the data pairs with commas and create the final data string
      const dataString = dataPairs.join(', ');
      console.log(dataString);
      return dataString;
    }
    
    
    
    
    
    const fps = 15;
    const videoLength = 4;
    const bpm = 150;
    const highStrength = 0.8;
    const lowStrength = 0.15;
    const holdFrames = 3;
    const falloffel = 3;
    const steepness = 0.8;
        
    const dataString = generateDataString(fps, videoLength, bpm, highStrength, lowStrength, holdFrames, falloffel, steepness);
  
    
      // Function to generate data and update the scatter chart
      function updateScatterChart(framerate, length, bpm, highStrength, lowStrength, holdFrames, falloff, power) {
        // Generate the data string based on the input values
        const dataString = generateDataString(framerate, length, bpm, highStrength, lowStrength, holdFrames, falloff, power);
    
        // Parse the data string into an array of objects
        const data = parseData(dataString);
    
        // Check if the scatter chart already exists and update it
        if (chartData.scatter) {
          chartData.scatter.data.datasets[0].data = data;
          chartData.scatter.update();
        } else {
          // Create a new scatter chart
          const scatterCanvas = document.createElement('canvas');
          scatterCanvas.id = 'chart_scatter';
          scatterCanvas.width = 400;
          scatterCanvas.height = 200;
          textAreasChartsContainer.appendChild(scatterCanvas);
    
          const scatterCtx = scatterCanvas.getContext('2d');
    
          const scatterChart = new Chart(scatterCtx, {
            type: 'scatter',
            data: {
              datasets: [
                {
                  label: 'Scatter Data',
                  data: data,
                  borderColor: 'rgba(75, 192, 192, 1)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  showLine: true
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Frame',
                  },
                  type: 'linear',
                  position: 'bottom',
                },
                y: {
                  title: {
                    display: true,
                    text: 'Value',
                  },
                  beginAtZero: true,
                },
              },
            },
          });
    
          chartData.scatter = scatterChart;
        }
      }

  // Function to parse the data input and generate datasets
const parseData = (dataString) => {
  const items = dataString.split(', ');
  const data = [];

  for (const item of items) {
    const [x, y] = item.split(':');
    const parsedX = parseInt(x);
    const parsedY = parseFloat(y.replace(/[()]/g, ''));

    if (!isNaN(parsedX) && isFinite(parsedX)) {
      data.push({ x: parsedX, y: parsedY });
    } else if (parsedX === 0) {
      data.push({ x: parsedX, y: parsedY });
    }
  }

  return data;
}

// Function to calculate the falloff factor based on frame position
function calculateFalloffFactor(currentFrame, totalFrames, falloff) {
  // Use a mathematical function to adjust the falloff
  const x = currentFrame / totalFrames;
  return falloff * Math.sin(x * Math.PI);
}

});