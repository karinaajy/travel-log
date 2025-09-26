const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config();

const middlewares = require('./middlewares');
const logs = require('./api/logs');

const app = express();

// 配置trust proxy - 只信任本地代理
app.set('trust proxy', 1); // trust first proxy

mongoose.connect(process.env.DATABASE_URL);

app.use(morgan('common'));

// CORS配置 - 放在helmet之前
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY'],
}));

// Helmet配置 - 允许跨域资源
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json());

// 静态文件服务 - 提供上传的图片
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({
    message: 'Hello World!',
  });
});

// CORS测试端点
app.get('/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.get('Origin'),
    corsOrigin: process.env.CORS_ORIGIN,
  });
});

// 测试上传目录
app.get('/test-uploads', (req, res) => {
  const fs = require('fs');
  const uploadsPath = path.join(__dirname, '../uploads');
  
  try {
    if (!fs.existsSync(uploadsPath)) {
      return res.json({ error: 'Uploads directory does not exist', path: uploadsPath });
    }
    
    const files = fs.readdirSync(uploadsPath);
    res.json({ 
      uploadsPath,
      files,
      message: `Found ${files.length} files in uploads directory`
    });
  } catch (error) {
    res.json({ error: error.message, path: uploadsPath });
  }
});

app.use('/api/logs', logs);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const port = process.env.PORT || 1337;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening at http://localhost:${port}`);
});
