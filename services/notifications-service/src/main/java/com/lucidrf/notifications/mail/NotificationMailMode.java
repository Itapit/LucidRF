package com.lucidrf.notifications.mail;

/** How outbound email is delivered in this environment. */
public enum NotificationMailMode {
  /** Send via SMTP (spring.mail.* must be configured). */
  SMTP,
  /** Log only; for local development without a mail server. */
  LOG
}
