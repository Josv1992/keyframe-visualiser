document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('videoPropertiesForm');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const bpm = parseFloat(form.bpm.value);
        const framerate = parseInt(form.framerate.value, 10);
        const length = parseFloat(form.length.value);

        // You can use the values (bpm, framerate, length) for further processing here
        console.log('BPM:', bpm);
        console.log('Framerate:', framerate);
        console.log('Length (seconds):', length);

        // Add your logic to handle the form data as needed
    });

    const keys = ['strength_schedule', 'test_data'];
    const textAreasChartsContainer = document.getElementById('text-areas-charts-container');
    const updatedDataElement = document.getElementById('updatedData');
    let chartData = {}; // Store chart instances and data
    const chartDivs = {}; // Store references to chart divs
      const framerate = 15;
  
      let accumulatedChanges = {}; // Initialize an object to store accumulated changes
  
  
      const saveSettings = (datasetIndex, value, key) => {
          // Check if chartData[key] exists
          if (chartData.hasOwnProperty(key)) {
              const chart = chartData[key]; // Get the specific chart
              const updatedData = [...chart.data.datasets[datasetIndex].data]; // Clone the data array
      
              // Extract the x and y values from the value object
              const { x, y } = value;
      
              // Find the index of the x-value in the data array
              const xIndex = updatedData.findIndex((point) => point.x === x);
      
              if (xIndex !== -1) {
                  // Update the y-value at the corresponding x-index
                  updatedData[xIndex].y = parseFloat(y.toFixed(2));
  
                  // Store the accumulated change
                  accumulatedChanges[key] = accumulatedChanges[key] || {};
                  accumulatedChanges[key][x] = parseFloat(y.toFixed(2));
  
                  // Update the chart data and re-render the chart
                  chart.data.datasets[datasetIndex].data = updatedData;
                  chart.update();
      
                  fetchAndUpdateData();
  
              } else {
                  console.error(`x value ${x} not found in data.`);
              }
          } else {
              console.error(`chartData[${key}] does not exist.`);
          }
      }
  
      // Function to fetch and update the original data
      function fetchAndUpdateData() {
          fetch('data/settings.txt') // Adjust the path as needed
              .then((response) => response.text())
              .then((dataString) => {
                  // Apply all accumulated changes to the data string
                  Object.keys(accumulatedChanges).forEach((key) => {
                      const changes = accumulatedChanges[key];
                      Object.keys(changes).forEach((x) => {
                          dataString = updateDataString(dataString, x, changes[x]);
                      });
                  });
      
                  // Display the updated data in the HTML element
                  updatedDataElement.textContent = dataString;
              })
              .catch((error) => {
                  console.error('Error loading data:', error);
              });
      }
      
      
  
    const updateDataString = (dataString, index, newValue) => {
      const regex = new RegExp(`${index}:[^,]+`);
      return dataString.replace(regex, `${index}:(${newValue.toFixed(2)})`);
    }
  
    // Function to create or update a chart for a specific key
      const createOrUpdateChart = (key, data) => {
          const existingCanvas = document.getElementById(`chart_${key}`);
      
          if (existingCanvas) {
              // If the canvas exists, remove it
              existingCanvas.remove();
          }
      
          // Create a new canvas
          const chartDiv = document.createElement('div');
          chartDiv.id = `chart-div_${key}`; // Set the chart div ID based on the key
          chartDiv.classList.add('chart-container');
          textAreasChartsContainer.appendChild(chartDiv);
      
          const canvas = document.createElement('canvas');
          canvas.id = `chart_${key}`; // Set the canvas ID based on the key
          canvas.width = 400;
          canvas.height = 200;
          chartDiv.appendChild(canvas);
      
          chartDivs[key] = chartDiv; // Store the reference to the chart div
      
          const ctx = canvas.getContext('2d');
      
          const xValues = data.map((point) => point.x); // Extract x-values from your data
          const xLabels = data.map((point, index) => calculateTimestamp(index, framerate));
          const chart = new Chart(ctx, {
              type: 'scatter',
              data: {
                  labels: xLabels,
                  datasets: [
                      {
                          label: key.replace(/_/g, ' '), // Convert underscores to spaces for labels
                          data: data,
                          borderColor: getRandomColor(), // Generate a random color for each dataset
                          borderWidth: 2,
                          fill: false,
                          showLine: true
                      },
                  ],
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                      dragData: {
                          showTooltip: true, // Display a tooltip when dragging
                          round: 10, // Round the dragged data points to a specified number of decimal places (0 for integers)
                          dragX: false, // Disable dragging on the X-axis
                          onDragEnd: (event, datasetIndex, index, value) => {
                              saveSettings(datasetIndex, value, key);
                          },
                      },
                  },
                  scales: {
                      x: {
                          title: {
                              display: true,
                              text: 'Frame',
                          },
                          type: 'linear', // Specify the x-axis as linear
                          position: 'bottom', // Place the x-axis at the bottom
                      },
                      y: {
                          title: {
                              display: true,
                              text: 'Value',
                          },
                      },
                  },
              },
          });
      
          chartData[key] = chart; // Store the chart instance
      }
      
    // Function to load data from the 'data/settings.txt' file
  // Function to load data from the 'data/settings.txt' file
  const loadDataFromFile = keys => {
    fetch('data/settings.txt') // Adjust the path as needed
      .then((response) => response.json()) // Parse the JSON data
      .then((jsonData) => {
        keys.forEach((key) => {
          if (jsonData[key]) {
            createOrUpdateChart(key, parseData(jsonData[key]));
          }
        });
      })
      .catch((error) => {
        console.error('Error loading data:', error);
      });
  }
  
  
    // Function to generate a random color
    const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
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
  
  // Function to calculate timestamp in the format "minutes:seconds:milliseconds" based on frame rate
  function calculateTimestamp(frameIndex, framerate) {
    const totalSeconds = frameIndex / framerate;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((totalSeconds * 1000) % 1000);
  
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    const formattedMilliseconds = milliseconds.toString().padStart(3, '0');
  
    return `${formattedMinutes}:${formattedSeconds}:${formattedMilliseconds}`;
  }
  
  
    // Load data from the file for the specified keys
    loadDataFromFile(keys);
  });
  