import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ISA Term Project Group m1prj',
      version: '1',
      description: 'API documentation with Swagger',
    },
    components: {
      securitySchemes: {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer"
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            username: { type: 'string' },
            isadministrator: { type: 'boolean' },
            requestcount: {type: 'number'}
          }
        },
        Prompt: {
          type: 'object',
          properties: {
            promptid: { type: 'number' },
            userid: { type: 'number' },
            title: { type: 'string' },
            prompt: { type: 'string' }
          }
        }
      }
    },
    servers: [
        {
            url: "https://assignments.isaaclauzon.com:8443/v1",
            description: "Production"
        },
        {
            url: "http://localhost:8111/v1",
            description: "localhost"
        }
    ]
  },
  apis: ['./src/routes/*.ts'], 
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerSpec, swaggerUi };