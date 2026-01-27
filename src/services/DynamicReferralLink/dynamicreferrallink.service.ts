import { randomBytes } from "crypto";

export function generate16DigitGUID(): string {
  // Generate 8 random bytes
  const buffer = randomBytes(8);

  // Convert the buffer to a 16-character hexadecimal string
  const hex = buffer.toString("hex");

  // Insert hyphens to format as GUID
  return `${hex.substr(0, 4)}-${hex.substr(4, 4)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}`;
}
