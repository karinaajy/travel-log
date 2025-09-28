const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');
const multer = require('multer');
const path = require('path');

const LogEntry = require('../models/LogEntry');

const {
  API_KEY,
  DATABASE_URL,
} = process.env;

const router = Router();

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  }
});

const rateLimitDelay = 10 * 1000; // 10 second delay
const limiter = rateLimit({
  store: new MongoStore({
    uri: DATABASE_URL,
    collectionName: 'rateLimits',
    expireTimeMs: rateLimitDelay,
  }),
  max: 1,
  windowMs: rateLimitDelay
});

router.get('/', async (req, res, next) => {
  try {
    const entries = await LogEntry.find();
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

router.post('/', upload.single('image'), limiter, async (req, res, next) => {
  try {
    // API密钥验证
    if (req.get('X-API-KEY') !== API_KEY) {
      res.status(401);
      throw new Error('UnAuthorized');
    }
    
    // 添加调试日志
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // 准备数据
    const logData = {
      title: req.body.title,
      description: req.body.description,
      comments: req.body.comments,
      rating: req.body.rating || 0,
      latitude: parseFloat(req.body.latitude),
      longitude: parseFloat(req.body.longitude),
      visitDate: new Date(req.body.visitDate),
    };
    
    // 如果有上传的图片，添加图片路径
    if (req.file) {
      logData.image = `/uploads/${req.file.filename}`;
    }
    
    console.log('Processed log data:', logData);
    
    const logEntry = new LogEntry(logData);
    const createdEntry = await logEntry.save();
    res.json(createdEntry);
  } catch (error) {
    console.error('Error creating log entry:', error);
    if (error.name === 'ValidationError') {
      res.status(422);
    }
    next(error);
  }
});

module.exports = router;
