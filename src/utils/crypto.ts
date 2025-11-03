import crypto from "crypto";

export const randomToken = (size = 48): string =>
  crypto.randomBytes(size).toString("hex");

export const sha256 = (value: string): string =>
  crypto.createHash("sha256").update(value).digest("hex");
