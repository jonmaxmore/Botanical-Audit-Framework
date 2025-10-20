# GACP Backend Architecture

This directory contains the refactored backend code following clean architecture principles.

## Directory Structure

```
src/
├── app.js              # Main application server
├── controllers/        # Request handlers and business logic
│   ├── authController.js
│   ├── userController.js
│   ├── applicationController.js
│   ├── certificateController.js
│   ├── auditController.js
│   ├── paymentController.js
│   └── surveyController.js
├── middleware/         # Request middleware
│   ├── auth.js        # Authentication & authorization
│   ├── validation.js  # Request validation
│   ├── logging.js     # Request logging
│   └── errorHandler.js # Error handling
├── models/            # Database models
│   ├── BaseModel.js   # Base model class
│   ├── User.js        # User model
│   └── Farmer.js      # Farmer model
├── routes/            # API route definitions
│   ├── index.js       # Main routes index
│   ├── auth.js        # Authentication routes
│   ├── users.js       # User management routes
│   ├── applications.js # Application routes
│   ├── certificates.js # Certificate routes
│   ├── audits.js      # Audit routes
│   ├── payments.js    # Payment routes
│   └── surveys.js     # Survey routes
├── services/          # Business logic services
│   ├── authService.js
│   ├── userService.js
│   └── emailService.js
└── utils/             # Utility functions
    ├── config.js      # Configuration management
    ├── logger.js      # Winston logging
    ├── errors.js      # Custom error classes
    └── validation.js  # Validation utilities
```

## Architecture Overview

### Clean Architecture Principles

1. **Separation of Concerns**: Each layer has distinct responsibilities
2. **Dependency Inversion**: High-level modules don't depend on low-level modules
3. **Single Responsibility**: Each class/function has one reason to change
4. **Open/Closed Principle**: Open for extension, closed for modification

### Layer Breakdown

#### 1. Routes Layer (`routes/`)

- Defines API endpoints and HTTP methods
- Maps requests to appropriate controllers
- Handles route-specific middleware
- Implements RESTful design patterns

#### 2. Controllers Layer (`controllers/`)

- Handles HTTP requests and responses
- Orchestrates service calls
- Manages request/response formatting
- Implements business logic coordination

#### 3. Services Layer (`services/`)

- Contains core business logic
- Database operations abstraction
- External service integrations
- Reusable business functions

#### 4. Models Layer (`models/`)

- Database schema definitions
- Data validation rules
- Model-specific methods
- Database relationship management

#### 5. Middleware Layer (`middleware/`)

- Cross-cutting concerns
- Authentication & authorization
- Request validation
- Error handling
- Logging

#### 6. Utils Layer (`utils/`)

- Helper functions
- Configuration management
- Logging utilities
- Custom error definitions

## Key Features

### 1. Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Token refresh mechanisms

### 2. Request Validation

- Comprehensive input validation
- Schema-based validation
- Custom validation rules
- Error message standardization

### 3. Error Handling

- Centralized error management
- Custom error classes
- Structured error responses
- Proper HTTP status codes

### 4. Logging

- Winston-based logging
- Multiple log levels
- File and console transports
- Request/response logging

### 5. API Design

- RESTful endpoints
- Consistent naming conventions
- Proper HTTP methods
- Resource-based URLs

## Configuration

The system uses environment-based configuration:

```javascript
// utils/config.js
const config = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp',
  },
};
```

## Usage

### Starting the Server

```bash
# Development
npm run dev

# Production
npm start
```

### Environment Variables

```bash
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb://localhost:27017/gacp
```

### API Testing

The server exposes several endpoints:

- **Health Check**: `GET /health`
- **API Documentation**: `GET /api/v1/docs`
- **Authentication**: `POST /api/v1/auth/login`
- **Applications**: `GET /api/v1/applications`

## Security Features

1. **CORS Configuration**: Proper origin handling
2. **Rate Limiting**: Request throttling
3. **Input Sanitization**: XSS protection
4. **Authentication**: JWT tokens
5. **Authorization**: Role-based permissions
6. **Validation**: Comprehensive input checking

## Error Handling

Standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Valid email address is required"
    }
  }
}
```

## Testing

The architecture supports comprehensive testing:

- Unit tests for individual functions
- Integration tests for API endpoints
- Service layer testing
- Database interaction testing

## Performance Considerations

1. **Compression**: Gzip compression enabled
2. **Caching**: Response caching where appropriate
3. **Database**: Optimized queries and indexing
4. **Middleware**: Efficient request processing

## Migration Notes

This architecture replaces the old monolithic `app.js` with:

- Better code organization
- Improved maintainability
- Enhanced testing capabilities
- Scalable structure
- Clear separation of concerns

## Development Guidelines

1. Follow the established folder structure
2. Implement proper error handling
3. Use consistent naming conventions
4. Write comprehensive tests
5. Document API changes
6. Follow RESTful design principles

---

**Note**: This architecture is designed for scalability and maintainability. When adding new features, follow the established patterns and maintain the separation of concerns.
