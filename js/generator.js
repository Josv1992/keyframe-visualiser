document.addEventListener('DOMContentLoaded', () => {
  const textAreasChartsContainer = document.getElementById('text-areas-charts-container');
  let chartData = []; // Store chart instances and data
  let currentChartDataString = ''; // Store individual data strings
  let currentXValue = 0;

  const form = document.getElementById('videoPropertiesForm');

  document.getElementById('add').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentChartDataString !== '') {
      chartData.push({ data: currentChartDataString, startValue: currentXValue }); // Store data and start x value
      
      // Increment the current x value for the next graph
      currentXValue += parseData(currentChartDataString).length;
      renderFullGraph();
    }
  });

  document.getElementById('calculate').addEventListener('click', (e) => {
    e.preventDefault();

    // Get the input values from the form
    const graphName     = form.name.value;
    const bpm           = parseFloat(form.bpm.value);
    const framerate     = parseInt(form.framerate.value, 10);
    const length        = parseFloat(form.length.value);
    const highStrength  = parseFloat(form.highstrength.value);
    const lowStrength   = parseFloat(form.lowstrength.value);
    const holdFrames    = parseInt(form.holdframes.value, 10);
    const falloffValue  = parseFloat(form.falloff.value);
    const steepness     = parseFloat(form.steepness.value)

    // Update the scatter chart with the new data
    updateScatterChart(framerate, length, bpm, highStrength, lowStrength, holdFrames, falloffValue, steepness, graphName);
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
    
  // Function to generate data and update the scatter chart
  function updateScatterChart(framerate, length, bpm, highStrength, lowStrength, holdFrames, falloff, power, name) {
    // Generate the data string based on the input values
    const dataString = generateDataString(framerate, length, bpm, highStrength, lowStrength, holdFrames, falloff, power);

    currentChartDataString += dataString;

    // Parse the data string into an array of objects
    const data = parseData(dataString);
    document.getElementById('previewGraphName').innerText = name;

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

  function renderFullGraph() {
    // Combine all datasets in chartData array
    const combinedData = chartData.reduce((result, { data, startValue }) => {
      const parsedData = parseData(data);
      // Offset the x values based on the startValue
      const adjustedData = parsedData.map(({ x, y }) => ({ x: x + startValue, y }));
      result.push(...adjustedData);
      return result;
    }, []);

    // Check if the scatter chart already exists and update it
    const completeChartContainer = document.getElementById('complete-chart-container');
    completeChartContainer.innerHTML = ''; // Clear the container before rendering

    // Create a new scatter chart in the complete-chart-container
    const scatterCanvas = document.createElement('canvas');
    scatterCanvas.id = 'chart_scatter';
    scatterCanvas.width = 400;
    scatterCanvas.height = 200;
    completeChartContainer.appendChild(scatterCanvas);

    const scatterCtx = scatterCanvas.getContext('2d');

    const scatterChart = new Chart(scatterCtx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Scatter Data',
            data: combinedData,
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
});