/**
 * Broad calendar-style event + person RSVP.
 * Field names align with common iCal VEVENT / ATTENDEE concepts (RFC 5545)
 * without requiring recurrence (RRULE), GEO, or full ATTENDEE parameter sets.
 */
export const tables = [
  {
    name: 'event',
    columns: {
      id: 'id_uuid',
      name: {
        type: 'string',
        nullable: false,
        description: 'Short title (iCal SUMMARY)'
      },
      description: {
        type: 'string',
        description: 'Longer body / notes (iCal DESCRIPTION)'
      },
      start: {
        type: 'datetime',
        nullable: false,
        description: 'Event start (iCal DTSTART); store UTC, interpret with timezone'
      },
      end: {
        type: 'datetime',
        description: 'Event end (iCal DTEND); null when open-ended or duration unknown'
      },
      timezone: {
        type: 'string',
        description: 'IANA timezone for start/end display (iCal TZID), e.g. America/New_York'
      },
      all_day: {
        type: 'boolean',
        nullable: false,
        default_value: false,
        description: 'True when start/end are calendar dates without a clock time'
      },
      location: {
        type: 'string',
        description: 'Human-readable place or venue (iCal LOCATION)'
      },
      url: {
        type: 'string',
        description: 'Canonical or ticket URL (iCal URL)'
      },
      status: {
        type: 'string',
        nullable: false,
        default_value: 'Confirmed',
        values: ['Tentative', 'Confirmed', 'Cancelled'],
        description: 'Lifecycle of the event itself (iCal STATUS)'
      },
      source_input_id: 'foreign_uuid',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [
      { columns: 'id', primary: true },
      { columns: ['start'] },
      { columns: ['end'] },
      { columns: ['status'] },
      { columns: ['source_input_id'] }
    ]
  },
  {
    name: 'person_event',
    columns: {
      id: 'id',
      event_id: {
        type: 'foreign_uuid',
        nullable: false,
        description: 'Event this person is linked to'
      },
      person_id: 'person_id',
      response: {
        type: 'string',
        nullable: false,
        default_value: 'Invited',
        values: ['Invited', 'Accepted', 'Declined', 'Tentative', 'Attended'],
        description:
          'RSVP / attendance (iCal ATTENDEE PARTSTAT). Invited≈NEEDS-ACTION; Accepted/Declined/Tentative match PARTSTAT; Attended is post-event check-in beyond iCal'
      },
      role: {
        type: 'string',
        nullable: false,
        default_value: 'Required',
        values: ['Required', 'Optional', 'Chair', 'Non-Participant'],
        description: 'Participation role (iCal ATTENDEE ROLE, simplified)'
      },
      responded_at: {
        type: 'datetime',
        description: 'When the person last set response (Attend / Decline / Tentative)'
      },
      source_input_id: 'foreign_uuid',
      created_at: 'created_at',
      modified_at: 'modified_at'
    },
    indexes: [
      { columns: 'id', primary: true },
      { columns: ['person_id'] },
      { columns: ['event_id'] },
      { columns: ['response'] },
      { columns: ['event_id', 'person_id'], unique: true }
    ]
  }
];

export default {
  tables
};
