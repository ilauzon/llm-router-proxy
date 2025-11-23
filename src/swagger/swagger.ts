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
        "accessTokenCookieAuth": {
            "type": "JWT Access Token",
            "in": "cookie",
            "name": "accessToken"
        },
        "refreshTokenCookieAuth": {
            "type": "JWT Refresh Token",
            "in": "cookie",
            "name": "refreshToken"
        },
        "apiKeyAuth": {
            "type": "API Key",
            "in": "Authorization",
            "name": "Bearer"
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
            url: "https://assignments.isaaclauzon.com/v1",
            description: "Production"
        },
        {
            url: "http://localhost:3000/v1",
            description: "localhost"
        }
    ]
  },
  apis: ['./src/routes/*.ts'], 
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerSpec, swaggerUi };