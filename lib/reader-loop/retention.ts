const expiredReaderIds = 'SELECT id FROM anonymous_readers WHERE created_at < ?'
const expiredSessionIds = `SELECT id FROM reading_sessions WHERE reader_id IN (${expiredReaderIds})`

export const EXPIRED_READER_CLEANUP_SQL = [
  `DELETE FROM next_action_decisions WHERE session_id IN (${expiredSessionIds})`,
  `DELETE FROM reflections WHERE session_id IN (${expiredSessionIds})`,
  `DELETE FROM manual_completions WHERE session_id IN (${expiredSessionIds})`,
  `DELETE FROM reading_evidence_summaries WHERE session_id IN (${expiredSessionIds})`,
  `DELETE FROM reading_sessions WHERE reader_id IN (${expiredReaderIds})`,
  `DELETE FROM recommendation_decisions WHERE reader_id IN (${expiredReaderIds})`,
  `DELETE FROM reader_questions WHERE reader_id IN (${expiredReaderIds})`,
  'DELETE FROM anonymous_readers WHERE created_at < ?',
] as const
