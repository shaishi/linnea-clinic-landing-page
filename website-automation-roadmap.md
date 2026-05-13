# Linnéa Website Automation Roadmap

## Priority 1: Lead and Booking Quality

1. Lead source tracking
   - Capture UTM source, campaign, page URL and language in the website form.
   - Save the values into the Google Sheet created by the Gmail automation.
   - Use this to understand which content actually produces consultations.

2. Consultation readiness score
   - Add internal sheet columns for treatment interest, urgency, consent status and communication preference.
   - Automatically mark leads as: New, Needs manual scheduling, Booked, Forms sent, Confirmed, Consultation completed.

3. Duplicate lead detection
   - If the same email or phone submits twice within 14 days, update the existing row instead of creating a new patient journey.
   - Notify the clinic only once.

## Priority 2: Patient Communication

4. Communication profile
   - Keep a profile per patient:
     - Email only
     - WhatsApp short + email for forms
     - Full WhatsApp + email for forms
   - Use WhatsApp for short reminders and human-feeling follow-ups.
   - Use email for forms, summaries and longer instructions.

5. Smart form reminder
   - If the 24-hour prep form is not completed within 6-8 hours, create a WhatsApp draft for the team.
   - If still not completed 3 hours before the appointment, mark the Google Calendar event as: Forms not completed.

6. No-show prevention
   - If the patient selects "need to reschedule" in the prep form, update the calendar status and create a manual follow-up task.

## Priority 3: Aftercare and Satisfaction

7. Post-treatment aftercare
   - Send treatment-specific aftercare only after the clinic fills Treatment Date and Treatment Type in the sheet.
   - Avoid generic messages when no treatment was performed.

8. 48-hour check-in
   - Send a short, elegant check-in by the preferred communication profile.
   - Mark satisfaction status as: Waiting, Happy, Needs attention.

9. Escalation for concerns
   - If a patient replies with concern keywords or submits a low satisfaction status, flag the row as Needs doctor review.

## Priority 5: Operations

10. Daily clinic brief
   - Every morning, send the clinic a short internal email:
     - Today's consultations
     - Who needs a call
     - Missing forms
     - Follow-ups due today

11. Weekly performance summary
   - Leads received
   - Bookings confirmed
   - Manual scheduling cases
   - Form completion rate
   - Top requested treatments

## Current Automation File

The active Google Apps Script automation lives in:

`automation/Code.gs`

Important current behavior:

- Reads new form submissions from Gmail.
- Sends 3 booking options.
- Creates a Google Calendar event after a patient chooses a time.
- Sends one branded confirmation email after booking.
- Sends a 24-hour prep form reminder.
- Updates Google Sheets statuses.
- Supports future WhatsApp draft links through communication profiles.
