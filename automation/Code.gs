/**
 * Linnea Clinic appointment automation.
 *
 * Install in Google Apps Script while logged in as linneaclinic@gmail.com.
 * Deploy as a Web App and set "Execute as: Me" and "Who has access: Anyone".
 */

const CONFIG = {
  clinicName: 'Linnéa aesthetics',
  clinicEmail: 'linneaclinic@gmail.com',
  clinicPhone: '050-123-4567',
  clinicAddress: 'דרך מנחם בגין 150, תל אביב',
  mapsUrl: 'https://maps.google.com/?q=Menachem+Begin+Road+150+Tel+Aviv+Israel',
  siteUrl: 'https://shaishi.github.io/linnea-clinic-landing-page/',
  timezone: 'Asia/Jerusalem',
  appointmentMinutes: 45,
  bookingLookaheadDays: 35,
  maxSlotsInEmail: 3,
  duplicateWindowDays: 14,
  prepReminderHoursAfterSend: 6,
  prepEscalationHoursBefore: 3,
  intakeCheckEveryMinutes: 10,
  patientMessageQuietHours: { start: 21, end: 8 },
  clinicBriefHourWindow: { start: 8, end: 9 },
  automaticClinicBriefsEnabled: false,
  automaticWeeklySummaryEnabled: false,
  sendEmptyDailyBrief: false,
  calendarId: 'primary',
  webAppUrl: '', // Paste the deployed Web App URL ending with /exec after deployment.
  spreadsheetId: '', // Leave empty: setupLinneaAutomation will create one and save its ID.
  spreadsheetName: 'Linnea Clinic - Consultation Leads',
  sheetName: 'Consultations',
  prepFormId: '', // Leave empty: setupLinneaAutomation will create one Google Form for consent + medical history.
  prepFormName: 'Linnéa - טפסי הכנה ואישור הגעה',
  defaultCommunicationProfile: 'מייל בלבד',
  communicationProfiles: {
    emailOnly: 'מייל בלבד',
    whatsappShortEmailForms: 'וואטסאפ קצר + מייל לטפסים',
    fullWhatsAppEmailForms: 'וואטסאפ מלא + מייל לטפסים',
  },
  bookingDays: [1, 5], // Monday, Friday. Apps Script: Sunday=0.
  workingHours: {
    1: [{ start: '10:00', end: '17:00' }],
    5: [{ start: '09:00', end: '14:00' }],
  },
  slotStepMinutes: 45,
  processedLabel: 'Linnea/Processed Intake',
  sourceQuery: 'newer_than:14d -label:"Linnea/Processed Intake" (from:web3forms.com OR subject:("New form submission" OR "Book a Consultation" OR "Submit Request"))',
  statuses: {
    intakeReceived: 'פנייה התקבלה',
    optionsSent: 'נשלח מייל תיאום',
    manualScheduling: 'צריך תיאום ידני',
    bookedNeedsCall: 'נקבע ביומן - צריך להתקשר',
    duplicateUpdated: 'פנייה כפולה עודכנה',
    slotUnavailable: 'המועד נתפס - צריך תיאום חדש',
    prepEmailSent: 'נשלח מייל הכנה',
    prepFormsMissing: 'טפסי הכנה חסרים',
    rescheduleRequested: 'מבקש/ת לתאם מחדש',
    arrivalConfirmed: 'אישור הגעה התקבל',
    consultationSummarySent: 'נשלח סיכום ייעוץ',
    treatmentCareSent: 'נשלחו הנחיות לאחר טיפול',
    treatmentCheckInSent: 'נשלחה בדיקת מצב 48 שעות',
    doctorReviewNeeded: 'צריך בדיקת רופא',
    whatsappDraftReady: 'טיוטת WhatsApp מוכנה',
  },
  brand: {
    ink: '#263432',
    muted: '#637673',
    sage: '#9fbcb7',
    sageDark: '#98b7b4',
    blush: '#f0e9d7',
    ivory: '#f3f3f1',
    gold: '#9fbcb7',
  },
};

const LINNEA_SCHEDULED_TRIGGERS = [
  { handler: 'processNewIntakeEmails', cadence: 'minutes', interval: CONFIG.intakeCheckEveryMinutes },
  { handler: 'sendPrepEmails24HoursBefore', cadence: 'hours', interval: 1 },
  { handler: 'monitorPrepFormCompletion', cadence: 'hours', interval: 1 },
  { handler: 'processPatientJourneyMessages', cadence: 'hours', interval: 1 },
];

const LINNEA_LEGACY_REPORT_TRIGGERS = [
  'sendDailyClinicBrief',
  'sendWeeklyPerformanceSummary',
];

function setupLinneaAutomation() {
  ensureLabel_();
  ensureLeadSheet_();
  ensurePrepForm_();
  repairLinneaAutomationSchedule();
}

function quickDeploymentCheck() {
  const rawUrl = String(CONFIG.webAppUrl || '').trim();
  const url = getWebAppUrl_();
  const report = [
    `Raw CONFIG.webAppUrl: ${rawUrl || '(empty)'}`,
    `Normalized URL: ${url || '(empty)'}`,
    `Contains /u/<number>: ${/\/macros\/u\/\d+\//.test(url) ? 'YES - broken' : 'NO'}`,
    `Ends with /exec: ${/\/exec$/.test(url) ? 'YES' : 'NO - broken'}`,
  ];

  if (!url) throw new Error(report.concat('Missing webAppUrl.').join('\n'));

  const response = UrlFetchApp.fetch(url, {
    followRedirects: true,
    muteHttpExceptions: true,
  });
  const body = response.getContentText();
  const status = response.getResponseCode();
  const looksLikeDriveError =
    body.indexOf('unable to open the file') !== -1 ||
    body.indexOf('Get stuff done with Google Drive') !== -1;
  const looksLikeLinnea = body.indexOf('Linnéa aesthetics') !== -1 || body.indexOf('ברוכים הבאים ל-Linnéa') !== -1;

  report.push(`HTTP status: ${status}`);
  report.push(`Looks like Linnea page: ${looksLikeLinnea ? 'YES' : 'NO'}`);
  report.push(`Looks like Google Drive error: ${looksLikeDriveError ? 'YES - deployment/access problem' : 'NO'}`);
  report.push(`Response preview: ${body.slice(0, 500)}`);

  Logger.log(report.join('\n'));

  if (looksLikeDriveError || !looksLikeLinnea) {
    throw new Error([
      report.join('\n'),
      '',
      'Fix in Apps Script:',
      '1. Click Deploy > Manage deployments.',
      '2. If there is no Web app deployment, click New deployment > Web app.',
      '3. Set Execute as: Me.',
      '4. Set Who has access: Anyone.',
      '5. Save as a NEW VERSION.',
      '6. Copy the Web app URL from that deployment. Do not copy the editor URL or deployment ID manually.',
    ].join('\n'));
  }

  return report.join('\n');
}

function debugIntakeEmails() {
  const threads = GmailApp.search(CONFIG.sourceQuery, 0, 10);
  Logger.log(`Query: ${CONFIG.sourceQuery}`);
  Logger.log(`Threads found: ${threads.length}`);

  threads.forEach((thread, index) => {
    const messages = thread.getMessages();
    const message = messages[messages.length - 1];
    const patient = parseIntakeEmail_(message);
    Logger.log([
      `--- Thread ${index + 1} ---`,
      `Subject: ${message.getSubject()}`,
      `From: ${message.getFrom()}`,
      `Date: ${message.getDate()}`,
      `Extracted name: ${patient.name || '(missing)'}`,
      `Extracted email: ${patient.email || '(missing)'}`,
      `Extracted phone: ${patient.phone || '(missing)'}`,
      `Extracted interest: ${patient.interest || '(missing)'}`,
      `Body preview: ${message.getPlainBody().slice(0, 700)}`,
    ].join('\n'));
  });
}

function listLinneaTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  Logger.log(`Triggers found: ${triggers.length}`);
  triggers.forEach((trigger, index) => {
    Logger.log([
      `--- Trigger ${index + 1} ---`,
      `Handler: ${trigger.getHandlerFunction()}`,
      `Source: ${trigger.getTriggerSource()}`,
      `Event type: ${trigger.getEventType()}`,
    ].join('\n'));
  });
}

function repairLinneaAutomationSchedule() {
  deleteTriggersForHandlers_(LINNEA_SCHEDULED_TRIGGERS.map(item => item.handler).concat(LINNEA_LEGACY_REPORT_TRIGGERS, 'onPrepFormSubmit'));
  LINNEA_SCHEDULED_TRIGGERS.forEach(item => {
    createTimeTriggerIfMissing_(item.handler, item.cadence, item.interval);
  });
  ensurePrepFormSubmitTrigger_(ensurePrepForm_());
  Logger.log('Linnea schedule repaired: duplicate triggers removed, legacy report triggers removed, and clean cadence installed.');
}

function emergencyStopLinneaScheduledEmails() {
  deleteTriggersForHandlers_(LINNEA_SCHEDULED_TRIGGERS.map(item => item.handler).concat(LINNEA_LEGACY_REPORT_TRIGGERS));
  Logger.log('Scheduled Linnea email triggers stopped. Web app booking links and form-submit trigger remain active.');
}

function runOnceNow() {
  processNewIntakeEmails();
}

function runPrepReminderOnceNow() {
  sendPrepEmails24HoursBefore();
}

function runPatientJourneyOnceNow() {
  processPatientJourneyMessages();
}

function runPrepMonitorOnceNow() {
  monitorPrepFormCompletion();
}

function rebuildPrepFormTemplate() {
  const form = getOrCreatePrepForm_();
  form.getItems().slice().reverse().forEach(item => form.deleteItem(item));
  configurePrepForm_(form);
  buildPrepForm_(form);
  ensurePrepFormSubmitTrigger_(form);
  return `Prep form rebuilt: ${form.getEditUrl()}`;
}

function runDailyBriefOnceNow() {
  sendDailyClinicBrief(true);
}

function runWeeklySummaryOnceNow() {
  sendWeeklyPerformanceSummary(true);
}

function sendLatestIntakePreviewToClinic() {
  const patient = latestIntakePatientForTest_();
  const now = new Date();
  const slots = [
    addMinutes_(nextDateAtTime_(1, '10:00'), 0),
    addMinutes_(nextDateAtTime_(1, '11:30'), 0),
    addMinutes_(nextDateAtTime_(5, '09:45'), 0),
  ].map((start, index) => ({
    label: formatSlotForButton_(start),
    href: `${CONFIG.siteUrl}?preview=booking-option-${index + 1}`,
  }));
  const appointmentStart = slots[0] ? nextDateAtTime_(1, '10:00') : addMinutes_(now, 24 * 60);
  const appointmentEnd = addMinutes_(appointmentStart, CONFIG.appointmentMinutes);
  const prepUrl = createPrefilledPrepFormUrl_('TEST-PREVIEW-ROW', 'TEST-PREVIEW-EVENT', patient, appointmentStart);

  sendPreviewHtmlEmail_('[בדיקה] מייל בחירת מועד', bookingOptionsEmail_(patient, slots));
  sendPreviewHtmlEmail_('[בדיקה] מייל אישור תור', confirmationEmail_(patient, appointmentStart));
  sendPreviewHtmlEmail_('[בדיקה] מייל טפסי הכנה 24 שעות לפני', prepEmailHtml_(patient, appointmentStart, prepUrl));
  sendPreviewHtmlEmail_('[בדיקה] מייל סיכום ייעוץ', consultationSummaryEmailHtml_(patient, 'בייעוץ הוצעה תוכנית הדרגתית ועדינה לשיפור איכות העור והרמוניית הפנים.', 'תיאום טיפול ראשון לאחר אישור רפואי.'));
  sendPreviewHtmlEmail_('[בדיקה] מייל הנחיות לאחר טיפול', postTreatmentCareEmailHtml_(patient, 'טיפול אסתטי', 'להימנע ממגע או עיסוי באזור הטיפול.\nלהימנע מפעילות גופנית מאומצת ב-24 השעות הראשונות.\nבכל תחושה חריגה, יש ליצור קשר עם המרפאה.'));
  sendPreviewHtmlEmail_('[בדיקה] מייל בדיקת מצב 48 שעות', treatmentCheckInEmailHtml_(patient, 'טיפול אסתטי'));

  Logger.log(`Sent preview emails to ${CONFIG.clinicEmail}`);
  Logger.log(`Patient preview source: ${patient.name} / ${patient.email} / ${patient.phone || ''}`);
  Logger.log(`Prep form preview URL: ${prepUrl}`);
}

function createEndToEndTestFromLatestIntake() {
  const sourcePatient = latestIntakePatientForTest_();
  const testPatient = Object.assign({}, sourcePatient, {
    name: `${sourcePatient.name} - בדיקה`,
    email: CONFIG.clinicEmail,
    notes: [
      sourcePatient.notes || '',
      `בדיקת מערכת על בסיס פנייה מקורית של ${sourcePatient.name} (${sourcePatient.email}).`,
      'אפשר לבחור מועד מהמייל שיגיע לקליניקה; ייווצר אירוע בדיקה ביומן.',
    ].filter(Boolean).join('\n'),
  });
  const rowId = appendLeadRow_(testPatient, null, CONFIG.statuses.intakeReceived);
  sendBookingOptions_(testPatient, rowId);
  Logger.log(`Created test lead ${rowId} and sent booking options to ${CONFIG.clinicEmail}`);
}

function sendPrepEmails24HoursBefore() {
  return withScriptLock_('sendPrepEmails24HoursBefore', () => {
    const rows = getLeadRows_();
    const now = new Date();
    const minTime = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const maxTime = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    rows.forEach(row => {
      const appointmentStart = row['Appointment Start'] ? new Date(row['Appointment Start']) : null;
      if (!appointmentStart || Number.isNaN(appointmentStart.getTime())) return;
      if (appointmentStart < minTime || appointmentStart > maxTime) return;
      if (row['Prep Form Sent At']) return;
      if (row.Status === CONFIG.statuses.arrivalConfirmed) return;

      const patient = {
        name: row['Patient Name'],
        email: row.Email,
        phone: row.Phone,
        interest: row.Interest,
        notes: row.Notes,
        communicationProfile: row['Communication Profile'] || CONFIG.defaultCommunicationProfile,
        whatsappConsent: isTruthy_(row['WhatsApp Consent']),
      };
      if (!patient.email || !patient.name) return;

      const prepUrl = createPrefilledPrepFormUrl_(row['Row ID'], row['Calendar Event ID'], patient, appointmentStart);
      sendPrepEmail_(patient, appointmentStart, prepUrl);
      const whatsappDraftLink = shouldPrepareWhatsAppDraft_(patient, 'prep')
        ? buildWhatsAppLink_(patient.phone, prepReminderWhatsAppText_(patient, appointmentStart))
        : '';
      updateLeadStatus_(row['Row ID'], CONFIG.statuses.prepEmailSent, {
        clinicStatus: CONFIG.statuses.prepEmailSent,
        leadStage: 'Forms sent',
        prepFormSentAt: new Date(),
        prepFormUrl: prepUrl,
        whatsappDraftLink,
      });
    });
  });
}

function monitorPrepFormCompletion() {
  return withScriptLock_('monitorPrepFormCompletion', () => {
    const rows = getLeadRows_();
    const now = new Date();

    rows.forEach(row => {
      const appointmentStart = row['Appointment Start'] ? new Date(row['Appointment Start']) : null;
      const prepSentAt = row['Prep Form Sent At'] ? new Date(row['Prep Form Sent At']) : null;
      if (!appointmentStart || Number.isNaN(appointmentStart.getTime())) return;
      if (!prepSentAt || Number.isNaN(prepSentAt.getTime())) return;
      if (row['Prep Form Submitted At']) return;
      if (appointmentStart <= now) return;

      const patient = patientFromRow_(row);
      const hoursSincePrepSent = (now.getTime() - prepSentAt.getTime()) / 3600000;
      const hoursUntilAppointment = (appointmentStart.getTime() - now.getTime()) / 3600000;
      const updates = {};

      if (!row['Missing Forms Reminder At'] && hoursSincePrepSent >= CONFIG.prepReminderHoursAfterSend) {
        updates.missingFormsReminderAt = now;
        updates.whatsappDraftLink = shouldPrepareWhatsAppDraft_(patient, 'prep')
          ? buildWhatsAppLink_(patient.phone, prepReminderWhatsAppText_(patient, appointmentStart))
          : '';
        updates.followUpTask = 'טפסי הכנה טרם מולאו - לשלוח תזכורת עדינה';
        updates.clinicStatus = CONFIG.statuses.prepFormsMissing;
      }

      if (!row['Forms Escalation At'] && hoursUntilAppointment <= CONFIG.prepEscalationHoursBefore) {
        updates.formsEscalationAt = now;
        updates.followUpTask = 'טפסי הכנה חסרים פחות מ-3 שעות לפני הפגישה - ליצור קשר ידני';
        updates.clinicStatus = CONFIG.statuses.prepFormsMissing;
        updateCalendarEventStatus_(row['Calendar Event ID'], CONFIG.statuses.prepFormsMissing, [
          '',
          'טפסי הכנה עדיין לא מולאו.',
          `עודכן אוטומטית: ${Utilities.formatDate(now, CONFIG.timezone, 'dd/MM/yyyy HH:mm')}`,
        ].join('\n'));
      }

      if (Object.keys(updates).length > 0) {
        updateLeadStatus_(row['Row ID'], CONFIG.statuses.prepFormsMissing, updates);
      }
    });
  });
}

function onPrepFormSubmit(e) {
  const values = e && e.namedValues ? e.namedValues : {};
  const rowId = firstValue_(values['קוד פנייה פנימי']);
  const eventId = firstValue_(values['Calendar Event ID']);
  const attendance = firstValue_(values['אישור הגעה']);
  const medicalAlerts = summarizeMedicalAlerts_(values);
  const prepNotes = summarizePrepNotes_(values);
  const consentSignature = firstValue_(values['חתימה דיגיטלית - שם מלא']);

  if (!rowId) throw new Error('Missing row ID in prep form submission.');

  const nextStatus = attendance && attendance.indexOf('חדש') !== -1
    ? CONFIG.statuses.rescheduleRequested
    : CONFIG.statuses.arrivalConfirmed;

  updateLeadStatus_(rowId, nextStatus, {
    clinicStatus: nextStatus,
    leadStage: nextStatus === CONFIG.statuses.rescheduleRequested ? 'Reschedule requested' : 'Confirmed',
    prepFormSubmittedAt: new Date(),
    attendanceConfirmation: attendance || CONFIG.statuses.arrivalConfirmed,
    medicalAlerts,
    prepNotes,
    consentSignature,
    followUpTask: nextStatus === CONFIG.statuses.rescheduleRequested ? 'המטופל/ת ביקש/ה לתאם מועד חדש' : '',
  });

  updateCalendarEventStatus_(eventId, nextStatus, [
    '',
    'טפסי הכנה מולאו על ידי המטופל/ת.',
    `אישור הגעה: ${attendance || CONFIG.statuses.arrivalConfirmed}`,
    medicalAlerts ? `דגשים רפואיים: ${medicalAlerts}` : '',
    prepNotes ? `הערות מטופל/ת: ${prepNotes}` : '',
    `עודכן אוטומטית: ${Utilities.formatDate(new Date(), CONFIG.timezone, 'dd/MM/yyyy HH:mm')}`,
  ].filter(Boolean).join('\n'));

  const patientName = firstValue_(values['שם מלא']);
  GmailApp.sendEmail(CONFIG.clinicEmail, `אישור הגעה וטפסים מולאו - ${patientName || rowId}`, [
    'המטופל/ת מילא/ה את טפסי ההכנה ואישר/ה הגעה.',
    '',
    `שם: ${patientName || 'לא נמסר'}`,
    `סטטוס חדש: ${nextStatus}`,
    medicalAlerts ? `דגשים רפואיים: ${medicalAlerts}` : '',
    prepNotes ? `הערות מטופל/ת: ${prepNotes}` : '',
    `Row ID: ${rowId}`,
  ].filter(Boolean).join('\n'), {
    name: CONFIG.clinicName,
  });
}

function processPatientJourneyMessages() {
  return withScriptLock_('processPatientJourneyMessages', () => {
    if (isPatientQuietTime_()) return;
    const rows = getLeadRows_();
    const now = new Date();

    rows.forEach(row => {
      const patient = patientFromRow_(row);
      if (!patient.email || !patient.name) return;

      if (row['Consultation Summary'] && !row['Consultation Summary Sent At']) {
        if (shouldSendEmail_(patient, 'consultationSummary')) {
          sendConsultationSummaryEmail_(patient, row['Consultation Summary'], row['Next Recommended Action']);
        }
        updateLeadStatus_(row['Row ID'], CONFIG.statuses.consultationSummarySent, {
          clinicStatus: CONFIG.statuses.consultationSummarySent,
          consultationSummarySentAt: now,
          whatsappDraftLink: shouldPrepareWhatsAppDraft_(patient, 'consultationSummary')
            ? buildWhatsAppLink_(patient.phone, consultationSummaryWhatsAppText_(patient, row['Next Recommended Action']))
            : '',
        });
      }

      const treatmentDate = row['Treatment Date'] ? new Date(row['Treatment Date']) : null;
      if (!treatmentDate || Number.isNaN(treatmentDate.getTime())) return;
      if (!row['Treatment Type']) return;

      if (!row['Treatment Care Sent At'] && treatmentDate <= now) {
        if (shouldSendEmail_(patient, 'postTreatmentCare')) {
          sendPostTreatmentCareEmail_(patient, row['Treatment Type'], row['Care Notes']);
        }
        updateLeadStatus_(row['Row ID'], CONFIG.statuses.treatmentCareSent, {
          clinicStatus: CONFIG.statuses.treatmentCareSent,
          treatmentCareSentAt: now,
          whatsappDraftLink: shouldPrepareWhatsAppDraft_(patient, 'postTreatmentCare')
            ? buildWhatsAppLink_(patient.phone, postTreatmentCareWhatsAppText_(patient, row['Treatment Type']))
            : '',
        });
      }

      const checkInTime = new Date(treatmentDate.getTime() + 48 * 60 * 60 * 1000);
      if (!row['48h Check-in Sent At'] && now >= checkInTime) {
        if (shouldSendEmail_(patient, 'checkIn48h')) {
          sendTreatmentCheckInEmail_(patient, row['Treatment Type']);
        }
        updateLeadStatus_(row['Row ID'], CONFIG.statuses.treatmentCheckInSent, {
          clinicStatus: CONFIG.statuses.treatmentCheckInSent,
          checkIn48hSentAt: now,
          satisfactionStatus: 'ממתין לתגובה',
          whatsappDraftLink: shouldPrepareWhatsAppDraft_(patient, 'checkIn48h')
            ? buildWhatsAppLink_(patient.phone, treatmentCheckInWhatsAppText_(patient, row['Treatment Type']))
            : '',
        });
      }

      if (satisfactionNeedsDoctorReview_(row['Satisfaction Status']) && !isTruthy_(row['Doctor Review Flag'])) {
        updateLeadStatus_(row['Row ID'], CONFIG.statuses.doctorReviewNeeded, {
          clinicStatus: CONFIG.statuses.doctorReviewNeeded,
          doctorReviewFlag: 'כן',
          followUpTask: 'תגובה לאחר טיפול דורשת בדיקת רופא',
        });
      }
    });
  });
}

function sendDailyClinicBrief(force) {
  return withScriptLock_('sendDailyClinicBrief', () => {
    if (!force && !CONFIG.automaticClinicBriefsEnabled) return;

    const localHour = Number(Utilities.formatDate(new Date(), CONFIG.timezone, 'H'));
    if (!force && (localHour < CONFIG.clinicBriefHourWindow.start || localHour > CONFIG.clinicBriefHourWindow.end)) return;

    const todayKey = Utilities.formatDate(new Date(), CONFIG.timezone, 'yyyy-MM-dd');
    const props = PropertiesService.getScriptProperties();
    if (!force && props.getProperty('LINNEA_DAILY_BRIEF_SENT') === todayKey) return;

    const rows = getLeadRows_();
    const todayRows = rows.filter(row => isSameLocalDate_(row['Appointment Start'], new Date()));
    const needsCall = rows.filter(row => String(row['Clinic Status'] || row.Status || '').indexOf('להתקשר') !== -1);
    const missingForms = rows.filter(row => row['Prep Form Sent At'] && !row['Prep Form Submitted At'] && row['Appointment Start']);
    const followUps = rows.filter(row => row['Follow-up Task']);
    const hasActionableItems = todayRows.length || needsCall.length || missingForms.length || followUps.length;
    if (!force && !CONFIG.sendEmptyDailyBrief && !hasActionableItems) {
      props.setProperty('LINNEA_DAILY_BRIEF_SENT', todayKey);
      return;
    }

    const body = [
      `בוקר טוב, זה הבריף היומי של Linnéa ל-${todayKey}.`,
      '',
      `פגישות היום: ${todayRows.length}`,
      formatRowsForBrief_(todayRows, ['Patient Name', 'Phone', 'Selected Slot', 'Clinic Status']),
      '',
      `צריך להתקשר: ${needsCall.length}`,
      formatRowsForBrief_(needsCall, ['Patient Name', 'Phone', 'Clinic Status', 'Follow-up Task']),
      '',
      `טפסים חסרים: ${missingForms.length}`,
      formatRowsForBrief_(missingForms, ['Patient Name', 'Phone', 'Appointment Start', 'Follow-up Task']),
      '',
      `משימות פתוחות: ${followUps.length}`,
      formatRowsForBrief_(followUps, ['Patient Name', 'Phone', 'Follow-up Task']),
    ].join('\n');

    GmailApp.sendEmail(CONFIG.clinicEmail, `בריף יומי Linnéa - ${todayKey}`, body, {
      name: CONFIG.clinicName,
    });
    props.setProperty('LINNEA_DAILY_BRIEF_SENT', todayKey);
  });
}

function sendWeeklyPerformanceSummary(force) {
  return withScriptLock_('sendWeeklyPerformanceSummary', () => {
    if (!force && !CONFIG.automaticWeeklySummaryEnabled) return;

    const now = new Date();
    const dayOfWeek = Number(Utilities.formatDate(now, CONFIG.timezone, 'u'));
    if (!force && dayOfWeek !== 1) return;

    const weekKey = Utilities.formatDate(now, CONFIG.timezone, 'yyyy-ww');
    const props = PropertiesService.getScriptProperties();
    if (!force && props.getProperty('LINNEA_WEEKLY_SUMMARY_SENT') === weekKey) return;

    const rows = getLeadRows_();
    const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentRows = rows.filter(row => {
      const createdAt = row['Created At'] ? new Date(row['Created At']) : null;
      return createdAt && !Number.isNaN(createdAt.getTime()) && createdAt >= since;
    });
    const bookedRows = recentRows.filter(row => row['Appointment Start']);
    const manualRows = recentRows.filter(row => row.Status === CONFIG.statuses.manualScheduling || row['Clinic Status'] === CONFIG.statuses.manualScheduling);
    const prepSentRows = rows.filter(row => row['Prep Form Sent At']);
    const prepSubmittedRows = prepSentRows.filter(row => row['Prep Form Submitted At']);
    const treatmentCounts = countBy_(recentRows, 'Interest');

    const body = [
      `סיכום שבועי Linnéa - ${weekKey}`,
      '',
      `לידים חדשים: ${recentRows.length}`,
      `תורים שנקבעו: ${bookedRows.length}`,
      `תיאומים ידניים: ${manualRows.length}`,
      `שיעור מילוי טפסים: ${prepSentRows.length ? Math.round((prepSubmittedRows.length / prepSentRows.length) * 100) : 0}%`,
      '',
      'תחומי עניין מובילים:',
      Object.keys(treatmentCounts).length
        ? Object.keys(treatmentCounts).map(key => `- ${key || 'לא צוין'}: ${treatmentCounts[key]}`).join('\n')
        : '- אין נתונים השבוע',
    ].join('\n');

    GmailApp.sendEmail(CONFIG.clinicEmail, `סיכום שבועי Linnéa - ${weekKey}`, body, {
      name: CONFIG.clinicName,
    });
    props.setProperty('LINNEA_WEEKLY_SUMMARY_SENT', weekKey);
  });
}

function doPost(e) {
  return jsonResponse_({ ok: false, error: 'This automation reads intake details from Gmail only.' }, 405);
}

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  if (params.action !== 'book') {
    return HtmlService.createHtmlOutput(statusPage_(
      'ברוכים הבאים ל-Linnéa',
      'קישור הזימון מוכן. יש לבחור מועד מתוך המייל שקיבלתם.',
      false
    ));
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const booking = readBookingToken_(params.token);
    if (!booking) {
      return HtmlService.createHtmlOutput(statusPage_(
        'הקישור לא זמין',
        'נראה שהקישור פג תוקף או שכבר נעשה בו שימוש. אפשר להשיב למייל ונציע מועד חדש.',
        false
      ));
    }

    const selected = booking.slots.find(slot => slot.id === params.slot);
    if (!selected) {
      return HtmlService.createHtmlOutput(statusPage_(
        'לא מצאנו את המועד',
        'המועד שבחרת לא קיים בקישור הזה. כדאי לחזור למייל ולבחור אפשרות אחרת.',
        false
      ));
    }

    const start = new Date(selected.start);
    const end = new Date(selected.end);
    if (!isSlotAvailable_(start, end)) {
      sendNoLongerAvailableEmail_(booking.patient, selected);
      updateLeadStatus_(booking.rowId, CONFIG.statuses.slotUnavailable, {
        selectedSlot: formatSlotForButton_(start),
      });
      return HtmlService.createHtmlOutput(statusPage_(
        'המועד נתפס ממש עכשיו',
        'שלחנו לך מייל קצר כדי לתאם מועד חדש. סליחה על זה, קורה לפעמים כשכמה אנשים בוחרים יחד.',
        false
      ));
    }

    const event = createConsultationEvent_(booking.patient, start, end);
    deleteBookingToken_(params.token);
    updateLeadStatus_(booking.rowId, CONFIG.statuses.bookedNeedsCall, {
      appointmentStart: start,
      appointmentEnd: end,
      selectedSlot: formatSlotForButton_(start),
      calendarEventId: event.getId(),
      clinicStatus: CONFIG.statuses.bookedNeedsCall,
      leadStage: 'Booked',
      followUpTask: 'לחייג למטופל/ת כדי לאשר התאמה לפני הפגישה',
    });
    sendPatientConfirmation_(booking.patient, start, end, event.getId());
    sendClinicNotification_(booking.patient, start, end, event.getId());

    return HtmlService.createHtmlOutput(statusPage_(
      'התור נקבע בהצלחה ✨',
      'ניפגש בקליניקה בדרך מנחם בגין 150, תל אביב. שלחנו אליך גם מייל אישור עם כל הפרטים.',
      true
    ));
  } finally {
    lock.releaseLock();
  }
}

function processNewIntakeEmails() {
  return withScriptLock_('processNewIntakeEmails', () => {
    if (isPatientQuietTime_()) {
      Logger.log('Skipped intake processing during patient quiet hours.');
      return;
    }

    const label = ensureLabel_();
    const threads = GmailApp.search(CONFIG.sourceQuery, 0, 10);

    threads.forEach(thread => {
      const messages = thread.getMessages();
      const message = messages[messages.length - 1];
      const patient = parseIntakeEmail_(message);

      if (patient.email && patient.name) {
        const duplicate = findDuplicateLead_(patient, CONFIG.duplicateWindowDays);
        if (duplicate) {
          updateDuplicateLead_(duplicate, patient, message);
          thread.addLabel(label);
          return;
        }

        const rowId = appendLeadRow_(patient, message, CONFIG.statuses.intakeReceived);
        sendBookingOptions_(patient, rowId);
        thread.addLabel(label);
      }
    });
  });
}

function findDuplicateLead_(patient, windowDays) {
  const rows = getLeadRows_();
  const cutoff = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  const email = String(patient.email || '').trim().toLowerCase();
  const phone = normalizePhoneForCompare_(patient.phone);

  return rows.find(row => {
    const createdAt = row['Created At'] ? new Date(row['Created At']) : null;
    if (!createdAt || Number.isNaN(createdAt.getTime()) || createdAt < cutoff) return false;
    if (email && String(row.Email || '').trim().toLowerCase() === email) return true;
    if (phone && normalizePhoneForCompare_(row.Phone) === phone) return true;
    return false;
  });
}

function updateDuplicateLead_(duplicateRow, patient, message) {
  const duplicateCount = Number(duplicateRow['Duplicate Count'] || 0) + 1;
  const mergedNotes = [
    duplicateRow.Notes || '',
    patient.notes ? `פנייה חוזרת: ${patient.notes}` : '',
  ].filter(Boolean).join('\n\n');

  updateLeadStatus_(duplicateRow['Row ID'], duplicateRow.Status || CONFIG.statuses.duplicateUpdated, {
    clinicStatus: CONFIG.statuses.duplicateUpdated,
    leadStage: duplicateRow['Lead Stage'] || 'Duplicate updated',
    patientName: patient.name || duplicateRow['Patient Name'],
    email: patient.email || duplicateRow.Email,
    phone: patient.phone || duplicateRow.Phone,
    interest: patient.interest || duplicateRow.Interest,
    notes: mergedNotes,
    sourceSubject: message ? message.getSubject() : duplicateRow['Source Subject'],
    sourceMessageId: message ? message.getId() : duplicateRow['Source Message ID'],
    pageUrl: patient.pageUrl || duplicateRow['Page URL'],
    pageLanguage: patient.pageLanguage || duplicateRow['Page Language'],
    utmSource: patient.utmSource || duplicateRow['UTM Source'],
    utmMedium: patient.utmMedium || duplicateRow['UTM Medium'],
    utmCampaign: patient.utmCampaign || duplicateRow['UTM Campaign'],
    utmTerm: patient.utmTerm || duplicateRow['UTM Term'],
    utmContent: patient.utmContent || duplicateRow['UTM Content'],
    serviceConsent: patient.serviceConsent || duplicateRow['Service Consent'],
    privacyConsent: patient.privacyConsent || duplicateRow['Privacy Consent'],
    emailUpdatesConsent: patient.emailUpdatesConsent || duplicateRow['Email Updates Consent'],
    communicationProfile: patient.communicationProfile || duplicateRow['Communication Profile'],
    whatsappConsent: patient.whatsappConsent || duplicateRow['WhatsApp Consent'],
    duplicateCount,
    lastDuplicateAt: new Date(),
    followUpTask: 'פנייה כפולה: לבדוק אם צריך מענה ידני נוסף',
    leadScore: calculateLeadReadiness_(patient).score,
    urgency: calculateLeadReadiness_(patient).urgency,
  });

  sendClinicDuplicateNotification_(duplicateRow, patient, duplicateCount);
}

function sendBookingOptions_(patient, rowId) {
  const slots = findAvailableSlots_(new Date(), CONFIG.maxSlotsInEmail);
  if (slots.length < CONFIG.maxSlotsInEmail) {
    sendManualSchedulingEmail_(patient);
    updateLeadStatus_(rowId, CONFIG.statuses.manualScheduling, {
      clinicStatus: CONFIG.statuses.manualScheduling,
      leadStage: 'Needs manual scheduling',
      followUpTask: 'לא נמצאו מספיק מועדים אוטומטיים - לתאם ידנית',
    });
    return;
  }

  const token = createBookingToken_(patient, slots, rowId);
  const url = getWebAppUrl_();
  if (!url) {
    updateLeadStatus_(rowId, CONFIG.statuses.manualScheduling, {
      clinicStatus: CONFIG.statuses.manualScheduling,
      lastError: 'Missing Web App URL. Deploy the Apps Script as a Web App and paste the /exec URL into CONFIG.webAppUrl.',
    });
    throw new Error('Missing Web App URL. Paste the deployed /exec URL into CONFIG.webAppUrl.');
  }

  const buttons = slots.map(slot => ({
    label: formatSlotForButton_(new Date(slot.start)),
    href: `${url}?action=book&token=${encodeURIComponent(token)}&slot=${encodeURIComponent(slot.id)}`,
  }));

  const subject = 'נבחר לך זמן לייעוץ ב-Linnéa ✨';
  const htmlBody = bookingOptionsEmail_(patient, buttons);
  GmailApp.sendEmail(patient.email, subject, stripHtml_(htmlBody), {
    name: CONFIG.clinicName,
    htmlBody,
    replyTo: CONFIG.clinicEmail,
  });

  updateLeadStatus_(rowId, CONFIG.statuses.optionsSent, {
    offeredSlots: slots.map(slot => formatSlotForButton_(new Date(slot.start))).join(' | '),
    clinicStatus: CONFIG.statuses.optionsSent,
    leadStage: 'Booking options sent',
  });
}

function createConsultationEvent_(patient, start, end) {
  const clinicStatus = CONFIG.statuses.bookedNeedsCall;
  const title = `ייעוץ Linnéa - ${patient.name} | ${clinicStatus}`;
  const description = [
    'פגישת ייעוץ אסתטי - 45 דקות',
    `סטטוס פנימי: ${clinicStatus}`,
    '',
    `שם המטופל/ת: ${patient.name}`,
    `טלפון לאישור הטיפול: ${patient.phone || 'לא נמסר'}`,
    `אימייל: ${patient.email || 'לא נמסר'}`,
    `תחום עניין: ${patient.interest || 'לא נמסר'}`,
    patient.notes ? `הערות: ${patient.notes}` : '',
    '',
    'משימה לצוות: לחייג למטופל/ת לפני הפגישה כדי לאשר התאמה ופרטים רפואיים רלוונטיים.',
  ].filter(Boolean).join('\n');

  const calendar = CalendarApp.getCalendarById(CONFIG.calendarId);
  const event = calendar.createEvent(title, start, end, {
    description,
    location: CONFIG.clinicAddress,
    guests: patient.email,
    sendInvites: false,
  });
  event.addEmailReminder(24 * 60);
  event.addPopupReminder(24 * 60);
  event.setColor(CalendarApp.EventColor.PALE_GREEN);
  return event;
}

function findAvailableSlots_(fromDate, limit) {
  const slots = [];
  const cursor = new Date(fromDate);
  cursor.setHours(0, 0, 0, 0);

  for (let i = 0; i <= CONFIG.bookingLookaheadDays && slots.length < limit; i++) {
    const day = new Date(cursor);
    day.setDate(cursor.getDate() + i);
    const dayOfWeek = Number(Utilities.formatDate(day, CONFIG.timezone, 'u')) % 7;

    if (!CONFIG.bookingDays.includes(dayOfWeek)) continue;

    const ranges = CONFIG.workingHours[dayOfWeek] || [];
    ranges.forEach(range => {
      const rangeStart = dateAtTime_(day, range.start);
      const rangeEnd = dateAtTime_(day, range.end);
      let start = new Date(rangeStart);

      while (start.getTime() + CONFIG.appointmentMinutes * 60000 <= rangeEnd.getTime() && slots.length < limit) {
        const end = new Date(start.getTime() + CONFIG.appointmentMinutes * 60000);
        if (start > fromDate && isSlotAvailable_(start, end)) {
          slots.push({
            id: Utilities.getUuid().slice(0, 8),
            start: start.toISOString(),
            end: end.toISOString(),
          });
        }
        start = new Date(start.getTime() + CONFIG.slotStepMinutes * 60000);
      }
    });
  }

  return slots;
}

function isSlotAvailable_(start, end) {
  const calendar = CalendarApp.getCalendarById(CONFIG.calendarId);
  return calendar.getEvents(start, end).length === 0;
}

function bookingOptionsEmail_(patient, buttons) {
  const buttonHtml = buttons.map(button => `
    <tr>
      <td style="padding:8px 0;">
        <a href="${button.href}" style="display:block;text-align:center;background:${CONFIG.brand.sageDark};color:#fff;text-decoration:none;border-radius:999px;padding:14px 18px;font-weight:700;font-size:16px;">
          ${button.label}
        </a>
        <div style="padding-top:6px;text-align:center;font-size:12px;line-height:1.5;">
          <a href="${button.href}" style="color:${CONFIG.brand.sageDark};text-decoration:underline;">אם הכפתור לא נפתח, אפשר ללחוץ כאן</a>
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <!doctype html>
    <html lang="he" dir="rtl">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body dir="rtl" style="margin:0;padding:0;background:${CONFIG.brand.ivory};font-family:Arial,'Helvetica Neue',sans-serif;color:${CONFIG.brand.ink};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CONFIG.brand.ivory};padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border:1px solid ${CONFIG.brand.blush};border-radius:22px;overflow:hidden;">
              <tr>
                <td style="background:${CONFIG.brand.ink};padding:28px 24px;text-align:center;">
                  <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${CONFIG.brand.blush};">Linnéa aesthetics</div>
                  <h1 style="margin:10px 0 0;color:#fff;font-size:28px;line-height:1.25;font-weight:400;">היי ${escapeHtml_(patient.name)}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 24px;">
                  <p style="font-size:18px;line-height:1.7;margin:0 0 14px;">תודה שפנית ל-Linnéa. בדקנו עבורך את הזמינות הקרובה והכנו שלוש אפשרויות לפגישת ייעוץ אישית של 45 דקות.</p>
                  <p style="font-size:15px;line-height:1.7;color:${CONFIG.brand.muted};margin:0 0 22px;">בחירה באחד המועדים תשמור עבורך את הפגישה ותשלח אישור מסודר למייל.</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${buttonHtml}</table>
                  <div style="margin-top:24px;padding:18px;border-radius:18px;background:${CONFIG.brand.ivory};border:1px solid ${CONFIG.brand.blush};">
                    <p style="margin:0;font-size:15px;line-height:1.7;">אם אף מועד לא מתאים, אפשר להשיב למייל הזה עם ימים ושעות שנוחים לך, ונחזור עם אפשרות אחרת.</p>
                  </div>
                  <p style="font-size:14px;line-height:1.7;color:${CONFIG.brand.muted};margin:22px 0 0;">כתובת הקליניקה תישלח באישור הסופי לאחר בחירת המועד.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 24px;background:${CONFIG.brand.blush};text-align:center;color:${CONFIG.brand.ink};font-size:14px;">
                  Warm, luxurious, inviting, human · ${CONFIG.clinicPhone}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function confirmationEmail_(patient, start) {
  const dateText = formatSlotForButton_(start);
  return premiumEmailShell_(
    'הפגישה שלך נקבעה',
    'אישור תור',
    `
      <p style="margin:0 0 14px;">היי ${escapeHtml_(patient.name)}, שמרנו עבורך פגישת ייעוץ ל-${dateText}.</p>
      <p style="margin:0 0 14px;">כתובת הקליניקה: ${CONFIG.clinicAddress}<br><a href="${CONFIG.mapsUrl}" style="color:${CONFIG.brand.sageDark};font-weight:700;">פתיחה במפות</a></p>
      <p style="margin:0;">לקראת הפגישה נשלח מייל קצר עם טפסי הכנה ואישור הגעה. אם יש צורך לשנות משהו לפני כן, אפשר להשיב למייל הזה.</p>
    `
  );
}

function sendPatientConfirmation_(patient, start, end, eventId) {
  const htmlBody = confirmationEmail_(patient, start);
  GmailApp.sendEmail(patient.email, 'התור שלך ב-Linnéa נקבע ✨', stripHtml_(htmlBody), {
    name: CONFIG.clinicName,
    htmlBody,
    replyTo: CONFIG.clinicEmail,
  });
}

function sendClinicNotification_(patient, start, end, eventId) {
  const body = [
    'נקבע תור ייעוץ חדש.',
    '',
    `שם: ${patient.name}`,
    `טלפון: ${patient.phone || 'לא נמסר'}`,
    `אימייל: ${patient.email}`,
    `תחום עניין: ${patient.interest || 'לא נמסר'}`,
    `מועד: ${formatSlotForButton_(start)}`,
    '',
    'חשוב: לחייג למטופל/ת כדי לאשר התאמה לטיפול.',
  ].join('\n');

  GmailApp.sendEmail(CONFIG.clinicEmail, `תור ייעוץ חדש - ${patient.name}`, body, {
    name: CONFIG.clinicName,
  });
}

function sendManualSchedulingEmail_(patient) {
  const htmlBody = premiumEmailShell_(
    `היי ${escapeHtml_(patient.name)}`,
    'תיאום אישי',
    `
      <p style="margin:0 0 14px;">תודה שפנית ל-Linnéa. כרגע לא מצאנו שלושה מועדים פנויים שמתאימים אוטומטית ליומן.</p>
      <p style="margin:0;">אפשר להשיב למייל הזה עם ימים ושעות שנוחים לך, והצוות יחזור עם אפשרות מדויקת יותר.</p>
    `
  );

  GmailApp.sendEmail(patient.email, 'נתאם לך מועד ייעוץ ב-Linnéa ✨', stripHtml_(htmlBody), {
    name: CONFIG.clinicName,
    htmlBody,
    replyTo: CONFIG.clinicEmail,
  });
}

function sendPrepEmail_(patient, appointmentStart, prepUrl) {
  const htmlBody = prepEmailHtml_(patient, appointmentStart, prepUrl);
  GmailApp.sendEmail(patient.email, 'תזכורת וטפסי הכנה לפגישה שלך ב-Linnéa', stripHtml_(htmlBody), {
    name: CONFIG.clinicName,
    htmlBody,
    replyTo: CONFIG.clinicEmail,
  });
}

function prepEmailHtml_(patient, appointmentStart, prepUrl) {
  const dateText = formatSlotForButton_(appointmentStart);
  return premiumEmailShell_(
    'לקראת הפגישה שלך',
    'טפסי הכנה ואישור הגעה',
    `
      <p style="margin:0 0 14px;">היי ${escapeHtml_(patient.name)}, לקראת פגישת הייעוץ שלך ב-${dateText}, נשמח למילוי טופס הכנה קצר.</p>
      <p style="margin:0 0 14px;">הטופס כולל אישור הגעה, הסכמה מדעת והיסטוריה רפואית רלוונטית. המידע מאפשר לנו להגיע לפגישה מוכנים, קשובים ומדויקים יותר.</p>
      <p style="margin:24px 0;text-align:center;">
        <a href="${prepUrl}" style="display:inline-block;background:${CONFIG.brand.sageDark};color:#fff;text-decoration:none;border-radius:999px;padding:14px 22px;font-weight:700;font-size:16px;">מילוי טפסי הכנה</a>
      </p>
      <p style="font-size:14px;line-height:1.7;color:${CONFIG.brand.muted};margin:0;">אם הכפתור לא נפתח, אפשר להעתיק את הקישור הזה לדפדפן:<br><span style="direction:ltr;unicode-bidi:bidi-override;word-break:break-all;">${prepUrl}</span></p>
      <div style="margin-top:22px;padding:16px;border-radius:18px;background:${CONFIG.brand.ivory};border:1px solid ${CONFIG.brand.blush};">
        <p style="margin:0;">${CONFIG.clinicAddress}<br><a href="${CONFIG.mapsUrl}" style="color:${CONFIG.brand.sageDark};font-weight:700;">פתיחה במפות</a></p>
      </div>
    `
  );
}

function sendConsultationSummaryEmail_(patient, summary, nextStep) {
  const htmlBody = consultationSummaryEmailHtml_(patient, summary, nextStep);
  GmailApp.sendEmail(patient.email, 'סיכום הייעוץ שלך ב-Linnéa', stripHtml_(htmlBody), {
    name: CONFIG.clinicName,
    htmlBody,
    replyTo: CONFIG.clinicEmail,
  });
}

function consultationSummaryEmailHtml_(patient, summary, nextStep) {
  return premiumEmailShell_(
    `שמחנו לפגוש אותך`,
    'סיכום אישי מהייעוץ שלך',
    `
      <p style="margin:0 0 16px;">היי ${escapeHtml_(patient.name)}, תודה שהגעת לייעוץ ב-Linnéa. ריכזנו עבורך את ההמלצה האישית בצורה קצרה וברורה, כדי שיהיה לך נוח לחזור אליה ברוגע.</p>
      <div style="margin:22px 0;padding:18px;border-radius:18px;background:${CONFIG.brand.ivory};border:1px solid ${CONFIG.brand.blush};">
        <p style="margin:0 0 8px;font-weight:700;color:${CONFIG.brand.ink};">ההמלצה האישית שלך</p>
        <p style="margin:0;color:${CONFIG.brand.muted};">${escapeHtml_(summary)}</p>
      </div>
      ${nextStep ? `<p style="margin:0 0 16px;"><strong>השלב הבא שהצענו:</strong> ${escapeHtml_(nextStep)}</p>` : ''}
      <p style="margin:0;">אם תרצו לחשוב, לשאול או לדייק משהו לפני קבלת החלטה, אפשר פשוט להשיב למייל הזה.</p>
    `
  );
}

function sendPostTreatmentCareEmail_(patient, treatmentType, careNotes) {
  const htmlBody = postTreatmentCareEmailHtml_(patient, treatmentType, careNotes);
  GmailApp.sendEmail(patient.email, 'הנחיות לאחר הטיפול שלך ב-Linnéa', stripHtml_(htmlBody), {
    name: CONFIG.clinicName,
    htmlBody,
    replyTo: CONFIG.clinicEmail,
  });
}

function postTreatmentCareEmailHtml_(patient, treatmentType, careNotes) {
  const notes = careNotes || [
    'להימנע ממגע או עיסוי באזור הטיפול אלא אם קיבלת הנחיה אחרת מהצוות.',
    'להימנע מפעילות גופנית מאומצת, סאונה או חום גבוה ב-24 השעות הראשונות.',
    'אדמומיות, רגישות קלה או נפיחות מקומית יכולות להופיע לאחר טיפול אסתטי.',
    'אם מופיע כאב חריג, שינוי צבע משמעותי, נפיחות חריגה או כל תחושה שמדאיגה אותך, יש ליצור איתנו קשר מיד.',
  ].join('\n');

  return premiumEmailShell_(
    'הנחיות לאחר הטיפול',
    treatmentType ? `לאחר ${escapeHtml_(treatmentType)}` : 'Linnéa aftercare',
    `
      <p style="margin:0 0 16px;">היי ${escapeHtml_(patient.name)}, תודה שבחרת ב-Linnéa. ריכזנו עבורך את ההנחיות החשובות לאחר הטיפול, כדי שהימים הקרובים יהיו רגועים וברורים.</p>
      <div style="margin:22px 0;padding:18px;border-radius:18px;background:${CONFIG.brand.ivory};border:1px solid ${CONFIG.brand.blush};white-space:pre-line;color:${CONFIG.brand.muted};">${escapeHtml_(notes)}</div>
      <p style="margin:0 0 16px;">בכל שאלה או תחושה חריגה, עדיף לכתוב לנו מוקדם ולא להישאר עם ספק.</p>
      <p style="margin:0;">נבדוק איתך שוב בעוד כ-48 שעות.</p>
    `
  );
}

function sendTreatmentCheckInEmail_(patient, treatmentType) {
  const htmlBody = treatmentCheckInEmailHtml_(patient, treatmentType);
  GmailApp.sendEmail(patient.email, 'בדיקה קצרה מ-Linnéa', stripHtml_(htmlBody), {
    name: CONFIG.clinicName,
    htmlBody,
    replyTo: CONFIG.clinicEmail,
  });
}

function treatmentCheckInEmailHtml_(patient, treatmentType) {
  return premiumEmailShell_(
    'בדיקת מצב קצרה',
    '48 שעות אחרי הטיפול',
    `
      <p style="margin:0 0 16px;">היי ${escapeHtml_(patient.name)}, רצינו לבדוק איך ההרגשה אחרי ${escapeHtml_(treatmentType || 'הטיפול')}.</p>
      <p style="margin:0 0 16px;">רגישות קלה או שינוי מקומי יכולים להיות חלק טבעי מהימים הראשונים. אם משהו מטריד או מרגיש חריג, נשמח לקבל הודעה ולכוון באופן אישי.</p>
      <div style="margin:22px 0;padding:18px;border-radius:18px;background:${CONFIG.brand.ivory};border:1px solid ${CONFIG.brand.blush};">
        <p style="margin:0;">אפשר להשיב בקצרה שהכול בסדר, או לצרף שאלה/תמונה אם תרצו שנבדוק.</p>
      </div>
      <p style="margin:0;">אנחנו כאן.</p>
    `
  );
}

function premiumEmailShell_(title, eyebrow, bodyHtml) {
  return `
    <!doctype html>
    <html lang="he" dir="rtl">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body dir="rtl" style="margin:0;background:${CONFIG.brand.ivory};padding:28px 12px;font-family:Arial,'Helvetica Neue',sans-serif;color:${CONFIG.brand.ink};">
      <div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid ${CONFIG.brand.blush};border-radius:22px;overflow:hidden;">
        <div style="background:${CONFIG.brand.sageDark};padding:28px 24px;text-align:center;color:#fff;">
          <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${CONFIG.brand.blush};">Linnéa aesthetics</div>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.25;font-weight:400;">${title}</h1>
        </div>
        <div style="padding:28px 24px;font-size:17px;line-height:1.75;">
          <p style="margin:0 0 16px;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:${CONFIG.brand.sageDark};font-weight:700;">${escapeHtml_(eyebrow)}</p>
          ${bodyHtml}
        </div>
        <div style="padding:16px 24px;background:${CONFIG.brand.blush};text-align:center;color:${CONFIG.brand.ink};font-size:14px;">
          ${CONFIG.clinicAddress} · ${CONFIG.clinicPhone}
        </div>
      </div>
    </body>
    </html>
  `;
}

function sendPreviewHtmlEmail_(subject, htmlBody) {
  GmailApp.sendEmail(CONFIG.clinicEmail, subject, stripHtml_(htmlBody), {
    name: `${CONFIG.clinicName} Preview`,
    htmlBody,
    replyTo: CONFIG.clinicEmail,
  });
}

function latestIntakePatientForTest_() {
  const threads = GmailApp.search(CONFIG.sourceQuery, 0, 1);
  if (threads.length > 0) {
    const messages = threads[0].getMessages();
    const patient = parseIntakeEmail_(messages[messages.length - 1]);
    if (patient.name && patient.email) return patient;
  }

  return normalizePayload_({
    name: 'מטופל/ת בדיקה',
    email: CONFIG.clinicEmail,
    phone: '050-0000000',
    interest: 'ייעוץ אסתטי אישי',
    notes: 'בדיקת תצוגת מיילים וטפסים לפני הפעלה מלאה.',
    serviceConsent: 'yes',
    privacyConsent: 'yes',
    whatsappConsent: 'yes',
  });
}

function sendNoLongerAvailableEmail_(patient, slot) {
  GmailApp.sendEmail(patient.email, 'המועד שבחרת כבר לא פנוי', 'המועד שבחרת נתפס. אפשר להשיב למייל הזה ונציע מועד חדש.', {
    name: CONFIG.clinicName,
    replyTo: CONFIG.clinicEmail,
  });
}

function parseIntakeEmail_(message) {
  const body = message.getPlainBody();
  const from = message.getFrom();

  return normalizePayload_({
    name: pickField_(body, ['Full Name', 'Name', 'שם מלא', 'שם']) || extractNameFromSubject_(message.getSubject()),
    email: pickField_(body, ['Email', 'E-mail', 'אימייל', 'דוא"ל']) || extractEmail_(from),
    phone: pickField_(body, ['Phone Number', 'Phone', 'טלפון', 'מספר טלפון']),
    interest: pickField_(body, ['Area of Interest', 'Treatment', 'תחום עניין', 'טיפול']),
    notes: pickField_(body, ['Message', 'Notes', 'Please specify', 'other_details', 'הערות', 'פירוט']),
    serviceConsent: pickField_(body, ['service_consent', 'Service Consent', 'אישור יצירת קשר']),
    privacyConsent: pickField_(body, ['privacy_consent', 'Privacy Consent', 'אישור מדיניות פרטיות']),
    emailUpdatesConsent: pickField_(body, ['email_updates_consent', 'Email Updates Consent', 'עדכונים במייל']),
    whatsappConsent: pickField_(body, ['whatsapp_consent', 'WhatsApp Consent', 'אישור WhatsApp']),
    pageUrl: pickField_(body, ['page_url', 'Page URL', 'עמוד מקור']),
    pageLanguage: pickField_(body, ['page_language', 'Page Language', 'שפת עמוד']),
    utmSource: pickField_(body, ['utm_source', 'UTM Source']),
    utmMedium: pickField_(body, ['utm_medium', 'UTM Medium']),
    utmCampaign: pickField_(body, ['utm_campaign', 'UTM Campaign']),
    utmTerm: pickField_(body, ['utm_term', 'UTM Term']),
    utmContent: pickField_(body, ['utm_content', 'UTM Content']),
  });
}

function normalizePayload_(payload) {
  const serviceConsent = firstValue_(payload.serviceConsent || payload.service_consent || payload['Service Consent'] || payload['אישור יצירת קשר']);
  const privacyConsent = firstValue_(payload.privacyConsent || payload.privacy_consent || payload['Privacy Consent'] || payload['אישור מדיניות פרטיות']);
  const emailUpdatesConsent = firstValue_(payload.emailUpdatesConsent || payload.email_updates_consent || payload.marketing_consent || payload['Email Updates Consent'] || payload['עדכונים במייל']);
  const whatsappConsent = firstValue_(payload.whatsappConsent || payload.whatsapp_consent || payload['WhatsApp Consent'] || payload['אישור WhatsApp']);

  return {
    name: firstValue_(payload.name || payload.fullName || payload.full_name || payload['Full Name'] || payload['שם מלא']),
    email: firstValue_(payload.email || payload.Email || payload['אימייל'] || payload['דוא"ל']),
    phone: firstValue_(payload.phone || payload.phoneNumber || payload.phone_number || payload['Phone Number'] || payload['טלפון']),
    interest: firstValue_(payload.interest || payload.areaOfInterest || payload.area_of_interest || payload['Area of Interest'] || payload['תחום עניין']),
    notes: firstValue_(payload.notes || payload.message || payload.other || payload['Please specify'] || payload['הערות']),
    serviceConsent,
    privacyConsent,
    emailUpdatesConsent,
    whatsappConsent,
    pageUrl: firstValue_(payload.pageUrl || payload.page_url || payload['Page URL']),
    pageLanguage: firstValue_(payload.pageLanguage || payload.page_language || payload['Page Language']),
    utmSource: firstValue_(payload.utmSource || payload.utm_source || payload['UTM Source']),
    utmMedium: firstValue_(payload.utmMedium || payload.utm_medium || payload['UTM Medium']),
    utmCampaign: firstValue_(payload.utmCampaign || payload.utm_campaign || payload['UTM Campaign']),
    utmTerm: firstValue_(payload.utmTerm || payload.utm_term || payload['UTM Term']),
    utmContent: firstValue_(payload.utmContent || payload.utm_content || payload['UTM Content']),
    communicationProfile: isTruthy_(whatsappConsent || serviceConsent)
      ? CONFIG.communicationProfiles.whatsappShortEmailForms
      : CONFIG.communicationProfiles.emailOnly,
  };
}

function createBookingToken_(patient, slots, rowId) {
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put(token, JSON.stringify({ patient, slots, rowId }), 21600);
  PropertiesService.getScriptProperties().setProperty(`booking:${token}`, JSON.stringify({ patient, slots, rowId }));
  return token;
}

function readBookingToken_(token) {
  if (!token) return null;
  const cached = CacheService.getScriptCache().get(token);
  const stored = cached || PropertiesService.getScriptProperties().getProperty(`booking:${token}`);
  return stored ? JSON.parse(stored) : null;
}

function deleteBookingToken_(token) {
  CacheService.getScriptCache().remove(token);
  PropertiesService.getScriptProperties().deleteProperty(`booking:${token}`);
}

function ensureLabel_() {
  return GmailApp.getUserLabelByName(CONFIG.processedLabel) || GmailApp.createLabel(CONFIG.processedLabel);
}

function ensurePrepForm_() {
  const form = getOrCreatePrepForm_();
  ensurePrepFormSubmitTrigger_(form);
  return form;
}

function getOrCreatePrepForm_() {
  const props = PropertiesService.getScriptProperties();
  let formId = CONFIG.prepFormId || props.getProperty('LINNEA_PREP_FORM_ID');
  let form;

  if (formId) {
    form = FormApp.openById(formId);
  } else {
    form = FormApp.create(CONFIG.prepFormName);
    configurePrepForm_(form);
    buildPrepForm_(form);
    formId = form.getId();
    props.setProperty('LINNEA_PREP_FORM_ID', formId);
  }

  return form;
}

function configurePrepForm_(form) {
  form.setTitle(CONFIG.prepFormName);
  form.setDescription([
    'טופס הכנה לפגישת ייעוץ ב-Linnéa aesthetics.',
    'הטופס כולל אישור הגעה, הסכמה מדעת, היסטוריה רפואית קצרה ודגשים שחשוב לצוות להכיר לפני הפגישה.',
    'המידע נשמר לשימוש המרפאה בלבד ונועד לאפשר ייעוץ מדויק, אחראי ובטוח יותר.',
  ].join('\n'));
  form.setCollectEmail(false);
  form.setConfirmationMessage('תודה, הטפסים התקבלו. אם אישרת הגעה - ניפגש בקליניקה. אם ביקשת לתאם מחדש, הצוות יחזור אליך בהקדם ✨');
}

function buildPrepForm_(form) {
  form.addTextItem().setTitle('קוד פנייה פנימי').setRequired(true);
  form.addTextItem().setTitle('Calendar Event ID').setRequired(true);
  form.addTextItem().setTitle('שם מלא').setRequired(true);
  form.addTextItem().setTitle('טלפון').setRequired(true);
  form.addTextItem().setTitle('מועד הפגישה').setRequired(true);

  form.addPageBreakItem().setTitle('אישור הגעה');
  form.addSectionHeaderItem()
    .setTitle('אישור קצר לפני הפגישה')
    .setHelpText('כדי שנוכל להכין את הייעוץ בצורה מדויקת ונעימה, נשמח לאישור הגעה ולעדכון אם נדרש שינוי במועד.');
  form.addMultipleChoiceItem()
    .setTitle('אישור הגעה')
    .setChoiceValues(['אני מאשר/ת הגעה לפגישה', 'אני מבקש/ת לתאם מועד חדש'])
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('אם ביקשת לתאם מחדש, אילו ימים ושעות נוחים לך?')
    .setRequired(false);

  form.addPageBreakItem().setTitle('הסכמה מדעת לטיפול קוסמטי');
  form.addSectionHeaderItem()
    .setTitle('הסכמה מדעת')
    .setHelpText([
      'הייעוץ ב-Linnéa נועד לבחון התאמה אישית לטיפול אסתטי, להסביר אפשרויות טיפול, גבולות, סיכונים וחלופות, ולהחליט יחד על תוכנית מדויקת ובטוחה.',
      'ידוע לי שתוצאות טיפול קוסמטי משתנות מאדם לאדם ואינן מובטחות. התוצאות עשויות להיות מושפעות ממבנה אנטומי, מצב רפואי, תגובת ריפוי, גיל, אורח חיים וטיפולים קודמים.',
      'ידוע לי שייתכנו תופעות לוואי כגון אדמומיות, נפיחות, רגישות, שטפי דם, כאב מקומי, אסימטריה זמנית, זיהום, תגובה אלרגית או תגובה בלתי צפויה.',
      'ידוע לי שהצוות רשאי להמליץ לדחות, לשנות או לא לבצע טיפול אם נמצא שאינו מתאים מבחינה רפואית, מקצועית או אסתטית.',
      'יש למסור מידע רפואי מלא ונכון לפני קבלת טיפול ולעדכן את הצוות בכל שינוי רלוונטי.',
    ].join('\n'));
  form.addCheckboxItem()
    .setTitle('אישור הסכמה מדעת')
    .setChoiceValues(['קראתי והבנתי את האמור לעיל ואני מסכימ/ה להמשך תהליך הייעוץ'])
    .setRequired(true);
  form.addCheckboxItem()
    .setTitle('אישור הבנת תוצאות משתנות')
    .setChoiceValues(['ידוע לי שהתוצאות עשויות להשתנות ואינן מובטחות'])
    .setRequired(true);
  form.addCheckboxItem()
    .setTitle('אישור מסירת מידע מלא')
    .setChoiceValues(['אני מאשר/ת שהמידע שמסרתי נכון ומלא ככל הידוע לי'])
    .setRequired(true);
  form.addCheckboxItem()
    .setTitle('אישור שמירת מידע רפואי')
    .setChoiceValues(['אני מאשר/ת שמירת המידע שמסרתי לצורך ניהול הייעוץ, מעקב רפואי ותיעוד מרפאה'])
    .setRequired(true);

  form.addPageBreakItem().setTitle('היסטוריה רפואית לצורך טיפול קוסמטי');
  form.addCheckboxItem()
    .setTitle('האם קיימים מצבים רפואיים רלוונטיים?')
    .setChoiceValues([
      'אין מצבים רפואיים ידועים',
      'הריון או הנקה',
      'אלרגיות',
      'מחלה אוטואימונית',
      'נטייה לדימומים או נטילת מדללי דם',
      'סוכרת',
      'מחלת עור פעילה באזור הטיפול',
      'הרפס פעיל או נטייה להרפס',
      'נטייה לצלקות קלואידיות',
      'מחלה נוירולוגית או חולשת שרירים',
      'טיפול באיזוטרטינואין / רואקוטן בשנה האחרונה',
      'טיפול קוסמטי/אסתטי קודם באזור',
      'אחר',
    ])
    .setRequired(true);
  form.addParagraphTextItem()
    .setTitle('פירוט מצבים רפואיים, אלרגיות או תרופות קבועות')
    .setHelpText('אם סימנת סעיף כלשהו למעלה, נשמח לפירוט קצר. אם אין, אפשר להשאיר ריק.')
    .setRequired(false);
  form.addParagraphTextItem()
    .setTitle('טיפולים אסתטיים קודמים או רגישויות מיוחדות')
    .setHelpText('לדוגמה: בוטוקס, חומצה היאלורונית, סקין בוסטר, לייזר, פילינג, תגובה חריגה או חוסר שביעות רצון בעבר.')
    .setRequired(false);
  form.addParagraphTextItem()
    .setTitle('מטרת הייעוץ ומה חשוב לך שנדע')
    .setHelpText('אפשר לכתוב בחופשיות מה חשוב לשפר, ממה חשוב להימנע, או איזה סגנון תוצאה מרגיש נכון.')
    .setRequired(false);
  form.addParagraphTextItem()
    .setTitle('הערות נוספות שחשוב שנדע לפני הפגישה')
    .setRequired(false);

  form.addPageBreakItem().setTitle('חתימה ואישור סופי');
  form.addTextItem()
    .setTitle('חתימה דיגיטלית - שם מלא')
    .setHelpText('הקלדת שמך המלא מהווה אישור לכך שקראת ומילאת את הטופס מרצונך.')
    .setRequired(true);
}

function ensurePrepFormSubmitTrigger_(form) {
  const triggers = ScriptApp.getProjectTriggers();
  const hasTrigger = triggers.some(trigger =>
    trigger.getHandlerFunction() === 'onPrepFormSubmit' &&
    trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT
  );
  if (!hasTrigger) {
    ScriptApp.newTrigger('onPrepFormSubmit')
      .forForm(form)
      .onFormSubmit()
      .create();
  }
}

function deleteTriggersForHandlers_(handlers) {
  const handlerSet = new Set(handlers);
  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (handlerSet.has(trigger.getHandlerFunction())) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

function createTimeTriggerIfMissing_(handlerFunction, cadence, interval) {
  const triggers = ScriptApp.getProjectTriggers();
  const hasTrigger = triggers.some(trigger => trigger.getHandlerFunction() === handlerFunction);
  if (hasTrigger) return;

  const builder = ScriptApp.newTrigger(handlerFunction).timeBased();
  const safeInterval = Number(interval || 1);
  if (cadence === 'minutes') {
    builder.everyMinutes(safeInterval).create();
    return;
  }
  builder.everyHours(safeInterval).create();
}

function createPrefilledPrepFormUrl_(rowId, eventId, patient, appointmentStart) {
  const form = ensurePrepForm_();
  const response = form.createResponse();
  const valuesByTitle = {
    'קוד פנייה פנימי': rowId,
    'Calendar Event ID': eventId || '',
    'שם מלא': patient.name || '',
    'טלפון': patient.phone || '',
    'מועד הפגישה': formatSlotForButton_(appointmentStart),
    'אישור הגעה': 'אני מאשר/ת הגעה לפגישה',
  };

  form.getItems().forEach(item => {
    const title = item.getTitle();
    if (!Object.prototype.hasOwnProperty.call(valuesByTitle, title)) return;

    if (item.getType() === FormApp.ItemType.TEXT) {
      response.withItemResponse(item.asTextItem().createResponse(valuesByTitle[title]));
    }
    if (item.getType() === FormApp.ItemType.MULTIPLE_CHOICE) {
      response.withItemResponse(item.asMultipleChoiceItem().createResponse(valuesByTitle[title]));
    }
  });

  return response.toPrefilledUrl();
}

function updateCalendarEventStatus_(eventId, status, note) {
  if (!eventId) return;

  const calendar = CalendarApp.getCalendarById(CONFIG.calendarId);
  const event = calendar.getEventById(eventId);
  if (!event) return;

  const currentTitle = event.getTitle();
  const baseTitle = currentTitle.split('|')[0].trim();
  event.setTitle(`${baseTitle} | ${status}`);
  event.setDescription(`${event.getDescription() || ''}\n${note || ''}`.trim());
  event.setColor(CalendarApp.EventColor.PALE_BLUE);
}

function getWebAppUrl_() {
  const configuredUrl = String(CONFIG.webAppUrl || '').trim();
  if (configuredUrl) return normalizeWebAppUrl_(configuredUrl);

  const deployedUrl = ScriptApp.getService().getUrl();
  return deployedUrl ? normalizeWebAppUrl_(deployedUrl) : '';
}

function normalizeWebAppUrl_(url) {
  return String(url || '')
    .trim()
    .replace(/\/macros\/u\/\d+\/s\//, '/macros/s/')
    .replace(/\/dev(\?.*)?$/, '/exec')
    .replace(/\/exec\?.*$/, '/exec');
}

function testWebAppUrl() {
  const url = getWebAppUrl_();
  if (!url) throw new Error('Missing CONFIG.webAppUrl.');
  if (url.indexOf('/macros/u/') !== -1) {
    throw new Error(`Bad Web App URL. Use this instead: ${normalizeWebAppUrl_(url)}`);
  }

  const response = UrlFetchApp.fetch(url, {
    followRedirects: true,
    muteHttpExceptions: true,
  });
  const body = response.getContentText();
  Logger.log(`Testing URL: ${url}`);
  Logger.log(`HTTP status: ${response.getResponseCode()}`);
  Logger.log(body.slice(0, 400));

  if (body.indexOf('ברוכים הבאים ל-Linnéa') === -1 && body.indexOf('Linnéa aesthetics') === -1) {
    throw new Error('The Web App did not return the Linnea booking page. Check deployment access: Execute as Me, Who has access Anyone.');
  }
}

function ensureLeadSheet_() {
  const props = PropertiesService.getScriptProperties();
  let spreadsheetId = CONFIG.spreadsheetId || props.getProperty('LINNEA_SPREADSHEET_ID');
  let spreadsheet;

  if (spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    spreadsheet = SpreadsheetApp.create(CONFIG.spreadsheetName);
    spreadsheetId = spreadsheet.getId();
    props.setProperty('LINNEA_SPREADSHEET_ID', spreadsheetId);
  }

  const sheet = spreadsheet.getSheetByName(CONFIG.sheetName) || spreadsheet.insertSheet(CONFIG.sheetName);
  const headers = [
    'Row ID',
    'Created At',
    'Updated At',
    'Status',
    'Clinic Status',
    'Patient Name',
    'Email',
    'Phone',
    'Interest',
    'Notes',
    'Source Subject',
    'Source Message ID',
    'Page URL',
    'Page Language',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'UTM Term',
    'UTM Content',
    'Lead Score',
    'Lead Stage',
    'Urgency',
    'Duplicate Count',
    'Last Duplicate At',
    'Offered Slots',
    'Selected Slot',
    'Appointment Start',
    'Appointment End',
    'Calendar Event ID',
    'Service Consent',
    'Privacy Consent',
    'Email Updates Consent',
    'Prep Form Sent At',
    'Prep Form Submitted At',
    'Prep Form URL',
    'Missing Forms Reminder At',
    'Forms Escalation At',
    'Attendance Confirmation',
    'Medical Alerts',
    'Prep Notes',
    'Consent Signature',
    'Communication Profile',
    'WhatsApp Consent',
    'WhatsApp Draft Link',
    'Consultation Summary',
    'Next Recommended Action',
    'Consultation Summary Sent At',
    'Treatment Type',
    'Treatment Date',
    'Care Notes',
    'Treatment Care Sent At',
    '48h Check-in Sent At',
    'Satisfaction Status',
    'Doctor Review Flag',
    'Follow-up Task',
    'Last Error',
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    headers.forEach(header => {
      if (!existingHeaders.includes(header)) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
      }
    });
  }

  return sheet;
}

function appendLeadRow_(patient, message, status) {
  const sheet = ensureLeadSheet_();
  const rowId = Utilities.getUuid();
  const now = new Date();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const readiness = calculateLeadReadiness_(patient);
  const valuesByHeader = {
    'Row ID': rowId,
    'Created At': now,
    'Updated At': now,
    'Status': status,
    'Clinic Status': status,
    'Patient Name': patient.name,
    'Email': patient.email,
    'Phone': patient.phone || '',
    'Interest': patient.interest || '',
    'Notes': patient.notes || '',
    'Source Subject': message ? message.getSubject() : '',
    'Source Message ID': message ? message.getId() : '',
    'Page URL': patient.pageUrl || '',
    'Page Language': patient.pageLanguage || '',
    'UTM Source': patient.utmSource || '',
    'UTM Medium': patient.utmMedium || '',
    'UTM Campaign': patient.utmCampaign || '',
    'UTM Term': patient.utmTerm || '',
    'UTM Content': patient.utmContent || '',
    'Lead Score': readiness.score,
    'Lead Stage': 'New',
    'Urgency': readiness.urgency,
    'Duplicate Count': 0,
    'Service Consent': patient.serviceConsent || '',
    'Privacy Consent': patient.privacyConsent || '',
    'Email Updates Consent': patient.emailUpdatesConsent || '',
    'Communication Profile': patient.communicationProfile || CONFIG.defaultCommunicationProfile,
    'WhatsApp Consent': patient.whatsappConsent || '',
  };

  sheet.appendRow(headers.map(header => valuesByHeader[header] || ''));

  return rowId;
}

function updateLeadStatus_(rowId, status, fields) {
  if (!rowId) return;

  const sheet = ensureLeadSheet_();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowNumber = findRowById_(sheet, rowId);
  if (!rowNumber) return;

  const updates = Object.assign({ status, updatedAt: new Date() }, fields || {});
  const columnMap = {
    updatedAt: 'Updated At',
    status: 'Status',
    clinicStatus: 'Clinic Status',
    patientName: 'Patient Name',
    email: 'Email',
    phone: 'Phone',
    interest: 'Interest',
    notes: 'Notes',
    sourceSubject: 'Source Subject',
    sourceMessageId: 'Source Message ID',
    pageUrl: 'Page URL',
    pageLanguage: 'Page Language',
    utmSource: 'UTM Source',
    utmMedium: 'UTM Medium',
    utmCampaign: 'UTM Campaign',
    utmTerm: 'UTM Term',
    utmContent: 'UTM Content',
    leadScore: 'Lead Score',
    leadStage: 'Lead Stage',
    urgency: 'Urgency',
    duplicateCount: 'Duplicate Count',
    lastDuplicateAt: 'Last Duplicate At',
    offeredSlots: 'Offered Slots',
    selectedSlot: 'Selected Slot',
    appointmentStart: 'Appointment Start',
    appointmentEnd: 'Appointment End',
    calendarEventId: 'Calendar Event ID',
    prepFormSentAt: 'Prep Form Sent At',
    prepFormSubmittedAt: 'Prep Form Submitted At',
    prepFormUrl: 'Prep Form URL',
    missingFormsReminderAt: 'Missing Forms Reminder At',
    formsEscalationAt: 'Forms Escalation At',
    attendanceConfirmation: 'Attendance Confirmation',
    medicalAlerts: 'Medical Alerts',
    prepNotes: 'Prep Notes',
    consentSignature: 'Consent Signature',
    serviceConsent: 'Service Consent',
    privacyConsent: 'Privacy Consent',
    emailUpdatesConsent: 'Email Updates Consent',
    communicationProfile: 'Communication Profile',
    whatsappConsent: 'WhatsApp Consent',
    whatsappDraftLink: 'WhatsApp Draft Link',
    consultationSummarySentAt: 'Consultation Summary Sent At',
    treatmentCareSentAt: 'Treatment Care Sent At',
    checkIn48hSentAt: '48h Check-in Sent At',
    satisfactionStatus: 'Satisfaction Status',
    doctorReviewFlag: 'Doctor Review Flag',
    followUpTask: 'Follow-up Task',
    lastError: 'Last Error',
  };

  Object.keys(updates).forEach(key => {
    const header = columnMap[key];
    const column = headers.indexOf(header) + 1;
    if (column > 0) sheet.getRange(rowNumber, column).setValue(updates[key]);
  });
}

function getLeadRows_() {
  const sheet = ensureLeadSheet_();
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow < 2) return [];

  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  return sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues().map((values, index) => {
    const row = { _rowNumber: index + 2 };
    headers.forEach((header, headerIndex) => {
      row[header] = values[headerIndex];
    });
    return row;
  });
}

function patientFromRow_(row) {
  const communicationProfile = row['Communication Profile'] || row['Preferred Channel'] || CONFIG.defaultCommunicationProfile;
  return {
    name: row['Patient Name'] || '',
    email: row.Email || '',
    phone: row.Phone || '',
    interest: row.Interest || '',
    notes: row.Notes || '',
    communicationProfile,
    whatsappConsent: isTruthy_(row['WhatsApp Consent']) || communicationProfile !== CONFIG.communicationProfiles.emailOnly,
  };
}

function shouldSendEmail_(patient, messageType) {
  if (messageType === 'prep') return true;
  if (messageType === 'postTreatmentCare') return true;
  if (patient.communicationProfile === CONFIG.communicationProfiles.fullWhatsAppEmailForms && messageType === 'checkIn48h') {
    return false;
  }
  return true;
}

function shouldPrepareWhatsAppDraft_(patient, messageType) {
  if (!patient.whatsappConsent || !patient.phone) return false;
  if (patient.communicationProfile === CONFIG.communicationProfiles.emailOnly) return false;
  if (messageType === 'prep') return true;
  if (messageType === 'checkIn48h') return true;
  return patient.communicationProfile === CONFIG.communicationProfiles.fullWhatsAppEmailForms;
}

function buildWhatsAppLink_(phone, text) {
  const normalizedPhone = normalizePhoneForWhatsApp_(phone);
  if (!normalizedPhone) return '';
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
}

function normalizePhoneForWhatsApp_(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('972')) return digits;
  if (digits.startsWith('0')) return `972${digits.slice(1)}`;
  return digits;
}

function prepReminderWhatsAppText_(patient, appointmentStart) {
  return [
    `היי ${patient.name}, תזכורת עדינה לפגישת הייעוץ ב-Linnéa מחר.`,
    `שלחנו למייל טופס הכנה קצר לקראת הפגישה ב-${formatSlotForButton_(appointmentStart)}.`,
    'נשמח למילוי הטופס לפני ההגעה. אם משהו לא נפתח, אפשר לכתוב לנו כאן.',
  ].join('\n');
}

function consultationSummaryWhatsAppText_(patient, nextStep) {
  return [
    `היי ${patient.name}, שמחנו לפגוש אותך ב-Linnéa.`,
    nextStep ? `שלחנו לך למייל סיכום קצר ואת השלב הבא שהצענו.` : 'שלחנו לך למייל סיכום קצר של הייעוץ.',
    'אם תרצו לדייק משהו או לשאול שאלה, אנחנו כאן.',
  ].join('\n');
}

function postTreatmentCareWhatsAppText_(patient, treatmentType) {
  return [
    `היי ${patient.name}, תודה שבחרת ב-Linnéa.`,
    `שלחנו למייל הנחיות קצרות לאחר ${treatmentType || 'הטיפול'}.`,
    'אם משהו מרגיש חריג או מדאיג, אפשר לכתוב לנו כאן ונכוון באופן אישי.',
  ].join('\n');
}

function treatmentCheckInWhatsAppText_(patient, treatmentType) {
  return [
    `היי ${patient.name}, רצינו לבדוק איך ההרגשה אחרי ${treatmentType || 'הטיפול'}.`,
    'אפשר לענות כאן בקצרה שהכול בסדר, ואם יש משהו שמדאיג אפשר לצרף שאלה או תמונה.',
  ].join('\n');
}

function sendClinicDuplicateNotification_(duplicateRow, patient, duplicateCount) {
  GmailApp.sendEmail(CONFIG.clinicEmail, `פנייה כפולה באתר - ${patient.name || duplicateRow['Patient Name']}`, [
    'זוהתה פנייה חוזרת מאותו מטופל/ת בטווח הזמן שהוגדר.',
    '',
    `שם: ${patient.name || duplicateRow['Patient Name']}`,
    `טלפון: ${patient.phone || duplicateRow.Phone || 'לא נמסר'}`,
    `אימייל: ${patient.email || duplicateRow.Email || 'לא נמסר'}`,
    `מספר פניות חוזרות: ${duplicateCount}`,
    `סטטוס קיים: ${duplicateRow.Status || 'לא צוין'}`,
    '',
    'המערכת עדכנה את הרשומה הקיימת ולא פתחה מסע מטופל חדש.',
  ].join('\n'), {
    name: CONFIG.clinicName,
  });
}

function summarizeMedicalAlerts_(values) {
  const conditions = firstValue_(values['האם קיימים מצבים רפואיים רלוונטיים?']);
  const medicalDetails = firstValue_(values['פירוט מצבים רפואיים, אלרגיות או תרופות קבועות']);
  const priorTreatments = firstValue_(values['טיפולים אסתטיים קודמים או רגישויות מיוחדות']);
  const hasRelevantCondition = conditions && conditions.indexOf('אין מצבים רפואיים ידועים') === -1;

  return [
    hasRelevantCondition ? `סומנו מצבים: ${conditions}` : '',
    medicalDetails ? `פירוט רפואי: ${medicalDetails}` : '',
    priorTreatments ? `טיפולים/רגישויות בעבר: ${priorTreatments}` : '',
  ].filter(Boolean).join(' | ');
}

function summarizePrepNotes_(values) {
  return [
    firstValue_(values['אם ביקשת לתאם מחדש, אילו ימים ושעות נוחים לך?']),
    firstValue_(values['מטרת הייעוץ ומה חשוב לך שנדע']),
    firstValue_(values['הערות נוספות שחשוב שנדע לפני הפגישה']),
  ].filter(Boolean).join(' | ');
}

function calculateLeadReadiness_(patient) {
  let score = 0;
  if (patient.name) score += 10;
  if (patient.email) score += 10;
  if (patient.phone) score += 10;
  if (patient.interest) score += 20;
  if (isTruthy_(patient.serviceConsent)) score += 20;
  if (isTruthy_(patient.privacyConsent)) score += 20;
  if (patient.communicationProfile && patient.communicationProfile !== CONFIG.communicationProfiles.emailOnly) score += 10;

  const freeText = `${patient.notes || ''} ${patient.interest || ''}`.toLowerCase();
  const urgency = /(urgent|asap|today|tomorrow|דחוף|בהקדם|היום|מחר)/i.test(freeText)
    ? 'High'
    : 'Normal';

  return { score: Math.min(score, 100), urgency };
}

function satisfactionNeedsDoctorReview_(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return false;
  return ['needs attention', 'doctor', 'pain', 'concern', 'בעיה', 'כאב', 'מודאג', 'דחוף', 'רופא'].some(token =>
    normalized.indexOf(token) !== -1
  );
}

function normalizePhoneForCompare_(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('972')) return `0${digits.slice(3)}`;
  return digits;
}

function isSameLocalDate_(value, date) {
  if (!value) return false;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  return Utilities.formatDate(parsed, CONFIG.timezone, 'yyyy-MM-dd') ===
    Utilities.formatDate(date, CONFIG.timezone, 'yyyy-MM-dd');
}

function isPatientQuietTime_() {
  const quietHours = CONFIG.patientMessageQuietHours || {};
  const start = Number(quietHours.start);
  const end = Number(quietHours.end);
  if (Number.isNaN(start) || Number.isNaN(end) || start === end) return false;

  const hour = Number(Utilities.formatDate(new Date(), CONFIG.timezone, 'H'));
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

function withScriptLock_(name, callback) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    Logger.log(`Skipped ${name}: another Linnea automation run is already active.`);
    return null;
  }

  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function formatRowsForBrief_(rows, fields) {
  if (!rows.length) return '- אין';
  return rows.slice(0, 12).map(row => {
    const parts = fields.map(field => {
      const value = row[field];
      if (value instanceof Date) return `${field}: ${Utilities.formatDate(value, CONFIG.timezone, 'dd/MM/yyyy HH:mm')}`;
      return `${field}: ${value || '-'}`;
    });
    return `- ${parts.join(' | ')}`;
  }).join('\n');
}

function countBy_(rows, field) {
  return rows.reduce((acc, row) => {
    const key = String(row[field] || '').trim() || 'לא צוין';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function findRowById_(sheet, rowId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;

  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === rowId) return i + 2;
  }

  return 0;
}

function dateAtTime_(date, time) {
  const parts = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(parts[0], parts[1], 0, 0);
  return result;
}

function addMinutes_(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function nextDateAtTime_(dayOfWeek, time) {
  const now = new Date();
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  for (let i = 1; i <= 14; i++) {
    const day = new Date(cursor);
    day.setDate(cursor.getDate() + i);
    const localDay = Number(Utilities.formatDate(day, CONFIG.timezone, 'u')) % 7;
    if (localDay === dayOfWeek) return dateAtTime_(day, time);
  }

  return dateAtTime_(addMinutes_(now, 24 * 60), time);
}

function formatSlotForButton_(date) {
  const dayNames = {
    1: 'יום שני',
    2: 'יום שלישי',
    3: 'יום רביעי',
    4: 'יום חמישי',
    5: 'יום שישי',
    6: 'יום שבת',
    7: 'יום ראשון',
  };
  const monthNames = [
    '',
    'בינואר',
    'בפברואר',
    'במרץ',
    'באפריל',
    'במאי',
    'ביוני',
    'ביולי',
    'באוגוסט',
    'בספטמבר',
    'באוקטובר',
    'בנובמבר',
    'בדצמבר',
  ];
  const isoDay = Number(Utilities.formatDate(date, CONFIG.timezone, 'u'));
  const day = Utilities.formatDate(date, CONFIG.timezone, 'd');
  const month = Number(Utilities.formatDate(date, CONFIG.timezone, 'M'));
  const year = Utilities.formatDate(date, CONFIG.timezone, 'yyyy');
  const time = Utilities.formatDate(date, CONFIG.timezone, 'HH:mm');

  return `${dayNames[isoDay]}, ${day} ${monthNames[month]} ${year} בשעה ${time}`;
}

function pickField_(text, labels) {
  for (const label of labels) {
    const regex = new RegExp(`${escapeRegExp_(label)}\\s*:?\\s*(.+)`, 'i');
    const match = text.match(regex);
    if (match && match[1]) return match[1].trim();
  }
  return '';
}

function firstValue_(value) {
  if (Array.isArray(value)) return String(value[0] || '').trim();
  return String(value || '').trim();
}

function isTruthy_(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return ['yes', 'true', '1', 'on', 'כן', 'מאשר', 'מאשר/ת', 'agree', 'agreed'].some(token => normalized.indexOf(token) !== -1);
}

function extractEmail_(text) {
  const match = String(text || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : '';
}

function extractNameFromSubject_(subject) {
  return String(subject || '').replace(/new form submission|book a consultation|submit request/ig, '').trim();
}

function escapeRegExp_(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml_(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripHtml_(html) {
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function jsonResponse_(body, status) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

function statusPage_(title, message, success) {
  return `
    <!doctype html>
    <html lang="he" dir="rtl">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml_(title)}</title>
      </head>
      <body style="margin:0;background:${CONFIG.brand.ivory};font-family:Arial,'Helvetica Neue',sans-serif;color:${CONFIG.brand.ink};">
        <main style="min-height:100vh;display:grid;place-items:center;padding:24px;">
          <section style="max-width:620px;background:#fff;border:1px solid ${CONFIG.brand.blush};border-radius:24px;padding:34px;text-align:center;">
            <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${CONFIG.brand.sageDark};">Linnéa aesthetics</div>
            <h1 style="font-size:32px;font-weight:400;margin:14px 0 12px;">${escapeHtml_(title)}</h1>
            <p style="font-size:18px;line-height:1.7;margin:0 0 22px;color:${CONFIG.brand.muted};">${escapeHtml_(message)}</p>
            ${success ? `<a href="${CONFIG.mapsUrl}" style="display:inline-block;background:${CONFIG.brand.sageDark};color:#fff;border-radius:999px;text-decoration:none;padding:13px 20px;font-weight:700;">פתיחה במפות</a>` : ''}
          </section>
        </main>
      </body>
    </html>
  `;
}
