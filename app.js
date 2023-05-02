const dataContainer = document.getElementById('data-container');

let temperatureChart; // 声明全局变量来存储图表实例
let humidityChart; // 声明全局变量来存储图表实例
let environmentChart; // 声明全局变量来存储图表实例

async function fetchData() {
    try {
      console.log('Fetching data...');
      const response = await fetch('http://localhost:3000/data');
      const data = await response.json();
      console.log('Data received:', data);

      displayData(data);

      const temperatureData = data.data.datastreams.find(stream => stream.id === 'Temperature');
      console.log("tem",temperatureData);
      if (temperatureData) {
        displayTemperatureChart(temperatureData);
      } else {
        tableBody.innerHTML = '<tr><td colspan="2">未找到温度数据。</td></tr>';
      }
      
      const humidityData = data.data.datastreams.find(stream => stream.id === 'Humidity');
      console.log("hum",humidityData);
      if (humidityData) {
        displayHumidityChart(humidityData);
      } else {
        tableBody.innerHTML = '<tr><td colspan="2">未找到湿度数据。</td></tr>';
      }
      
      const lightData = data.data.datastreams.find(stream => stream.id === 'Light');
      const airData = data.data.datastreams.find(stream => stream.id === 'Air');
      console.log("light",lightData);
      console.log("air",airData);
      if (lightData && airData) {
        const environmentData = {
        datapoints: lightData.datapoints.map((point, index) => {
        return {
            at: point.at,
            light: point.value,
            airQuality: airData.datapoints[index].value
            };
          })
         };
         console.log("en",environmentData);
        displayEnvironmentChart(environmentData);
        } else {
        tableBody.innerHTML = '<tr><td colspan="2">未找到环境数据。</td></tr>';
        }


    } catch (error) {
      console.error('Error fetching data:', error);
      tableBody.innerHTML = '<tr><td colspan="2">数据加载失败，请检查您的API密钥和设备ID。</td></tr>';
    }
}

function displayData(data) {
    if (data && data.data && data.data.datastreams) {
        const datastreams = data.data.datastreams;
        const streamOrder = ['Temperature', 'Humidity', 'Air', 'Light', 'Goods'];
        const streamNames = {
            'Temperature': '温度信息',
            'Humidity': '湿度信息',
            'Air': '空气质量信息',
            'Light': '光照信息',
            'Goods': '货物数量'
        };
        let html = '';

        streamOrder.forEach(id => {
            const stream = datastreams.find(stream => stream.id === id);
            if (stream) {
                const name = streamNames[stream.id];
                const value = stream.datapoints[0].value;
                html += `<tr><td>${name}</td><td>${value}</td></tr>`;
            }
    });

        const tableBody = document.querySelector('#data-table tbody');
        tableBody.innerHTML = html;
    } else {
        tableBody.innerHTML = '<p>无法获取数据，请检查您的API密钥和设备ID。</p>';
    }
}

function displayTemperatureChart(temperatureData) {
  const latestData = temperatureData.datapoints.slice(-30); // 获取最新的30个数据点
  const data = latestData.reverse();
  const labels = data.map(point => {
    const date = new Date(point.at);
    return date.getHours() + ':' + ('0' + date.getMinutes()).slice(-2);
  });
  const values = latestData.map(point => point.value);
  const chartOptions = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '仓库温度',
        data: values,
        borderColor:  'rgba(255, 0, 0, 0.5)',
        fill: true
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'minute',
            displayFormats: {
              minute: 'HH:mm'
            }
          },
          gridLines:{
              display:false
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true
          },
          gridLines:{
              display:false
          }
        }]
      }
    }
  };
  if (temperatureChart) {
    temperatureChart.destroy(); // 销毁旧的图表实例
  }
  temperatureChart = new Chart(document.getElementById('temperature-chart'), chartOptions); // 创建新的图表实例
}

function displayHumidityChart(humidityData) {
  const latestData = humidityData.datapoints.slice(-30); // 获取最新的30个数据点
  const data = latestData.reverse();
  const labels = data.map(point => {
    const date = new Date(point.at);
    return date.getHours() + ':' + ('0' + date.getMinutes()).slice(-2);
  });
  const values = latestData.map(point => point.value);
  const chartOptions = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '湿度',
        data: values,
        backgroundColor: 'rgba(0, 128, 255, 0.5)',
        fill: true
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'minute',
            displayFormats: {
              minute: 'HH:mm'
            }
          },
          gridLines:{
              display:false
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true
          },
          gridLines:{
              display:false
          }
        }]
      }
    }
  };
  if (humidityChart) {
    humidityChart.destroy(); // 销毁旧的图表实例
  }
  humidityChart = new Chart(document.getElementById('humidity-chart'), chartOptions); // 创建新的图表实例
}

function displayEnvironmentChart(environmentData) {
  const latestData = environmentData.datapoints.slice(-30); // 获取最新的30个数据点
  const data = latestData.reverse();
  const labels = data.map(point => {
    const date = new Date(point.at);
    return date.getHours() + ':' + ('0' + date.getMinutes()).slice(-2);
  });
  const lightData = environmentData.datapoints.map(point => point.light);
  const airQualityData = environmentData.datapoints.map(point => point.airQuality);
  const chartOptions = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '光照信息',
        data: lightData,
        borderColor: 'rgba(255, 255, 0, 0.5)', // 设置光照信息的颜色为黄色
        fill: true
      }, {
        label: '空气质量信息',
        data: airQualityData,
        borderColor: 'rgba(0, 128, 0, 0.5)', // 设置空气质量信息的颜色为绿色
        fill: false
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'minute',
            displayFormats: {
              minute: 'HH:mm'
            }
          },
          gridLines:{
              display:false
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true
          },
          gridLines:{
              display:false
          }
        }]
      }
    }
  };
  if (environmentChart) {
    environmentChart.destroy(); // 销毁旧的图表实例
  }
  environmentChart = new Chart(document.getElementById('environment-chart'), chartOptions); // 创建新的图表实例
}


function toggleLock() {
  var lockImg = document.getElementById("lock-img");
  var isOn = lockImg.getAttribute("data-on");
  var isOff = lockImg.getAttribute("data-off");
  if (lockImg.src.includes(isOn)) {
    lockImg.src = isOff;
    var statusText = lockImg.nextElementSibling;
    statusText.textContent = "关闭";
    statusText.classList.remove("on-text");
  } else {
    lockImg.src = isOn;
    var statusText = lockImg.nextElementSibling;
    statusText.textContent = "开启";
    statusText.classList.add("on-text");
  }
}

function toggleHumidifier() {
  var humidifierImg = document.getElementById("humidifier-img");
  var isOn = humidifierImg.getAttribute("data-on");
  var isOff = humidifierImg.getAttribute("data-off");
  if (humidifierImg.src.includes(isOn)) {
    humidifierImg.src = isOff;
    var statusText = humidifierImg.nextElementSibling;
    statusText.textContent = "关闭";
    statusText.classList.remove("on-text");
  } else {
    humidifierImg.src = isOn;
    var statusText = humidifierImg.nextElementSibling;
    statusText.textContent = "开启";
    statusText.classList.add("on-text");
  }
}

async function toggleFan() {
  const response = await fetch('/control/Fan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      value: true // 或者 false，表示设备的开关状态
    })
  });
  const fanStatus = await response.json();
  const fanIcon = document.querySelector('#fan-icon');
  const fanStatusText = document.querySelector('#fan-status');

  if (fanStatus.isOn) {
    fanIcon.src = fanIcon.dataset.on;
    fanStatusText.textContent = '开启';
  } else {
    fanIcon.src = fanIcon.dataset.off;
    fanStatusText.textContent = '关闭';
  }
}

window.onload = async function() {
  const fanControlButton = document.querySelector("#fan-btn");
  const fanStatusIcon = document.querySelector("#fan-status");
  const fanStatusText = document.querySelector("#fan-status-text");

  // 定义初始状态变量
  let fanStatus = false;

  // 从服务器获取初始状态
  const fanStatusData = await getDeviceStatus('Fan');
  fanStatus = fanStatusData.current_value;
  updateStatus('Fan', fanStatus);

  fanControlButton.addEventListener('click', async () => {
    const newFanStatus = !fanStatus;
    // 更改图标状态
    updateStatus('Fan', newFanStatus);
    // 将更改上传到服务器的数据流
    await updateDeviceStatus('Fan', newFanStatus);
    // 更新当前状态变量
    fanStatus = newFanStatus;
  });

  async function getDeviceStatus(deviceName) {
    try {
      const response = await fetch(`http://localhost:3000/data/${deviceName}`);
      const status = await response.json();
      return status;
    } catch (error) {
      console.error(error);
    }
  }

  async function updateDeviceStatus(deviceName, value) {
    try {
      const response = await fetch(`http://localhost:3000/control/${deviceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value: value
        })
      });
      const status = await response.json();
      return status;
    } catch (error) {
      console.error(error);
    }
  }

  function updateStatus(deviceName, value) {
    // 更改图标状态
    if (deviceName === 'Fan') {
      fanStatus = value;
      if (value) {
        fanStatusIcon.classList.remove('fa-stop');
        fanStatusIcon.classList.add('fa-play');
        fanStatusIcon.style.color = 'green';
        if (fanStatusText) {
          fanStatusText.innerText = 'Fan is on';
        }
      } else {
        fanStatusIcon.classList.remove('fa-play');
        fanStatusIcon.classList.add('fa-stop');
        fanStatusIcon.style.color = 'red';
        if (fanStatusText) {
          fanStatusText.innerText = 'Fan is off';
        }
      }
    }
  }
}







fetchData();
setInterval(fetchData, 10000);
 