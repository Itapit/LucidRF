package com.lucidrf.notifications.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WelcomePendingUserRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 1, max = 200) String username,
    @NotBlank @Size(min = 8, max = 200) String temporaryPassword) {}
