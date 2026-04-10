package com.lucidrf.notifications.mail;

import com.lucidrf.notifications.api.WelcomePendingUserRequest;
import com.lucidrf.notifications.config.NotificationsProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

  private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

  private final NotificationsProperties properties;
  private final ObjectProvider<JavaMailSender> mailSenderProvider;

  public EmailNotificationService(
      NotificationsProperties properties, ObjectProvider<JavaMailSender> mailSenderProvider) {
    this.properties = properties;
    this.mailSenderProvider = mailSenderProvider;
    if (properties.mailMode() == NotificationMailMode.SMTP) {
      JavaMailSender sender = mailSenderProvider.getIfAvailable();
      if (sender == null) {
        throw new IllegalStateException(
            "notifications.mail-mode=SMTP but JavaMailSender is not available; configure spring.mail.*");
      }
      if (properties.mailFrom() == null || properties.mailFrom().isBlank()) {
        throw new IllegalStateException("notifications.mail-from must be set when mail-mode=SMTP");
      }
    }
  }

  public void sendWelcomePendingUser(WelcomePendingUserRequest body) {
    String subject = "Your LucidRF account";
    String text = buildWelcomePendingUserBody(body);
    if (properties.mailMode() == NotificationMailMode.LOG) {
      log.info(
          "[notifications:LOG mode] Would send email to={} subject={}\n{}",
          body.email(),
          subject,
          text);
      return;
    }
    JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
    if (mailSender == null) {
      throw new IllegalStateException("JavaMailSender not available");
    }
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(properties.mailFrom());
    message.setTo(body.email());
    message.setSubject(subject);
    message.setText(text);
    mailSender.send(message);
  }

  private String buildWelcomePendingUserBody(WelcomePendingUserRequest body) {
    String loginUrl = properties.appPublicBaseUrl().replaceAll("/+$", "") + "/auth/login";
    return """
        Hello %s,

        An administrator created an account for you.

        Sign in with this email address and the temporary password below. You will be asked to choose a new password before you can use the app.

        Temporary password: %s

        Sign in: %s

        If you did not expect this message, you can ignore it.
        """
        .formatted(body.username(), body.temporaryPassword(), loginUrl);
  }
}
