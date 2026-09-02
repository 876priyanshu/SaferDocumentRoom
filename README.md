# Safer Document Room (NamoID Challenge)

A proof-of-concept secure document sharing room that replaces risky email/WhatsApp attachments with identity-bound, expiring, and revocable access.

## Features
* **Identity-Bound:** Only authorized session users (Broker or Applicant) can access the room.
* **Expiring Access:** Rooms have a hard expiry date. Post-expiry, the API rejects all reads.
* **Manual Revocation:** Applicants can instantly revoke access to specific documents.
* **Immutable Audit Trail:** Every upload, view, and revocation is logged with a timestamp and actor ID.

## How to Run locally
1. `npm install`
2. `node server.js`
3. Visit `http://localhost:3000`

## Threat Model
1. **Threat: Insecure Direct Object Reference (IDOR).** An attacker guesses a document URL to view another user's files.
   * **Mitigation:** Document URLs are not public. The API middleware strictly validates that the NamoID session user matches the room's authorized participants before returning data.
2. **Threat: Stale Access.** A broker retains access to sensitive files after the apartment lease is signed.
   * **Mitigation:** The room enforces a hard `expiresAt` timestamp. Additionally, the applicant can trigger a `revokedAt` flag at any time, immediately breaking all subsequent read attempts.
3. **Threat: Repudiation.** A broker claims they never viewed the files.
   * **Mitigation:** The backend forces an `AuditLog` database insertion prior to successfully returning document content, creating a transparent timeline.
