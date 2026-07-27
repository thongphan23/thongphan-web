export const ATOMIC_EVIDENCE_UPDATE_SQL = `UPDATE reading_evidence_summaries
  SET visible_ms = MAX(visible_ms, ?),
      active_ms = MIN(MAX(active_ms, ?), MAX(visible_ms, ?)),
      max_scroll_percent = MAX(max_scroll_percent, ?),
      sections_seen_json = COALESCE((
        SELECT json_group_array(value) FROM (
          SELECT value FROM json_each(reading_evidence_summaries.sections_seen_json)
          UNION
          SELECT value FROM json_each(?)
          ORDER BY value
        )
      ), '[]'),
      meaningful_interaction_count = MAX(meaningful_interaction_count, ?),
      updated_at = MAX(updated_at, ?)
  WHERE session_id = ?
    AND EXISTS (
      SELECT 1 FROM reading_sessions
      WHERE id = ? AND reader_id = ? AND status != 'completed'
    )`
