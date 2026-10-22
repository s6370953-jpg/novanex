# API Documentation — Learnova Tutor

**Deployed base URL:** `https://learnova-tutor-api.onrender.com/api`  
**Local base URL:** `http://localhost:5000/api`

> This is a starter reference from known project context. Verify exact methods, subpaths, fields, responses, and auth requirements in the current backend source before submitting.

## Health
| Path | Method | Purpose |
|---|---|---|
| `/health` | GET | Check API health and, where implemented, database connectivity |

Example:
```bash
curl https://learnova-tutor-api.onrender.com/api/health
```

## Authentication
| Path | Method | Purpose | Access |
|---|---|---|---|
| `/auth/register` | POST | Register a user | Public |
| `/auth/login` | POST | Log in | Public |
| `/auth/me` | GET | Get current user/session | Auth/session required if implemented |

Example body shape only; confirm field names in code:
```json
{"email":"student@example.com","password":"Demo-password-only"}
```

## Known feature route groups
| Path group | Intended purpose |
|---|---|
| `/lessons` | Lesson information |
| `/resources` | Learning resources |
| `/revision` | Revision activities/content |
| `/learning-sessions` | Learning session records |
| `/ai` | AI tutor-related functionality |

## Common status codes
- `200`: success
- `201`: resource created, if used
- `400`: invalid request
- `401`: missing/invalid authentication
- `403`: insufficient permission
- `404`: route/resource not found
- `500`: server-side error; inspect server logs

## Complete before upload
- [ ] Confirm exact routes and methods in `backend/src/`.
- [ ] Add request/response examples from real implementation.
- [ ] Mark protected endpoints and roles.
- [ ] Test each endpoint and record actual status.
