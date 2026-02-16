/**
 * Swagger / OpenAPI Configuration
 *
 * FEAT-112: Auto-generated API documentation served at /api/docs
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Pump Me API',
            version: '1.0.0',
            description: 'The most normie-friendly GPU compute API. Run AI models on beast-mode GPUs with zero config.',
            contact: {
                name: 'Pump Me Support',
                url: 'https://pumpme.cloud',
                email: 'support@pumpme.cloud',
            },
            license: {
                name: 'Proprietary',
            },
        },
        servers: [
            {
                url: '/api',
                description: 'Main API',
            },
            {
                url: '/v1',
                description: 'OpenAI-compatible inference API',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token from login endpoint (sent as httpOnly cookie or Authorization header)',
                },
                apiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    description: 'API key with Bearer prefix: `Bearer pm_live_xxx`',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Something went wrong' },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        name: { type: 'string' },
                        tier: { type: 'string', enum: ['free', 'starter', 'pro', 'beast', 'ultra', 'admin'] },
                        creditBalance: { type: 'number', description: 'Balance in cents' },
                    },
                },
                Session: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        status: { type: 'string', enum: ['provisioning', 'ready', 'active', 'terminated', 'error'] },
                        tier: { type: 'string' },
                        gpuType: { type: 'string' },
                        gpuCount: { type: 'integer' },
                        pricePerMinute: { type: 'number' },
                        totalMinutes: { type: 'number' },
                        totalCost: { type: 'number' },
                        accessUrl: { type: 'string', format: 'uri' },
                    },
                },
                ChatCompletionRequest: {
                    type: 'object',
                    required: ['model', 'messages'],
                    properties: {
                        model: { type: 'string', example: 'llama3' },
                        messages: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    role: { type: 'string', enum: ['system', 'user', 'assistant'] },
                                    content: { type: 'string' },
                                },
                            },
                        },
                        stream: { type: 'boolean', default: false },
                        temperature: { type: 'number', default: 0.7, minimum: 0, maximum: 2 },
                        max_tokens: { type: 'integer', default: 2048 },
                    },
                },
                ChatCompletionResponse: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        object: { type: 'string', example: 'chat.completion' },
                        created: { type: 'integer' },
                        model: { type: 'string' },
                        choices: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    index: { type: 'integer' },
                                    message: {
                                        type: 'object',
                                        properties: {
                                            role: { type: 'string' },
                                            content: { type: 'string' },
                                        },
                                    },
                                    finish_reason: { type: 'string' },
                                },
                            },
                        },
                        usage: {
                            type: 'object',
                            properties: {
                                prompt_tokens: { type: 'integer' },
                                completion_tokens: { type: 'integer' },
                                total_tokens: { type: 'integer' },
                            },
                        },
                    },
                },
                Model: {
                    type: 'object',
                    properties: {
                        slug: { type: 'string' },
                        name: { type: 'string' },
                        provider: { type: 'string' },
                        category: { type: 'string', enum: ['language', 'code', 'vision', 'image', 'video', 'audio', 'embedding', '3d'] },
                        parameters: { type: 'string' },
                        vramRequired: { type: 'number', description: 'GB of VRAM needed' },
                    },
                },
            },
        },
        paths: {
            '/auth/register': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Register a new user',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password'],
                                    properties: {
                                        email: { type: 'string', format: 'email' },
                                        password: { type: 'string', minLength: 8 },
                                        name: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: 'User created successfully' },
                        409: { description: 'Email already exists' },
                    },
                },
            },
            '/auth/login': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Login and receive JWT token',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password'],
                                    properties: {
                                        email: { type: 'string', format: 'email' },
                                        password: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: 'Login successful, JWT set in cookie' },
                        401: { description: 'Invalid credentials' },
                    },
                },
            },
            '/sessions/create': {
                post: {
                    tags: ['Sessions'],
                    summary: 'Create a new GPU session',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['tier'],
                                    properties: {
                                        tier: { type: 'string', enum: ['starter', 'pro', 'beast', 'ultra'] },
                                        modelId: { type: 'string' },
                                        type: { type: 'string', enum: ['burst', 'vpn'], default: 'burst' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: 'Session created and provisioning started' },
                        402: { description: 'Insufficient credits' },
                        503: { description: 'No GPU capacity available' },
                    },
                },
            },
            '/v1/chat/completions': {
                post: {
                    tags: ['Inference API'],
                    summary: 'Create a chat completion (OpenAI-compatible)',
                    security: [{ apiKeyAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ChatCompletionRequest' },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'Chat completion response',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ChatCompletionResponse' },
                                },
                            },
                        },
                        401: { description: 'Invalid API key' },
                    },
                },
            },
            '/v1/models': {
                get: {
                    tags: ['Inference API'],
                    summary: 'List available models (OpenAI-compatible)',
                    security: [{ apiKeyAuth: [] }],
                    responses: {
                        200: { description: 'List of available models' },
                    },
                },
            },
        },
    },
    apis: [], // We define paths inline above
};

export const swaggerSpec = swaggerJsdoc(options);
