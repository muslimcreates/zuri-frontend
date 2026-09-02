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
