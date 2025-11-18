# 📚 API Documentation

## Overview

This document describes the API documentation system for the Calistenia App. We use **OpenAPI 3.0.3** (formerly Swagger) to provide interactive, standardized API documentation.

---

## 🌐 Accessing the Documentation

### Development
```
http://localhost:3000/api-docs
```

### Production
```
https://your-domain.com/api-docs
```

---

## 📁 Documentation Files

### 1. **OpenAPI Specification**
**Location:** `/apps/web/src/lib/api-docs/routines-api.openapi.json`

This is the source of truth for the API. It defines:
- All endpoints and their parameters
- Request/response schemas
- Authentication methods
- Examples and descriptions

**Format:** OpenAPI 3.0.3 JSON

### 2. **Documentation Page**
**Location:** `/apps/web/src/app/api-docs/page.tsx`

Interactive Swagger UI page that renders the OpenAPI spec with:
- Try-it-out functionality
- Request/response examples
- Schema visualization
- Filter and search

### 3. **Spec Serving Endpoint**
**Location:** `/apps/web/src/app/api-docs/spec/route.ts`

API endpoint that serves the OpenAPI JSON file to the UI.

---

## 🎯 Documented Endpoints

### Current (v2.0.0)

#### `POST /api/routines/generate`
**Description:** Unified routine generation endpoint supporting both daily and weekly modes

**Parameters:**
- `mode` (required): `"daily"` or `"weekly"`
- `duration`: Target workout duration in minutes (15-120)
- `focusAreas`: Array of training categories
- `daysPerWeek`: Number of training days (2-6, weekly mode only)
- `targetSkill`: Specific skill to prioritize
- `forceDay`: Force specific day of week (testing only)

**Examples:**

**Daily Routine:**
```json
{
  "mode": "daily",
  "duration": 45,
  "focusAreas": ["PUSH", "CORE"],
  "targetSkill": "FRONT_LEVER"
}
```

**Weekly Routine:**
```json
{
  "mode": "weekly",
  "duration": 60,
  "daysPerWeek": 4,
  "focusAreas": ["PUSH", "PULL", "LEGS"]
}
```

**Response:**
```json
{
  "success": true,
  "mode": "daily",
  "routine": {
    "id": "daily-user123-1705593600000",
    "date": "2025-01-18",
    "exercises": [...],
    "totalDuration": 45,
    "difficulty": "INTERMEDIATE"
  },
  "metadata": {
    "stage": "STAGE_3",
    "userStats": {
      "pullUpsMax": 15,
      "dipsMax": 20,
      "bodyWeight": 75
    }
  }
}
```

#### `GET /api/routines/generate`
**Description:** Retrieves the most recent routine for the authenticated user

**Response:** Same as POST, returns latest generated routine

---

### Deprecated (Removal: 2025-03-01)

#### `POST /api/routines/generate-v3` ⚠️ DEPRECATED
**Replacement:** Use `/api/routines/generate` with `mode: "weekly"`

#### `POST /api/training/generate-daily-routine` ⚠️ DEPRECATED
**Replacement:** Use `/api/routines/generate` with `mode: "daily"`

---

## 🔧 How to Update Documentation

### Adding a New Endpoint

1. **Update OpenAPI Spec** (`routines-api.openapi.json`):

```json
{
  "paths": {
    "/your-new-endpoint": {
      "post": {
        "summary": "Your endpoint summary",
        "description": "Detailed description",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/YourRequestSchema"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/YourResponseSchema"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

2. **Add Schemas** (if needed):

```json
{
  "components": {
    "schemas": {
      "YourRequestSchema": {
        "type": "object",
        "properties": {
          "field1": {
            "type": "string",
            "description": "Description of field1"
          }
        }
      }
    }
  }
}
```

3. **Test the Documentation:**
- Visit `http://localhost:3000/api-docs`
- Verify the new endpoint appears
- Test the "Try it out" functionality

### Modifying Existing Endpoint

1. Edit the corresponding path in `routines-api.openapi.json`
2. Update examples if needed
3. Increment version number in `info.version` if significant changes

### Deprecating an Endpoint

1. Add `"deprecated": true` to the endpoint
2. Update description with deprecation notice
3. Add replacement information
4. Move to "Deprecated" tag:

```json
{
  "deprecated": true,
  "description": "⚠️ DEPRECATED: Use /new-endpoint instead. Removal date: YYYY-MM-DD",
  "tags": ["Deprecated"]
}
```

---

## ✅ Benefits of OpenAPI Documentation

### For Developers
- **Interactive Testing:** Try endpoints directly from the browser
- **Auto-completion:** IDE support with generated types
- **Single Source of Truth:** Code and docs stay in sync

### For Frontend Teams
- **Clear Contracts:** Exact request/response formats
- **Examples:** Real-world usage examples
- **Type Safety:** Generate TypeScript types from schemas

### For API Consumers
- **Discoverability:** Browse all available endpoints
- **Self-Service:** No need to ask for documentation
- **Standards-Based:** Industry-standard format

---

## 🛠️ Generating Client SDKs

You can generate client libraries from the OpenAPI spec:

### TypeScript/JavaScript
```bash
npm install --save-dev @openapitools/openapi-generator-cli

npx openapi-generator-cli generate \
  -i apps/web/src/lib/api-docs/routines-api.openapi.json \
  -g typescript-fetch \
  -o ./generated/api-client
```

### Python
```bash
pip install openapi-generator-cli

openapi-generator generate \
  -i apps/web/src/lib/api-docs/routines-api.openapi.json \
  -g python \
  -o ./generated/python-client
```

### Other Languages
OpenAPI Generator supports 50+ languages and frameworks:
- Java
- C#
- Ruby
- Go
- Swift
- Kotlin
- And many more...

See: https://openapi-generator.tech/docs/generators

---

## 📊 Validation Tools

### Online Validators
- **Swagger Editor:** https://editor.swagger.io/
- **Redocly:** https://redocly.com/docs/

### CLI Validation
```bash
npm install -g @apidevtools/swagger-cli

swagger-cli validate apps/web/src/lib/api-docs/routines-api.openapi.json
```

---

## 🔗 Additional Resources

### OpenAPI Specification
- **Official Docs:** https://swagger.io/specification/
- **OpenAPI Guide:** https://learn.openapis.org/

### Swagger UI
- **GitHub:** https://github.com/swagger-api/swagger-ui
- **Configuration:** https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/

### Alternative Renderers
- **Redoc:** https://github.com/Redocly/redoc (cleaner, more modern UI)
- **RapiDoc:** https://rapidocweb.com/ (highly customizable)
- **Stoplight Elements:** https://stoplight.io/open-source/elements

---

## 📝 Maintenance Checklist

- [ ] Update OpenAPI spec when adding/modifying endpoints
- [ ] Increment version number for breaking changes
- [ ] Add examples for all new endpoints
- [ ] Test "Try it out" functionality
- [ ] Update deprecation notices 30 days before removal
- [ ] Generate and test client SDKs after major changes
- [ ] Validate spec with `swagger-cli` before committing

---

## 🎓 Best Practices

1. **Keep Examples Real:** Use actual data from your system
2. **Document Edge Cases:** Include error responses and edge cases
3. **Use Descriptions:** Explain the "why", not just the "what"
4. **Version Your API:** Use semantic versioning
5. **Test Regularly:** Ensure examples match actual API behavior
6. **Link to Guides:** Reference migration guides and tutorials

---

**Last Updated:** 2025-01-18
**Maintainer:** Calistenia Team
**Spec Version:** 2.0.0
