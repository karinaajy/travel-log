const { Router } = require('express')
const rateLimit = require('express-rate-limit')
const MongoStore = require('rate-limit-mongo')
const upload = require('../middleware/upload')

const LogEntry = require('../models/LogEntry')

const { API_KEY, DATABASE_URL } = process.env

const router = Router()

const rateLimitDelay = 10 * 1000 // 10 second delay
const limiter = rateLimit({
  store: new MongoStore({
    uri: DATABASE_URL,
    expireTimeMs: rateLimitDelay,
  }),
  max: 1,
  windowMs: rateLimitDelay,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: false, // 不信任代理，使用连接IP
  keyGenerator: (req) =>
    req.connection.remoteAddress || req.socket.remoteAddress,
})

router.get('/', async (req, res, next) => {
  try {
    const entries = await LogEntry.find()
    res.json(entries)
  } catch (error) {
    next(error)
  }
})

router.post('/', limiter, upload.single('image'), async (req, res, next) => {
  try {
    if (req.get('X-API-KEY') !== API_KEY) {
      res.status(401)
      throw new Error('UnAuthorized')
    }

    const logEntryData = req.body

    // 验证坐标范围
    const { latitude, longitude } = logEntryData
    if (latitude < -90 || latitude > 90) {
      res.status(400)
      throw new Error(`Invalid latitude: ${latitude}. Must be between -90 and 90.`)
    }
    if (longitude < -180 || longitude > 180) {
      res.status(400)
      throw new Error(`Invalid longitude: ${longitude}. Must be between -180 and 180.`)
    }

    // 如果有上传的文件，设置图片URL
    if (req.file) {
      logEntryData.image = `/uploads/${req.file.filename}`
    } else if (logEntryData.image && !logEntryData.image.startsWith('http') && !logEntryData.image.startsWith('/uploads/')) {
      // 如果图片字段不是有效的URL或文件路径，则清空它
      delete logEntryData.image
    }

    const logEntry = new LogEntry(logEntryData)
    const createdEntry = await logEntry.save()
    res.json(createdEntry)
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(422)
    }
    next(error)
  }
})

module.exports = router
