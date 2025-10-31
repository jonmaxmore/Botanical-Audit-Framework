# IoT Monitoring & Alerts Service

## Overview
Ingest sensor telemetry, normalize device data, and trigger timely alerts. Aligns with Service #4 in `docs/SERVICE_MANIFEST.md`.

## Capabilities
- Sensor onboarding and normalization
- Real-time dashboards and threshold alerting
- Anomaly detection experiments (THC calibration, humidity, etc.)

## Components
- IoT ingestion pipelines
- Device registry and calibration data
- Alert routing to Notifications & Engagement service

## Dependencies
- AI Decision Support service for anomaly models
- Platform Infrastructure for MQTT/broker configuration
- Security & Governance service for device credentialing

## SOPs & Runbooks
- Device enrollment
- Alert triage workflow
- Sensor maintenance and calibration

## Migration Notes
- Candidate sources: `docs/PHASE2_IOT_SMART_FARMING_GUIDE.md`, relevant sprint reports, IoT experiment logs.
- Confirm device naming conventions before retiring legacy diagrams.
- Track migration steps in the documentation log.
