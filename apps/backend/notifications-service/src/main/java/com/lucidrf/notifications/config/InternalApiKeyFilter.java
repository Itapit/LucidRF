package com.lucidrf.notifications.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class InternalApiKeyFilter extends OncePerRequestFilter {

  private static final String API_KEY_HEADER = "X-Internal-Api-Key";

  private final NotificationsProperties properties;

  public InternalApiKeyFilter(NotificationsProperties properties) {
    this.properties = properties;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !request.getRequestURI().startsWith("/internal/");
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String expected = properties.internalApiKey();
    if (expected == null || expected.isBlank()) {
      response.sendError(HttpStatus.SERVICE_UNAVAILABLE.value(), "Internal API key is not configured");
      return;
    }
    String provided = request.getHeader(API_KEY_HEADER);
    if (!constantTimeEquals(expected, provided)) {
      response.sendError(HttpStatus.UNAUTHORIZED.value());
      return;
    }
    filterChain.doFilter(request, response);
  }

  private static boolean constantTimeEquals(String expected, String provided) {
    if (provided == null) {
      provided = "";
    }
    byte[] a = expected.getBytes(StandardCharsets.UTF_8);
    byte[] b = provided.getBytes(StandardCharsets.UTF_8);
    return a.length == b.length && MessageDigest.isEqual(a, b);
  }
}
