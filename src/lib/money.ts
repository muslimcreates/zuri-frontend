// Mirrors zuri-express-backend/src/lib/money.ts — prices travel as integer
// kuruş (1 TRY = 100 kuruş) so nothing here has to deal with float rounding.

export function kurusToTRY(kurus: number): number {
  return kurus / 100;
}

export function tryToKurus(tryAmount: number): number {
  return Math.round(tryAmount * 100);
}

export function formatTRY(kurus: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(kurusToTRY(kurus));
}

// Half-upfront payment policy: a customer pays a 50% deposit to confirm the
// order, with the remaining balance due on delivery. Rounds the deposit up
// to the nearest whole TRY so it's a clean amount to send via bank
// transfer/M-Pesa — the balance simply absorbs the rounding difference so
// deposit + balance always equals the order total exactly.
export function splitDeposit(subtotalKurus: number): { depositKurus: number; balanceKurus: number } {
  const depositKurus = Math.ceil(subtotalKurus / 2 / 100) * 100;
  return { depositKurus, balanceKurus: subtotalKurus - depositKurus };
}
