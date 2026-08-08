#!/usr/bin/env bash

if test -z "${R0_1B_VERSION_DIR+x}"; then
  R0_1B_VERSION_DIR=""
fi
if test -z "${R0_1B_REMOTE_MUTATION_STARTED+x}"; then
  R0_1B_REMOTE_MUTATION_STARTED=0
fi
if test -z "${R0_1B_CUTOVER_SUCCEEDED+x}"; then
  R0_1B_CUTOVER_SUCCEEDED=0
fi
if test -z "${R0_1B_PREVIOUS_UMASK+x}"; then
  R0_1B_PREVIOUS_UMASK=""
fi
if test -z "${R0_1B_EVIDENCE_INITIALIZED+x}"; then
  R0_1B_EVIDENCE_INITIALIZED=0
fi
if test -z "${R0_1B_EXIT_TRAP_INSTALLED+x}"; then
  R0_1B_EXIT_TRAP_INSTALLED=0
fi

_r0_1b_restore_previous_umask() {
  if test -n "${R0_1B_PREVIOUS_UMASK:-}"; then
    umask "$R0_1B_PREVIOUS_UMASK" 2>/dev/null || return 1
  fi
}

_r0_1b_evidence_directory_is_safe() {
  test -n "${R0_1B_VERSION_DIR:-}" || return 1
  test "${R0_1B_VERSION_DIR#/}" != "$R0_1B_VERSION_DIR" || return 1
  test -d "$R0_1B_VERSION_DIR" || return 1
  test ! -L "$R0_1B_VERSION_DIR" || return 1
  test -O "$R0_1B_VERSION_DIR" || return 1
}

_r0_1b_secure_preserved_evidence() {
  _r0_1b_evidence_directory_is_safe || return 1
  chmod 700 "$R0_1B_VERSION_DIR" 2>/dev/null || return 1
  find "$R0_1B_VERSION_DIR" -mindepth 1 -maxdepth 1 -type d \
    -exec chmod 700 {} + 2>/dev/null || return 1
  find "$R0_1B_VERSION_DIR" -mindepth 1 -maxdepth 1 -type f \
    -exec chmod 600 {} + 2>/dev/null || return 1
}

r0_1b_version_evidence_init() {
  test "$#" -eq 1 || return 64
  test "$R0_1B_EVIDENCE_INITIALIZED" = 0 || return 64

  local prefix=$1
  local parent
  local created

  case "$prefix" in
    /*) ;;
    *) return 64 ;;
  esac

  test "$prefix" != "/" || return 64
  test ! -e "$prefix" || return 64
  test ! -L "$prefix" || return 64

  parent=${prefix%/*}
  test -n "$parent" || parent=/
  test -d "$parent" || return 64
  test ! -L "$parent" || return 64
  test -O "$parent" || return 64
  test -z "$(find "$parent" -prune -perm -022 -print -quit 2>/dev/null)" ||
    return 64

  R0_1B_PREVIOUS_UMASK=$(umask)
  umask 077
  created=$(mktemp -d "${prefix}.XXXXXX" 2>/dev/null) || {
    _r0_1b_restore_previous_umask
    return 64
  }

  case "$created" in
    "${prefix}."*) ;;
    *)
      rmdir "$created" 2>/dev/null || true
      _r0_1b_restore_previous_umask
      return 64
      ;;
  esac

  R0_1B_VERSION_DIR=$created
  if ! _r0_1b_evidence_directory_is_safe ||
    test -n "$(find "$R0_1B_VERSION_DIR" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ||
    ! chmod 700 "$R0_1B_VERSION_DIR" 2>/dev/null; then
    rmdir "$R0_1B_VERSION_DIR" 2>/dev/null || true
    R0_1B_VERSION_DIR=""
    _r0_1b_restore_previous_umask
    return 64
  fi

  R0_1B_REMOTE_MUTATION_STARTED=0
  R0_1B_CUTOVER_SUCCEEDED=0
  R0_1B_EVIDENCE_INITIALIZED=1
}

r0_1b_assert_exit_trap_installed() {
  test "$#" -eq 0 || return 64
  test "$R0_1B_EVIDENCE_INITIALIZED" = 1 || return 64
  _r0_1b_evidence_directory_is_safe || return 64

  local assertion_file="$R0_1B_VERSION_DIR/exit-trap-assertion.txt"
  local assertion_created=0
  local assertion_status=0
  local noclobber_was_set=0

  case $- in
    *C*) noclobber_was_set=1 ;;
  esac

  set -C
  if trap -p EXIT 2>/dev/null > "$assertion_file"; then
    assertion_created=1
  else
    assertion_status=$?
  fi
  if test "$noclobber_was_set" = 0; then
    set +C
  fi

  test "$assertion_status" = 0 || return "$assertion_status"
  if test "$assertion_created" != 1 ||
    test ! -f "$assertion_file" ||
    test -L "$assertion_file" ||
    test ! -O "$assertion_file" ||
    ! chmod 600 "$assertion_file" 2>/dev/null; then
    if test "$assertion_created" = 1 &&
      test -f "$assertion_file" &&
      test ! -L "$assertion_file" &&
      test -O "$assertion_file"; then
      rm -f "$assertion_file" 2>/dev/null || true
    fi
    return 1
  fi

  if grep -Fqx "trap -- '_r0_1b_version_evidence_exit_handler' EXIT" \
    "$assertion_file"; then
    assertion_status=0
  else
    assertion_status=$?
  fi

  rm -f "$assertion_file" 2>/dev/null || return 1
  return "$assertion_status"
}

r0_1b_mark_remote_mutation_started() {
  test "$#" -eq 0 || return 64
  test "$R0_1B_EVIDENCE_INITIALIZED" = 1 || return 64
  _r0_1b_evidence_directory_is_safe || return 64

  if test "$R0_1B_REMOTE_MUTATION_STARTED" = 1; then
    return 0
  fi

  R0_1B_REMOTE_MUTATION_STARTED=1
  readonly R0_1B_REMOTE_MUTATION_STARTED
}

r0_1b_mark_cutover_succeeded() {
  test "$#" -eq 0 || return 64
  test "$R0_1B_EVIDENCE_INITIALIZED" = 1 || return 64
  test "$R0_1B_REMOTE_MUTATION_STARTED" = 1 || return 64
  _r0_1b_evidence_directory_is_safe || return 64
  R0_1B_CUTOVER_SUCCEEDED=1
}

r0_1b_cleanup_version_evidence() {
  test "$#" -eq 0 || return 64

  local cleanup_status=0
  if test -n "${R0_1B_VERSION_DIR:-}" && test -e "$R0_1B_VERSION_DIR"; then
    if _r0_1b_evidence_directory_is_safe; then
      if test -n "$(find "$R0_1B_VERSION_DIR" -mindepth 1 -maxdepth 1 \
        \( ! -type f -o \( ! -name '*.json' -a ! -name '*.txt' \) \) \
        -print -quit 2>/dev/null)"; then
        cleanup_status=1
      else
        find "$R0_1B_VERSION_DIR" -mindepth 1 -maxdepth 1 -type f \
          \( -name '*.json' -o -name '*.txt' \) \
          -exec rm -f {} + 2>/dev/null || cleanup_status=1
        if test "$cleanup_status" = 0; then
          rmdir "$R0_1B_VERSION_DIR" 2>/dev/null || cleanup_status=1
        fi
      fi
    else
      cleanup_status=1
    fi
  fi

  _r0_1b_restore_previous_umask || cleanup_status=1
  return "$cleanup_status"
}

_r0_1b_version_evidence_exit_handler() {
  local original_status=$?
  local handler_status=0
  trap - EXIT
  R0_1B_EXIT_TRAP_INSTALLED=0

  if test "${R0_1B_REMOTE_MUTATION_STARTED:-0}" = 1 &&
    { test "$original_status" -ne 0 ||
      test "${R0_1B_CUTOVER_SUCCEEDED:-0}" != 1; }; then
    _r0_1b_secure_preserved_evidence >/dev/null 2>&1 || true
    _r0_1b_restore_previous_umask >/dev/null 2>&1 || true
    printf 'R0_1B_VERSION_EVIDENCE_PRESERVED=%s\n' "$R0_1B_VERSION_DIR" >&2
  elif test "$original_status" -eq 0 &&
    test "${R0_1B_CUTOVER_SUCCEEDED:-0}" = 1; then
    if ! r0_1b_cleanup_version_evidence >/dev/null 2>&1; then
      _r0_1b_secure_preserved_evidence >/dev/null 2>&1 || true
      _r0_1b_restore_previous_umask >/dev/null 2>&1 || true
      printf 'R0_1B_VERSION_EVIDENCE_PRESERVED=%s\n' "$R0_1B_VERSION_DIR" >&2
      handler_status=1
    fi
  else
    r0_1b_cleanup_version_evidence >/dev/null 2>&1 || handler_status=$?
    _r0_1b_restore_previous_umask >/dev/null 2>&1 || true
  fi

  if test "$original_status" -ne 0; then
    exit "$original_status"
  fi
  if test "$handler_status" -ne 0; then
    exit "$handler_status"
  fi
  exit "$original_status"
}

r0_1b_install_exit_trap() {
  test "$#" -eq 0 || return 64
  test "$R0_1B_EVIDENCE_INITIALIZED" = 1 || return 64
  _r0_1b_evidence_directory_is_safe || return 64
  test "$R0_1B_EXIT_TRAP_INSTALLED" = 0 || return 64

  trap '_r0_1b_version_evidence_exit_handler' EXIT
  R0_1B_EXIT_TRAP_INSTALLED=1
}

r0_1b_remove_exit_trap() {
  test "$#" -eq 0 || return 64
  trap - EXIT
  R0_1B_EXIT_TRAP_INSTALLED=0
}
