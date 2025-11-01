> **Archived 2025-11-01 — originally located at `docs/research/HDC_DATA_INVENTORY.md`.**

# HDC Data Inventory Snapshot

| Dataset / Source         | Location                                                | Key Fields                                            | Refresh Cadence | Data Quality Notes                                                  | Owner             |
| ------------------------ | ------------------------------------------------------- | ----------------------------------------------------- | --------------- | ------------------------------------------------------------------- | ----------------- |
| **Farm Applications**    | `database/applications` (MongoDB)                       | farmer profile, crop type, documents, status timeline | Daily           | Missing geo coords in ~12% records; document categories consistent. | Backend Data Team |
| **Inspection Reports**   | `database/inspections`                                  | inspection scores, findings, photos, inspector notes  | Weekly          | Text notes unstructured; some reports missing final decision flag.  | Compliance Ops    |
| **IoT Sensor Streams**   | `data/iot/` + Redis                                     | temp, humidity, pH, THC readings                      | Real-time       | Sensor outages logged; needs normalization per device.              | IoT / DevOps      |
| **Document Metadata**    | `storage/docs/metadata`                                 | file hash, upload timestamp, mime, OCR summary        | Daily           | OCR coverage 78%; hashed duplicates detected.                       | Document Services |
| **User Activity Logs**   | `monitoring/activity`                                   | login events, feature usage, audit trails             | Real-time       | Contains PII → ensure PDPA compliance; high volume.                 | Security/IT       |
| **Enforcement Outcomes** | Manual spreadsheet (`docs/compliance/enforcement.xlsx`) | penalties, follow-up actions                          | Monthly         | Needs ingestion; not yet in database.                               | Compliance        |

## Action Items

- Validate latest schema versions & access permissions for sandbox experiments.
- Plan ETL jobs to clean missing fields (geo coordinates, decision flags).
- Plug source exports into `archive/research-hdc-2025/scripts/prepare_risk_scoring_dataset.py` to reproduce the experiment-ready table if work resumes.
- Coordinate with Data Governance for PDPA-compliant dataset exports.
- Document any additional datasets required before PoC kick-off.
