package com.lucidrf.notifications.config;

import com.lucidrf.notifications.mail.NotificationMailMode;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "notifications")
public record NotificationsProperties(
    String internalApiKey,
    String mailFrom,
    String appPublicBaseUrl,
    NotificationMailMode mailMode) {}
