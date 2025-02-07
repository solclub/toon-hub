export default function logWithTimestamp(message: string): void {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] ${message}`);
}
