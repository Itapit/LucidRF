package com.lucidrf.notifications.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(NotificationsProperties.class)
public class NotificationsConfiguration {}
