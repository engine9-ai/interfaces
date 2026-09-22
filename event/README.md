# Event Interface

`@engine9/interfaces/event` is the shared calendar-style event contract: an `event` row plus `person_event` RSVP / attendance links. Install on accounts that need events; it is not part of the standard stack.

Depends on `@engine9/interfaces/person` because every `person_event` row belongs to a person through `person_id`.

## Data Model

### `event`

Minimum useful calendar event. Names track common iCal `VEVENT` properties (RFC 5545) without recurrence or structured geo.

| Field | Type | iCal | Description |
| --- | --- | --- | --- |
| `id` | `id_uuid` | `UID` | Event id. |
| `name` | `string` | `SUMMARY` | Short title (required). |
| `description` | `string` | `DESCRIPTION` | Longer body / notes. |
| `start` | `datetime` | `DTSTART` | Start instant (store UTC; display with `timezone`). |
| `end` | `datetime` | `DTEND` | End instant; null when open-ended or unknown. |
| `timezone` | `string` | `TZID` | IANA zone for display, e.g. `America/New_York`. |
| `all_day` | `boolean` | date vs date-time | True when the event is a calendar day without a clock time. Defaults to `false`. |
| `location` | `string` | `LOCATION` | Venue or place text. |
| `url` | `string` | `URL` | Canonical or ticket link. |
| `status` | `string` | `STATUS` | `Tentative`, `Confirmed` (default), or `Cancelled`. |
| `source_input_id` | `foreign_uuid` | — | Input that created or owns the row. |
| `created_at` / `modified_at` | timestamps | `CREATED` / `LAST-MODIFIED` | Row lifecycle. |

Indexes: primary `id`; `start`, `end`, `status`, `source_input_id`.

**Intentionally omitted (v1):** `RRULE` / recurrence, `GEO`, `ORGANIZER`, remote event ids, `CATEGORIES`, `CLASS`, `TRANSP`, `SEQUENCE`. Plugins can keep those in their own tables or remote payloads.

### `person_event`

One person linked to one event for invite / RSVP / attendance.

| Field | Type | iCal | Description |
| --- | --- | --- | --- |
| `id` | `id` | — | Row id. |
| `event_id` | `foreign_uuid` | — | Parent event. |
| `person_id` | `person_id` | — | Linked person. |
| `response` | `string` | `ATTENDEE` `PARTSTAT` | `Invited` (default, ≈ `NEEDS-ACTION`), `Accepted`, `Declined`, `Tentative`, or `Attended` (post-event check-in beyond iCal). |
| `role` | `string` | `ATTENDEE` `ROLE` | `Required` (default), `Optional`, `Chair`, or `Non-Participant`. |
| `responded_at` | `datetime` | — | When the person last set `response`. |
| `source_input_id` | `foreign_uuid` | — | Provenance input when imported. |
| `created_at` / `modified_at` | timestamps | — | Row lifecycle. |

Indexes: primary `id`; `person_id`, `event_id`, `response`; unique `(event_id, person_id)`.

**Attend / Decline:** upsert `person_event` with `response` `Accepted` or `Declined` (and set `responded_at`). Use `Tentative` for maybe, `Attended` after check-in, `Invited` until they answer.

## Inbound Behavior

None in this package. Native event / calendar plugins should upsert `event` and `person_event` (and may later contribute inbound transforms).

## Outbound Behavior

None.

## Search

| Key | Path | Purpose |
| --- | --- | --- |
| `responses` | `@engine9/interfaces/event:search:responses` | Filter people by `person_event.response` and optional `eventId`. |

## Segments

None.

## Metrics

None.

## Reports and UI

None on this interface. Dashboards belong on `@engine9/plugins/reports/<area>` if needed later.

## Settings

None.
