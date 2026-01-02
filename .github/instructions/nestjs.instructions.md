---
applyTo: '**/*.ts, **/*.js, **/*.json, **/*.spec.ts, **/*.e2e-spec.ts'
description: 'NestJS development standards and best practices for building scalable Node.js server-side applications'
---

# NestJS Development Best Practices

## Core NestJS Principles

### **1. Dependency Injection (DI)**
- Use `@Injectable()` decorator for services, repositories, and other providers
- Inject dependencies through constructor parameters with proper typing
- Prefer interface-based dependency injection for better testability
- Use custom providers when you need specific instantiation logic

### **2. Modular Architecture**
- Create feature modules with `@Module()` decorator
- Import only necessary modules and avoid circular dependencies
- Use `forRoot()` and `forFeature()` patterns for configurable modules
- Implement shared modules for common functionality

### **3. Decorators and Metadata**
- Use appropriate decorators: `@Controller()`, `@Get()`, `@Post()`, `@Injectable()`
- Apply validation decorators from `class-validator` library
- Use custom decorators for cross-cutting concerns

## Project Structure Best Practices

### **Recommended Directory Structure**
```
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/
├── modules/
│   ├── auth/
│   ├── users/
│   └── products/
└── shared/
```

### **File Naming Conventions**
- **Controllers:** `*.controller.ts`
- **Services:** `*.service.ts`
- **Modules:** `*.module.ts`
- **DTOs:** `*.dto.ts`
- **Entities:** `*.entity.ts`
- **Guards:** `*.guard.ts`
- **Interceptors:** `*.interceptor.ts`
- **Pipes:** `*.pipe.ts`
- **Filters:** `*.filter.ts`

## API Development Patterns

### **1. Controllers**
- Keep controllers thin - delegate business logic to services
- Use proper HTTP methods and status codes
- Implement comprehensive input validation with DTOs
- Apply guards and interceptors at the appropriate level

### **2. Services**
- Implement business logic in services, not controllers
- Use constructor-based dependency injection
- Create focused, single-responsibility services
- Handle errors appropriately and let filters catch them

### **3. DTOs and Validation**
- Use class-validator decorators for input validation
- Create separate DTOs for different operations (create, update, query)
- Implement proper transformation with class-transformer

## Database Integration

### **TypeORM Integration**
- Define entities with proper decorators and relationships
- Implement repository pattern for data access
- Use migrations for database schema changes

## Testing Strategies

### **Unit Testing**
- Test services independently using mocks
- Use Jest as the testing framework
- Create comprehensive test suites for business logic

### **E2E Testing**
- Test complete application flows
- Use supertest for HTTP testing

## Performance and Security

### **Performance Optimization**
- Implement caching strategies with Redis
- Use interceptors for response transformation
- Optimize database queries
- Implement pagination for large datasets

### **Security Best Practices**
- Validate all inputs using class-validator
- Implement rate limiting
- Use CORS appropriately
- Sanitize outputs
- Use environment variables for sensitive configuration
