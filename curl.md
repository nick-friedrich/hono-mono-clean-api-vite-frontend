# API Testing Commands

This document contains curl commands to test the API endpoints.

## Authentication Endpoints

### Register a New User

```bash
curl -X POST 'http://localhost:3000/api/v1/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

#### Expected Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

```bash
curl -X POST 'http://localhost:3000/api/v1/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Expected Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Error Responses

Both endpoints may return error responses in the following format:

```json
{
  "error": "Error message"
}
```

Common error messages:

- Login: "Invalid email or password"
- Register: "User already exists"

## Using the JWT Token

Once you have a token, you can use it to access protected endpoints by adding it to the Authorization header:

```bash
curl -X GET 'http://localhost:3000/api/v1/protected-endpoint' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## Testing with Environment Variables

You can save the token to an environment variable for easier testing:

```bash
# Save token from login/register response
TOKEN=$(curl -s -X POST 'http://localhost:3000/api/v1/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password123"}' | jq -r '.token')

# Use saved token
curl -X GET 'http://localhost:3000/api/v1/protected-endpoint' \
  -H "Authorization: Bearer $TOKEN"
```

Note: This requires [jq](https://stedolan.github.io/jq/) to be installed.
