# Notifications — Design

Components
- `NotificationService` port, adapters for `ExpoPushAdapter`, `EmailAdapter`.
- `notifications` collection stores queued and delivered statuses.

Delivery
- Worker process to send notifications, respecting user preferences and rate limits.
