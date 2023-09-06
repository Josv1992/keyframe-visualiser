document.addEventListener('DOMContentLoaded', () => {
  const textAreasChartsContainer = document.getElementById('text-areas-charts-container');
  let previewChartData = [];
  let chartData = []; // Store chart instances and data
  let currentChartDataString = ''; // Store individual data strings
  let currentXValue = 0;

  // TODO: chartData moet puur en alleen chart data zijn, geen scatter aan toevoegen
  // TODO: Verder nog meer checken of je geen 'datatypes' verandert

  const form = document.getElementById('videoPropertiesForm');

  document.getElementById('add').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentChartDataString !== '') {
      chartData.push({ data: currentChartDataString, startValue: currentXValue }); // Store data and start x value

      const graphName = form.name.value;
      addGraphDiv(graphName, { data: currentChartDataString, startValue: currentXValue });

      // Increment the current x value for the next graph
      currentXValue += parseData(currentChartDataString).length;
      console.log(chartData);
      renderFullGraph(true);

      form.name.value = "Graph " + (chartData.length + 1);
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

      console.log(dataPairs.join(', '));

      // Join the data pairs with commas and create the final data string
      return dataPairs.join(', ');
    }
    
  // Function to generate data and update the scatter chart
  function updateScatterChart(framerate, length, bpm, highStrength, lowStrength, holdFrames, falloff, power, name) {
    // Generate the data string based on the input values
    const dataString = generateDataString(framerate, length, bpm, highStrength, lowStrength, holdFrames, falloff, power);

    currentChartDataString = dataString;
    console.log(currentChartDataString);

    // Parse the data string into an array of objects
    const data = parseData(dataString);
    console.log(data);

    document.getElementById('previewGraphName').innerText = name;

    // Check if the scatter chart already exists and update it
    if (previewChartData.scatter) {
      previewChartData.scatter.data.datasets[0].data = data;
      previewChartData.scatter.update();
    } else {
      // Create a new scatter chart
      const scatterCanvas = document.createElement('canvas');
      scatterCanvas.id = 'chart_scatter';
      scatterCanvas.width = 400;
      scatterCanvas.height = 200;
      textAreasChartsContainer.appendChild(scatterCanvas);

      const scatterCtx = scatterCanvas.getContext('2d');

      previewChartData.scatter = new Chart(scatterCtx, {
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
    }
  }

  function renderFullGraph(isDataString) {
    // Combine all datasets in chartData array
    let combinedData;

    if (isDataString === true) {
      combinedData = chartData.reduce((result, { data, startValue }) => {
        const parsedData = parseData(data);
        // Offset the x values based on the startValue
        const adjustedData = parsedData.map(({ x, y }) => ({ x: x + startValue, y }));
        result.push(...adjustedData);
        // console.log(result);
        return result;
      }, []);
    } else {
      combinedData = chartData;
    }

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

    chartData.scatter = new Chart(scatterCtx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Scatter Data',
            data: combinedData,
            borderColor: 'rgb(79,192,75)',
            backgroundColor: 'rgba(75,192,94,0.2)',
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

    writeDataString(combinedData);
  }

  const writeDataString = (data) => {
    const formattedData = data.reduce((result, { x, y }) => {
      if (!result[x]) {
          result[x] = [];
      }
      result[x].push(y);
      return result;
    }, {});

    const output = Object.entries(formattedData).map(([x, ys]) => `${x}:(${ys.join(', ')})`).join(', ');

    document.getElementById('updatedData').value = output;
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

  const graphsContainer = document.getElementById('graphsContainer');
  let sortable;
  let draggingGraph = null;

  function reSortData() {
    chartData = [];

    const graphDivs = graphsContainer.querySelectorAll('div');

    for (let i = 0; i < graphDivs.length; i++) {
      chartData.push(graphDivs[i].getAttribute('data-chart-data'));
    }
    chartData = transformData(chartData);

    renderFullGraph(false);
  }

// Function to transform the input data
function transformData(input) {
  const transformedData = [];

  let currentX = 0; // Initialize the currentX

  input.forEach((str) => {
      const values = str.match(/(\d+):\(([\d.]+)\)/g);

      if (values) {
          values.forEach((val) => {
              const match = val.match(/(\d+):\((([\d.]+))\)/);
              if (match) {
                  const x = currentX;
                  const y = parseFloat(match[3]);
                  transformedData.push({ x, y });
                  currentX++; // Increment currentX for the next value
              }
          });
      }
  });

  return transformedData;
}

  // Create and add a new graph div to the list
  function addGraphDiv(graphName, chartData) {
    const graphDiv = createGraphDiv(graphName);
    graphsContainer.appendChild(graphDiv);

    // Add chartData to the graphDiv
    graphDiv.dataset.chartData = JSON.stringify(chartData.data);
    graphDiv.dataset.startValue = JSON.stringify(chartData.startValue);

    // Enable drag-and-drop functionality
    if (!sortable) {
      sortable = new Sortable(graphsContainer, {
        handle: '.drag-handle',
        onUpdate: () => {
          // Update the order of chartData based on the new order of graph divs
          chartData = Array.from(graphsContainer.children).map((graphDiv) =>
              JSON.parse(graphDiv.dataset.chartData)
          );
          renderFullGraph(true); // TODO: Weg?
        },
      });
    }
  }

  function createGraphDiv(graphName) {
    const graphDiv = document.createElement('div');
    graphDiv.className = 'graph';
    graphDiv.textContent = graphName;
    graphDiv.draggable = true;

    graphDiv.addEventListener('dragstart', (e) => {
      draggingGraph = e.target;
      e.dataTransfer.setData('text/plain', ''); // Required for Firefox
      e.dataTransfer.effectAllowed = 'move';
      e.target.classList.add('dragging');
    });

    graphDiv.addEventListener('dragend', (e) => {
      e.preventDefault();
      draggingGraph = null;
      reSortData();
      e.target.classList.remove('dragging');
    });

    return graphDiv;
  }

  graphsContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(graphsContainer, e.clientY);
    const graphDiv = draggingGraph;

    if (afterElement == null) {
      graphsContainer.appendChild(graphDiv);
    } else {
      graphsContainer.insertBefore(graphDiv, afterElement);
    }
  });

  function getDragAfterElement(container, y) {
    const graphDivs = [...container.querySelectorAll('.graph:not(.dragging)')];
    return graphDivs.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
});