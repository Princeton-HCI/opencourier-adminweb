export type WithSheetCallbacks<T> = {
  onSuccess?: (args: T) => void
  onError?: (args: Error) => void
  onSettled?: () => void
}
