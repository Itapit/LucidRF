package com.lucidrf.notifications.api;

import com.lucidrf.notifications.mail.EmailNotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/notifications")
public class NotificationController {

  private final EmailNotificationService emailNotificationService;

  public NotificationController(EmailNotificationService emailNotificationService) {
    this.emailNotificationService = emailNotificationService;
  }

  @PostMapping("/welcome-pending-user")
  @ResponseStatus(HttpStatus.ACCEPTED)
  public void welcomePendingUser(@Valid @RequestBody WelcomePendingUserRequest body) {
    emailNotificationService.sendWelcomePendingUser(body);
  }
}
