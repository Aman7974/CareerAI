# Security Specification: CareerAI Firebase Architecture

## 1. Data Invariants
- **Users Collection (`/users/{userId}`)**:
  - Documents hold user account data (`id`, `fullName`, `email`, `country`, `preferredLocation`, `targetRole`).
  - `id` must match document key. String fields bounded to prevent denial of wallet attacks.
- **Resumes Collection (`/resumes/{resumeId}`)**:
  - Resumes require `id`, `fullName`, and `title`. ATS scores are numeric and bounded between 0 and 100.
- **Saved Jobs Collection (`/savedJobs/{savedJobId}`)**:
  - Saved jobs store references to job postings with validated `jobTitle`, `company`, `location`.
- **Real-Time Database Entries Collection (`/databaseEntries/{entryId}`)**:
  - Publicly visible audit stream allowing users to observe real-time database write entries.
  - Requires `id`, `collectionName`, `action`, `summary`, and `timestamp`.

## 2. Dirty Dozen Invariant Payloads
1. User payload with missing `fullName` or `email` -> Rejected
2. User payload injecting `id` with path traversal or non-alphanumeric chars -> Rejected
3. User payload exceeding 100 char limit on `fullName` -> Rejected
4. Resume payload with ATS score > 100 or negative -> Rejected
5. Resume payload with missing `title` -> Rejected
6. SavedJob payload without `company` -> Rejected
7. SavedJob payload with excessively large payload (> 1000 chars for URL) -> Rejected
8. DatabaseEntry payload without `action` or `collectionName` -> Rejected
9. DatabaseEntry payload with oversized summary (> 300 chars) -> Rejected
10. Unauthenticated write to private paths without structure -> Rejected
11. Update attempt on immutable IDs -> Rejected
12. Random undefined collection write -> Rejected (Blocked by global default deny)
