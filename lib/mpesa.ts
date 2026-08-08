// M-Pesa Daraja sandbox integration. Sandbox only for now — going live
// later means swapping BASE_URL and getting production credentials from
// Safaricom, but the request shapes stay the same.
const BASE_URL = "https://sandbox.safaricom.co.ke";

export async function getMpesaAccessToken() {
  const key = process.env.MPESA_CONSUMER_KEY!;
  const secret = process.env.MPESA_CONSUMER_SECRET!;
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");

  const res = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );

  if (!res.ok) throw new Error("Failed to get M-Pesa access token");
  const data = await res.json();
  return data.access_token as string;
}

function formatTimestamp() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

// Accepts 0700..., 700..., or 2547... and normalizes to 2547... which is
// what Daraja requires.
export function normalizeKenyanPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  return "254" + digits;
}

export async function initiateStkPush({
  phone,
  amount,
  accountReference,
  transactionDesc,
}: {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}) {
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const callbackUrl = process.env.MPESA_CALLBACK_URL!;
  const timestamp = formatTimestamp();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
    "base64"
  );
  const accessToken = await getMpesaAccessToken();

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: normalizeKenyanPhone(phone),
      PartyB: shortcode,
      PhoneNumber: normalizeKenyanPhone(phone),
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.errorMessage || "STK Push request failed");
  }
  return data as { CheckoutRequestID: string; MerchantRequestID: string };
}