export enum DialogAction {
  SUBMIT = 'submit',
  DELETE = 'delete',
  CANCEL = 'cancel',
}

export interface DialogResult<T = unknown> {
  action: DialogAction | string;
  data?: T;
}
