# Notifications & Engagement Service

## Overview
Provide multi-channel communications that keep stakeholders informed across the certification lifecycle. Aligns with Service #9 in `docs/SERVICE_MANIFEST.md`.

## Capabilities
- Email, SMS, LINE, and socket notifications
- SLA reminders and follow-ups
- Template localization and personalization

## Components
- Notification dispatchers and queues
- Template management tooling
- Integration hooks with workflow events

## Dependencies
- Certification Workflow service for trigger events
- Survey & Self-Assessment service for follow-up messaging
- Platform Operations for monitoring and retry policies

## SOPs & Runbooks
- Template change approval process
- Incident response for notification failures
- Channel enablement checklist

## Migration Notes
- Candidate sources: `docs/Notifications` content, sprint communication summaries, automation scripts.
- Verify no live templates are lost before archiving existing docs.
- Document every migration step in the log.
