# Security Specification: FixIt Support App

## 1. Data Invariants
- A `User` profile must be created by the user themselves and is immutable for non-owners (except admins).
- An `Appliance` must belong to a valid `User`.
- A `Booking` must reference a valid `User` and `Appliance`.
- A `Message` can only be sent within a `Conversation` where the sender is a participant.
- `role` fields are restricted and cannot be modified by the user (except on initial signup if we allow it, but better restricted to `user`).

## 2. The "Dirty Dozen" Payloads (Red Team Test Cases)

1. **Identity Theft (User Profile)**: User A tries to update User B's profile.
2. **Role Escalation**: User tries to set their `role` to 'admin'.
3. **Ghost Booking**: User tries to create a booking for another user (`userId` mismatch).
4. **ID Poisoning**: User tries to create a booking with a 2KB junk string as the document ID.
5. **Timestamp Spoofing**: User tries to set `createdAt` to a date in the future.
6. **Phantom Message**: User tries to send a message to a conversation they are not part of.
7. **Appliance Hijacking**: User tries to update an appliance they don't own.
8. **Booking State Skip**: User tries to set booking status from 'pending' directly to 'completed'.
9. **Admin Collection Probe**: Non-admin user tries to list the `/admins/` collection.
10. **Data Bloating**: User tries to add a 1MB string to a chat message `text` field.
11. **Relational Breakage**: Creating a booking for a non-existent appliance.
12. **Status Lock Bypass**: Trying to update a booking after it's in a 'completed' state.

## 3. Test Runner Concept
The tests will ensure `PERMISSION_DENIED` for all above cases.
Detailed `firestore.rules` will implement these guards.
