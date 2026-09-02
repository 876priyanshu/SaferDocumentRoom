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
