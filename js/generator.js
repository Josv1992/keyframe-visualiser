document.addEventListener('DOMContentLoaded', () => {
  const textAreasChartsContainer = document.getElementById('text-areas-charts-container');
  let previewChartData = [];
  let chartData = []; // Store chart instances and data
  let chartDataString = '';
  let currentChartDataString = ''; // Store individual data strings
  let currentXValue = 0;
  let amountOfDataSets = 0;
  let allChartsDataString = '';
  let currentXValueNew = 0;

  const form = document.getElementById('videoPropertiesForm');
  
  // TODO: Refactor: Dingen die dubbelop zijn verwijderen, vereenvoudigen.
  // TODO: Graph editable maken (Kan het beste als je er een class van hebt gemaakt, die class instance aanpassen)

  // TODO: komma voor de data na verwijderen
  // TODO: Bug na verwijderen alle graphs fixen
  const allDataSets = [];

  class dataSet {
    constructor(name, fps, duration, bpm, highStrength, lowStrength, holdFrames, falloffLength, falloffCurve) {
      this.name = name;
      this.fps = fps;
      this.duration = duration;
      this.bpm = bpm;
      this.highStrength = highStrength;
      this.lowStrength = lowStrength;
      this.holdFrames = holdFrames;
      this.falloffLength = falloffLength;
      this.falloffCurve = falloffCurve;
      this.sortOrder = this.sortValue();
    }

    sortValue() {
      return amountOfDataSets;
    }
  }
  
  document.getElementById('add').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentChartDataString !== '') {
      if (amountOfDataSets >= 1) {
        chartDataString = updatedDataString(chartDataString, currentChartDataString);
      }
      
      chartData.push({ data: currentChartDataString, startValue: currentXValue }); // Store data and start x value

      const graphName = form.name.value;
      addGraphDiv(graphName, { data: currentChartDataString, startValue: currentXValue });

      // Increment the current x value for the next graph
      currentXValue += parseData(currentChartDataString).length;
      renderFullGraph();

          // Get the input values from the form
      const bpm           = parseFloat(form.bpm.value);
      const framerate     = parseInt(form.framerate.value, 10);
      const length        = parseFloat(form.length.value);
      const highStrength  = parseFloat(form.highstrength.value);
      const lowStrength   = parseFloat(form.lowstrength.value);
      const holdFrames    = parseInt(form.holdframes.value, 10);
      const falloffValue  = parseFloat(form.falloff.value);
      const steepness     = parseFloat(form.steepness.value)
      
      allDataSets.push(new dataSet(graphName, framerate, length, bpm, highStrength, lowStrength, holdFrames, falloffValue, steepness));
      renderFullGraphNew();

      form.name.value = "Graph " + (chartData.length + 1);
      amountOfDataSets++;
    }
  });

  const renderFullGraphNew = () => {
    allChartsDataString = '';
    console.log(allDataSets);

    // Sort the allDataSets array by sortOrder
    allDataSets.sort((a, b) => a.sortOrder - b.sortOrder);
    
    convertDataSetsToChartData(allDataSets);
    console.log(allChartsDataString);
  }
  
  const convertDataSetsToChartData = (dataSetsInput) => {
    dataSetsInput.forEach((dataSet) => {
      addToDataString(dataSet);
      // TODO: kijken naar je oude functies, dat herhalen, en data toevoegen aan één lange string
    });
    // TODO: komma ervoor, op eerste dataSet na
  }

  const addToDataString = (dataSet) => {
    const xValues = generateXValuesNew(dataSet.fps, dataSet.duration, currentXValueNew);
        
    // Calculate the beat intervals based on BPM
    const beatInterval = Math.ceil(dataSet.fps * (60 / dataSet.bpm));
  
    // Create an array to store the data pairs (x:y)
    const dataPairs = xValues.map((x, index) => {
      // Calculate the current beat position
      const beatPosition = index % beatInterval;
  
      // Calculate the y-value based on beat position and hold frames
      let maxHold = dataSet.falloffLength;
      let y;
      if (beatPosition < dataSet.holdFrames) {
        y = dataSet.highStrength;
        currentHold = 0;
      } else {
        if (index >= dataSet.holdFrames && currentHold < maxHold) {
          const falloffDistance = beatPosition - dataSet.holdFrames;
          const falloffFactor = dataSet.highStrength - Math.pow(falloffDistance / dataSet.falloffLength, dataSet.falloffCurve) * (dataSet.highStrength - dataSet.lowStrength);
          currentHold++;
          y = falloffFactor;
        } else {
          y = dataSet.lowStrength;
        }
      }
  
      return `${x}:(${y.toFixed(2)})`;
    });

    // TODO: X values hier optellen??? Dan moet het geen addToDataString meer heten maar iets anders
    allChartsDataString += dataPairs.join(', ');

    // Join the data pairs with commas and create the final data string
    // return dataPairs.join(', ');
  }

  function generateXValuesNew(fps, videoLength, startValue) {
    console.log(startValue);
    const frameCount = Math.ceil(fps * videoLength);
    return Array.from({ length: frameCount }, (_, index) => index + startValue);
  }

  
  function updatedDataString(firstString, secondString) {
    const items = firstString.split(', ');
    const splitSecondString = secondString.split(', ');
    let lastX = parseInt(items[items.length -1].split(':')) + 1;
    let updatedSecondString = '';

    for (const [i, item] of splitSecondString.entries()) {
      const [x, y] = item.split(':'); // "Uitpakken"
      const updatedX = parseInt(x) + lastX; // "Toevoegen"
      
      if (i !== splitSecondString.length - 1) {
        updatedSecondString += (updatedX + ':' + y + ', ');
      } else {
        updatedSecondString += (updatedX + ':' + y);
      }
    }
    
    return firstString + ', ' + updatedSecondString;
  }

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
      return dataPairs.join(', ');
    }
    
  // Function to generate data and update the scatter chart
  function updateScatterChart(framerate, length, bpm, highStrength, lowStrength, holdFrames, falloff, power, name) {
    // Generate the data string based on the input values
    const dataString = generateDataString(framerate, length, bpm, highStrength, lowStrength, holdFrames, falloff, power);

    if (amountOfDataSets < 1) {
      chartDataString = dataString;
    }

    currentChartDataString = dataString;

    // Parse the data string into an array of objects
    const data = parseData(dataString);

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

  function renderFullGraph() {
    // parse data string for chart
    console.log(typeof chartDataString, chartDataString);
    let combinedData = parseData(chartDataString);

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
    if (typeof data === 'object') {
      const formattedData = data.reduce((result, { x, y }) => {
        if (!result[x]) {
            result[x] = [];
        }
        result[x].push(y);
        return result;
      }, {});

      const output = Object.entries(formattedData).map(([x, ys]) => `${x}:(${ys.join(', ')})`).join(', ');
      document.getElementById('updatedData').value = output;

    } else {
      document.getElementById('updatedData').value = data;
    }
  }

  // Function to parse the data input and generate datasets
  const parseData = (dataString) => {
    if (dataString !== '') {
      const items = dataString.split(', ');
      const data = [];

      console.log(items);

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
      
      } else {
      return dataString;
    }
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

    convertAfterSort();
    renderFullGraph();
  }

  let currentX = 0;


  function convertAfterSort() {
    let sortedDataString = '';
    const graphDivs = graphsContainer.querySelectorAll('.graph-button');
    currentX = 0;

    for (let i = 0; i < graphDivs.length; i++) {
      sortedDataString += updateDataStringXValues(currentX, graphDivs[i].dataset.chartData);
      currentX = updateDataStringXValues(currentX, graphDivs[i].dataset.chartData)[1];
    }

    if (graphDivs.length > 0) {
      chartDataString = sortedDataString;
      currentXValue = chartDataString.split(', ').length;
      console.log(currentXValue);
    } else {
      chartDataString = '';
      currentXValue = 0;
    }
  }

  function updateDataStringXValues(xValue, inputData) {
    const items = inputData.split(', ');
    let updatedDataString = '';

    for (const [i, item] of items.entries()) {
      const [x, y] = item.split(':'); // "Uitpakken"

      if (i !== items.length - 1) {
        updatedDataString += (currentX + ':' + y + ', ');
      } else {
        updatedDataString += (currentX + ':' + y);
      }
      
      currentX++;
    }

    // TODO updated currentX;
    return [updatedDataString, xValue];
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
    graphDiv.dataset.chartData = chartData.data;
    graphDiv.dataset.startValue = chartData.startValue;

    // Enable drag-and-drop functionality
    if (!sortable) {
      sortable = new Sortable(graphsContainer, {
        handle: '.drag-handle',
        onUpdate: () => {
          // Update the order of chartData based on the new order of graph divs
          chartData = Array.from(graphsContainer.children).map((graphDiv) =>
              JSON.parse(graphDiv.dataset.chartData)
          );
          renderFullGraph(); // TODO: Weg?
        },
      });
    }
  }

  function createGraphDiv(graphName) {
    const graphDiv = document.createElement('div');
    graphDiv.className = 'graph-button';
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
    
    // Add the Remove Button
    const removeButton = document.createElement('div');
    removeButton.classList.add('remove-button');
    removeButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
        <line x1="1" y1="1" x2="11" y2="11" stroke="#aaa" stroke-width="2"/>
        <line x1="1" y1="11" x2="11" y2="1" stroke="#aaa" stroke-width="2"/>
      </svg>
    `;
    removeButton.addEventListener('click', () => {
      removeGraphDiv(graphDiv);
    });
    graphDiv.appendChild(removeButton);

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
  
  function removeGraphDiv(graphButtonDiv) {
    graphButtonDiv.remove();
    reSortData();
  }
});