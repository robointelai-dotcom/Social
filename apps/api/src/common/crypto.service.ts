import crypto from "crypto";

/**
 * CryptoService is a singleton class that provides methods for encryption, decryption, and hashing.
 * It uses the AES-256-CBC algorithm for encryption and decryption, and HMAC-SHA256 for hashing.
 * The service is designed to be used throughout the application for secure data handling.
 */
export class CryptoService {
  private static instance: CryptoService;
  private key: string;

  private constructor(key: string) {
    this.key = key;
  }

  public static getInstance(key: string): CryptoService {
    if (!CryptoService.instance) {
      if (!key) {
        throw new Error("Encryption key must be provided");
      }
      CryptoService.instance = new CryptoService(key);
    }
    this.instance.key = key; // Update the key if needed
    return CryptoService.instance;
  }

  private getKey() {
    if (!this.key) {
      throw new Error("Encryption key is not set");
    }
    // Ensure the key is 32 bytes for AES-256
    return crypto.createHash("sha256").update(this.key).digest();
  }

  public encrypt(text: string): string {
    const iv = Buffer.alloc(16, 0); // Initialize IV with zeros for simplicity

    const cipher = crypto.createCipheriv("aes-256-cbc", this.getKey(), iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }

  public decrypt(encryptedText: string): string {
    const iv = Buffer.alloc(16, 0); // Initialize IV with zeros for simplicity

    const decipher = crypto.createDecipheriv("aes-256-cbc", this.getKey(), iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  public hash(text: string): string {
    return crypto
      .createHmac("sha256", this.getKey())
      .update(text)
      .digest("hex");
  }
}
