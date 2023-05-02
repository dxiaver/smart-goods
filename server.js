const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:3000', 'http://localhost:3000/data','http://localhost:3000/data/Fan']
}));

const apiKey = 'AFnxOexiKUF7=0vhhxndjDcJJEI=';
const deviceId = '976052800';

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    console.log(`${req.method} ${req.url}`);
    next();
});

// 提供静态资源
app.use(express.static('public'));

app.get('/data', async (req, res) => {
    try {
        const headers = {
            'api-key': apiKey
        };
        const response = await axios.get(`https://api.heclouds.com/devices/${deviceId}/datapoints?limit=500`, { headers });
        const data = response.data;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// 解析请求体中的 JSON 数据
app.use(bodyParser.json());

// 处理获取设备状态的请求
app.get('/data/:deviceName', async (req, res) => {
  try {
    const deviceName = req.params.deviceName;
    const headers = {
      'api-key': apiKey
    };
    const response = await axios.get(`https://api.heclouds.com/devices/${deviceId}/datastreams/${deviceName}`, { headers });
    const data = response.data;
    console.log('fandata',data);
    res.json(data.current_value);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// 处理控制设备的请求
app.post('/control/:deviceName', async (req, res) => {
  try {
    const deviceName = req.params.deviceName;
    const value = req.body.value;
    const headers = {
      'api-key': apiKey,
      'Content-Type': 'application/json'
    };
    const response = await axios.post(`https://api.heclouds.com/devices/${deviceId}/datapoints`, {
      datastreams: [
        {
          id: deviceName,
          datapoints: [
            {
              value: value
            }
          ]
        }
      ]
    }, { headers });
    const data = response.data;
    res.json(data.data.datastreams[0].datapoints[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// 发送请求到服务器控制设备
async function controlDevice(deviceName, value) {
    try {
        const headers = {
            'api-key': apiKey,
            'Content-Type': 'application/json'
        };
        const response = await axios.post(`https://api.heclouds.com/cmds?device_id=${deviceId}`,
            JSON.stringify({
                [deviceName]: value
            }),
            { headers }
        );
        return response.data;
    } catch (error) {
        console.error(error);
    }
}



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});