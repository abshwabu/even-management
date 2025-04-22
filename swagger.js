import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Management API',
      version: '1.0.0',
      description: 'API documentation for Event Management System',
    },
    servers: [
      {
        url: process.env.API_URL || 'https://event-management-zk4x.onrender.com',
        description: process.env.API_URL ? 'Development server' : 'Production server',
      },
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
  },
  apis: [
    './routes/*.js',
    './models/*.js',
    './controllers/*.js',
  ],
};

const specs = swaggerJsdoc(options);

// Serve Swagger UI
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  return res.send(swaggerUi.generateHTML(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      url: '/api-docs/swagger.json',
      persistAuthorization: true,
    },
  }));
});

// Serve Swagger spec as JSON
router.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Redirect root to API docs
router.get('/', (req, res) => {
  res.redirect('/api-docs');
});

export default router;