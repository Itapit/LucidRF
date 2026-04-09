export interface ActionError<TSource> {
  message: string;
  source: TSource;
}
