export enum FileStatus {
  PENDING = 'PENDING', // User requested upload URL
  UPLOADED = 'UPLOADED', // User confirmed upload completed
  PROCESSING = 'PROCESSING', // File is being analyzed/compressed
  AVAILABLE = 'AVAILABLE', // Ready for consumption
  FAILED = 'FAILED', // Processing or Upload failed
}
