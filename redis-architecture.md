# Redis Architecture – EdTech Skill Verification Platform

## 1. Purpose

Redis is used as the enforcement and caching layer of the platform.
It handles temporary, fast-changing, and security-critical data.

Redis is NOT used for permanent storage.
All permanent records are stored in PostgreSQL.

---

## 2. Redis Responsibilities

Redis will handle:

- Rate limiting (login, OTP, uploads)
- MCQ timer enforcement
- Attempt immutability
- Video processing status tracking
- Temporary certificate verification cache

---

## 3. Key Naming Strategy

All keys follow this structure:

feature:entityId:extraInfo

Keys must be:
- Predictable
- Namespaced
- Collision-safe
- Scalable

---

## 4. Key Structure Definitions

### 4.1 Rate Limiting

Keys:
rate:login:{userId}
rate:otp:{userId}
rate:upload:{userId}

Type: Integer Counter
Method: INCR
Expiry: 60 seconds

Behavior:
- Allow max 5 attempts per minute
- Block if exceeded

---

### 4.2 MCQ Timer Enforcement

Key:
mcq:timer:{userId}:{courseId}

Type: String
Value: active
Expiry: 1800 seconds (30 minutes)

Behavior:
- Created when test starts
- Submission allowed only if key exists
- Expiry auto-invalidates test

---

### 4.3 Attempt Lock

Key:
mcq:attempt:{userId}:{courseId}

Type: String
Value: locked
Expiry: None (or long expiry)

Behavior:
- Created on first attempt
- Prevents retake

---

### 4.4 Video Processing Status

Key:
video:status:{submissionId}

Type: String
Values:
- processing
- transcribed
- similarity_flagged
- approved
- rejected

Expiry:
Optional (delete after final status persisted in DB)

Behavior:
- Updated during processing pipeline
- Used by frontend polling

---

### 4.5 Certificate Verification Cache

Key:
cert:verify:{certificateId}

Type: String / JSON
Expiry: 600 seconds (10 minutes)

Behavior:
- Cache verification results
- Reduce PostgreSQL load

---

## 5. Data Types Used

- String → status flags
- Integer Counter (INCR) → rate limiting
- Hash (future use) → session data
- List (future use) → admin review queue

---

## 6. Expiry Strategy

All temporary enforcement keys must have TTL.
Permanent lock keys must NOT expire unless business logic requires.

TTL must be validated before submission logic.

---

## 7. Failure Strategy

If Redis is unavailable:

- Login → Fail safe (block)
- MCQ Start → Block
- Submission → Block
- Video status → Retry
- Certificate verify → Fallback to DB

Redis failure must not compromise enforcement integrity.

---

## 8. Security Guidelines

- Redis must not be publicly exposed.
- Credentials stored in environment variables.
- Never connect Redis directly to frontend.
- Rate limiter keys must not be guessable.

---

## 9. Integration Layer

Redis logic must be isolated inside:

redis.service.ts

Controllers must not directly write raw Redis commands.
All access should go through service layer.

---
