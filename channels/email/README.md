# Email Channel Interface

The `@engine9/interfaces/channels/email` plugin defines email-channel search and engagement segments. It does not create its own tables. Segment builds read `global_message`, `input`, and `timeline` rows produced by email message plugins.

It depends on `@engine9/interfaces/person` because membership is always a set of people.

## Search

`emailEngagement` finds people who opened or clicked email in a rolling window.

| Option | Meaning |
| --- | --- |
| `windowDays` | Rolling window: `30`, `60`, or `90` days |
| `timelineEntryType` | `EMAIL_OPEN` or `EMAIL_CLICK` |
| `pluginId` | Optional. When set, only that plugin's inputs are included. When empty, scope comes from the segment universe instead |

The search looks at `timeline` rows whose `entry_type_id` matches the engagement type and whose `ts` is in the window. It always joins `timeline.input_id = input.id`, so only timeline events for inputs present in the build are counted.

## Segments

Predefined audiences shipped with this interface. On install, each key becomes a `segment` row whose definition path is `@engine9/interfaces/channels/email:segments:<key>`.

Every segment here uses the same **universe** and the `emailEngagement` search. The universe and the search do different jobs, and both are required:

- **Universe** chooses *which email sends* can contribute events: messages on the email channel published in the last **90 days** (`global_message.channel = 'email'` and `publish_date` within 90 days). Those message ids become the `input` rows for the build.
- **Search** chooses *which people* from those sends belong in the audience: a recent open or click on the timeline, inside the segment's rolling window.

An open or click on a message published more than 90 days ago does not count, even if the event itself is recent. `pluginId` is left empty so the universe, not a hardcoded plugin, decides which message stores are scanned.

### 30-day email openers

| | |
| --- | --- |
| **Key** | `email_openers_30d` |
| **Definition path** | `@engine9/interfaces/channels/email:segments:email_openers_30d` |
| **Who is included** | People with an `EMAIL_OPEN` on a universe email in the last 30 days |
| **Who is excluded** | People with no open in that window, or whose only opens are on messages outside the 90-day published universe |

### 60-day email openers

| | |
| --- | --- |
| **Key** | `email_openers_60d` |
| **Definition path** | `@engine9/interfaces/channels/email:segments:email_openers_60d` |
| **Who is included** | People with an `EMAIL_OPEN` on a universe email in the last 60 days |

### 90-day email openers

| | |
| --- | --- |
| **Key** | `email_openers_90d` |
| **Definition path** | `@engine9/interfaces/channels/email:segments:email_openers_90d` |
| **Who is included** | People with an `EMAIL_OPEN` on a universe email in the last 90 days |

### 30-day email clickers

| | |
| --- | --- |
| **Key** | `email_clickers_30d` |
| **Definition path** | `@engine9/interfaces/channels/email:segments:email_clickers_30d` |
| **Who is included** | People with an `EMAIL_CLICK` on a universe email in the last 30 days |
| **Who is excluded** | People who only opened (and did not click), or whose only clicks are outside the window or universe |

### 60-day email clickers

| | |
| --- | --- |
| **Key** | `email_clickers_60d` |
| **Definition path** | `@engine9/interfaces/channels/email:segments:email_clickers_60d` |
| **Who is included** | People with an `EMAIL_CLICK` on a universe email in the last 60 days |

### 90-day email clickers

| | |
| --- | --- |
| **Key** | `email_clickers_90d` |
| **Definition path** | `@engine9/interfaces/channels/email:segments:email_clickers_90d` |
| **Who is included** | People with an `EMAIL_CLICK` on a universe email in the last 90 days |

Openers and clickers are independent. A clicker is not automatically an opener in these definitions; each segment looks only at its own timeline entry type.
