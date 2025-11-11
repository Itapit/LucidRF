import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { CoreActions } from './store/core.actions';

const GENERIC_EXPECTED_ERROR = 'An unknown error occurred. Please try again.';
const GENERIC_UNEXPECTED_ERROR = 'The server is unavailable. Please try again later.';
const GENERIC_APP_ERROR = 'An application error occurred. Please try again.';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private store = inject(Store);

  /**
   * Classifies an error, dispatches global errors, and returns
   * a user-friendly message for feature-level errors.
   *
   * @param error The error caught by the effect's catchError.
   * @returns A user-friendly error string for the feature's state.
   */
  public classifyError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return this.handleHttpError(error);
    }

    // This is a client-side (e.g., TypeScript) error
    console.error('Unhandled Client-Side Error:', error);
    this.dispatchGlobalError(GENERIC_APP_ERROR);
    return GENERIC_APP_ERROR;
  }

  /**
   * Handles all HttpErrorResponses.
   */
  private handleHttpError(error: HttpErrorResponse): string {
    if (error.status >= 500 || error.status === 0) {
      // --- 1. Unexpected Error ---
      this.dispatchGlobalError(GENERIC_UNEXPECTED_ERROR);
      // We still return a message for the feature's error state
      return GENERIC_UNEXPECTED_ERROR;
    }

    if (error.status >= 400 && error.status < 500) {
      // --- 2. Expected Error ---
      // This is a feature-level error. We return the specific message from the backend.
      return this.extractExpectedErrorMessage(error);
    }

    // Handle other unexpected HTTP errors
    return GENERIC_EXPECTED_ERROR;
  }

  private extractExpectedErrorMessage(error: HttpErrorResponse): string {
    const errorBody = error.error;

    if (errorBody && errorBody.message) {
      if (Array.isArray(errorBody.message)) {
        // This is a ValidationPipe error. Take the first message.
        return errorBody.message[0];
      }
      if (typeof errorBody.message === 'string') {
        // This is a manual HttpException (e.g., "Invalid credentials").
        return errorBody.message;
      }
    }

    // Fallback
    return GENERIC_EXPECTED_ERROR;
  }

  /**
   * Dispatches the global error action to the store.
   */
  private dispatchGlobalError(error: string): void {
    this.store.dispatch(CoreActions.setGlobalError({ error }));
  }
}
