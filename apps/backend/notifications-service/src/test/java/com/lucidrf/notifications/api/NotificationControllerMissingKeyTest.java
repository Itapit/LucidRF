package com.lucidrf.notifications.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(
    properties = {
      "notifications.internal-api-key=",
      "notifications.mail-mode=LOG",
      "notifications.app-public-base-url=http://localhost:4200"
    })
@AutoConfigureMockMvc
class NotificationControllerMissingKeyTest {

  @Autowired private MockMvc mockMvc;

  @Test
  void shouldReturnServiceUnavailableWhenInternalApiKeyNotConfigured() throws Exception {
    mockMvc
        .perform(
            post("/internal/notifications/welcome-pending-user")
                .header("X-Internal-Api-Key", "anything")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validPayload()))
        .andExpect(status().isServiceUnavailable());
  }

  private static String validPayload() {
    return """
        {
          "email": "new.user@lucidrf.test",
          "username": "new.user",
          "temporaryPassword": "a-temporary-password"
        }
        """;
  }
}
