// SHA-256 simulated and Web Crypto standard implementation for encrypted transaction processing

export async function generateTransactionSignature(payload: {
  receiptNumber: string;
  timestamp: string;
  total: number;
  cashierId: string;
}): Promise<{ transactionHash: string; encryptedToken: string }> {
  const dataString = `${payload.receiptNumber}|${payload.timestamp}|${payload.total}|${payload.cashierId}|OCD_CAFE_SECURE_SALT_v1`;
  
  try {
    if (window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(dataString);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Generate a simulated encrypted token payload
      const maskedPart = hashHex.substring(0, 16).toUpperCase();
      const token = `ENC_TXN_${maskedPart}_${Date.now().toString(36).toUpperCase()}`;
      return { transactionHash: hashHex, encryptedToken: token };
    }
  } catch {
    // fallback if crypto.subtle is restricted
  }

  // Fallback hash implementation
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(16, '0') + Date.now().toString(16);
  return {
    transactionHash: `ocd_hash_${hex}`,
    encryptedToken: `ENC_TXN_${hex.substring(0, 12).toUpperCase()}`
  };
}

export function generateReceiptNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `OCD-${dateStr}-${randomSuffix}`;
}
