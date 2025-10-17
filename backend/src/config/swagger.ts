import swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition = {
	openapi: '3.0.3',
	info: {
		title: 'GOST Document Formatter API',
		version: '1.0.0',
		description: 'API для форматирования документов по ГОСТу',
	},
	servers: [
		{ url: 'http://localhost:5000', description: 'Local' },
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			},
		},
	},
	security: [
		{ bearerAuth: [] },
	],
}

const swaggerOptions: swaggerJSDoc.Options = {
	definition: swaggerDefinition as any,
	apis: [
		'./src/server.ts',
		'./src/routes/*.ts',
		'./dist/server.js',
		'./dist/routes/*.js',
	],
}

const swaggerSpec = swaggerJSDoc(swaggerOptions)

export default swaggerSpec


