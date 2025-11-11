import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const CoreActions = createActionGroup({
  source: 'Core',
  events: {
    'Set Global Error': props<{ error: string }>(),
    'Clear Global Error': emptyProps(),
  },
});
