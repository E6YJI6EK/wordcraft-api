import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { Application } from 'express'
import mongoose from 'mongoose'
import path from 'path'

// Импорт роутов
import authRoutes from './routes/auth'
import documentRoutes from './routes/documents'
import gostRoutes from './routes/gost'

// Импорт middleware
import { errorHandler, notFound } from './utils/errorHandler'

// Загрузка переменных окружения
dotenv.config({ path: './config.env' })

const app: Application = express()

// Middleware
app.use(
	cors({
		origin: (origin, callback) => {
			callback(null, origin)
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
)
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/gost', gostRoutes)

// Health check
app.get('/api/health', (_req, res) => {
	res.json({
		status: 'OK',
		message: 'GOST Document Formatter API is running',
		timestamp: new Date().toISOString(),
		version: '1.0.0',
	})
})

// API info
app.get('/api', (_req, res) => {
	res.json({
		name: 'GOST Document Formatter API',
		version: '1.0.0',
		description: 'API для форматирования документов по ГОСТу',
		endpoints: {
			auth: '/api/auth',
			documents: '/api/documents',
			gost: '/api/gost',
			health: '/api/health',
		},
	})
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Connect to MongoDB
const connectDB = async (): Promise<void> => {
	try {
		const mongoUri = process.env['MONGODB_URI']
		if (!mongoUri) {
			throw new Error('MONGODB_URI is not defined')
		}

		const conn = await mongoose.connect(mongoUri)
		console.log('✅ Подключение к MongoDB установлено')
		console.log(`📊 База данных: ${conn.connection.host}`)
	} catch (error) {
		console.error('❌ Ошибка подключения к MongoDB:', error)
		process.exit(1)
	}
}

// Graceful shutdown
const gracefulShutdown = (signal: string): void => {
	console.log(`\n🛑 Получен сигнал ${signal}. Завершение работы...`)

	mongoose.connection.close().then(() => {
		console.log('📊 Соединение с MongoDB закрыто.')
		process.exit(0)
	})
}

// Обработка сигналов завершения
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Обработка необработанных ошибок
process.on('unhandledRejection', (err: Error) => {
	console.error('❌ Необработанная ошибка Promise:', err)
	gracefulShutdown('unhandledRejection')
})

process.on('uncaughtException', (err: Error) => {
	console.error('❌ Необработанная ошибка:', err)
	gracefulShutdown('uncaughtException')
})

// Запуск сервера
const startServer = async (): Promise<void> => {
	try {
		await connectDB()

		const PORT = Number(process.env['PORT']) || 5000

		app.listen(PORT, () => {
			console.log(`🚀 Сервер запущен на порту ${PORT}`)
			console.log(`📝 API доступен по адресу: http://localhost:${PORT}/api`)
			console.log(`🔍 Health check: http://localhost:${PORT}/api/health`)
			console.log(`🌍 Окружение: ${process.env['NODE_ENV'] || 'development'}`)
		})
	} catch (error) {
		console.error('❌ Ошибка запуска сервера:', error)
		process.exit(1)
	}
}

// Запускаем сервер
startServer()

export default app
