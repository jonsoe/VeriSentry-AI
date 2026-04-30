# Security Specification - GuardAI: Scam Radar

## Data Invariants
1. A ScamReport must be linked to a valid authenticated user.
2. A user can only read and write their own ScamReports.
3. User profiles can only be managed by the owner.
4. Timestamp fields must use server time.

## The Dirty Dozen Payloads (Rejections)
1. **Identity Spoofing**: Attempt to create a report with a `userId` that doesn't match the authenticated UID.
2. **Permission Bypass**: Attempt to read someone else's reports.
3. **Ghost Field Injection**: Adding an `isVerifiedSystem` field to a user profile or report.
4. **ID Poisoning**: Using a 2KB string as a report ID.
5. **Type Mismatch**: Sending `score` as a string instead of a number.
6. **State Shortcut**: Attempting to update a report's `riskLevel` without the validation helper logic.
7. **Size Limit Abuse**: Sending a 2MB string for the `summary`.
8. **PII Leak**: Attempting to query the `users` collection for all emails.
9. **Orphaned Record**: Creating a report with a `userId` for a deleted user (if exists check enforced).
10. **Timestamp Manipulation**: Sending a manual `timestamp` instead of `request.time`.
11. **Immutability Breach**: Attempting to change the `userId` on an existing report.
12. **Blanket Read**: Authenticated user trying to list ALL reports without a filter.

## Test Runner (Planned)
The `firestore.rules.test.ts` will verify these rejections.
