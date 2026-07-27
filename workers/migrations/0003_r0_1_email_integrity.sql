-- R0.1A local-only email integrity quarantine.
-- A later approved email release must add a new migration and consent contract.

ALTER TABLE email_queue
  ADD COLUMN audience_state TEXT NOT NULL DEFAULT 'delivery_inactive'
  CHECK (audience_state IN ('delivery_inactive', 'quarantined_legacy', 'sendable'));

ALTER TABLE email_queue
  ADD COLUMN sendable INTEGER NOT NULL DEFAULT 0
  CHECK (sendable IN (0, 1));

DROP TRIGGER IF EXISTS quarantine_legacy_email_update;

UPDATE email_queue
SET audience_state = 'quarantined_legacy',
    sendable = 0
WHERE campaign_version = 'legacy-v0';

DROP TRIGGER IF EXISTS quarantine_legacy_email_delete;

CREATE TRIGGER quarantine_legacy_email_update
BEFORE UPDATE ON email_queue
WHEN OLD.campaign_version = 'legacy-v0'
BEGIN
  SELECT RAISE(ABORT, 'legacy email queue is quarantined');
END;

CREATE TRIGGER quarantine_legacy_email_delete
BEFORE DELETE ON email_queue
WHEN OLD.campaign_version = 'legacy-v0'
BEGIN
  SELECT RAISE(ABORT, 'legacy email queue is quarantined');
END;

CREATE TRIGGER email_queue_reject_sendable_insert
BEFORE INSERT ON email_queue
WHEN NEW.sendable <> 0 OR NEW.audience_state = 'sendable'
BEGIN
  SELECT RAISE(ABORT, 'email delivery is inactive');
END;

CREATE TRIGGER email_queue_reject_sendable_update
BEFORE UPDATE ON email_queue
WHEN NEW.sendable <> 0 OR NEW.audience_state = 'sendable'
BEGIN
  SELECT RAISE(ABORT, 'email delivery is inactive');
END;
