// Africa's Talking SMS integration. Sandbox by default (free, simulated
// delivery — nothing actually reaches a phone). Going live later just
// means changing AFRICASTALKING_USERNAME from "sandbox" to your real
// account username and buying credit — same code either way.
const BASE_URL_SANDBOX = "https://api.sandbox.africastalking.com/version1/messaging";
const BASE_URL_LIVE = "https://api.africastalking.com/version1/messaging";

export async function sendSms(to: string, message: string) {
  const username = process.env.AFRICASTALKING_USERNAME || "sandbox";
  const apiKey = process.env.AFRICASTALKING_API_KEY;

  if (!apiKey) {
    console.error("AFRICASTALKING_API_KEY not set — skipping SMS");
    return;
  }

  const url = username === "sandbox" ? BASE_URL_SANDBOX : BASE_URL_LIVE;
  const normalizedTo = to.startsWith("+") ? to : `+${to.replace(/^0/, "254")}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        username,
        to: normalizedTo,
        message,
      }),
    });

    if (!res.ok) {
      console.error("SMS send failed:", await res.text());
    }
  } catch (err) {
    // Notifications are a nice-to-have — if SMS fails, we log it but
    // never let that break the actual job/payment flow that triggered it.
    console.error("SMS error:", err);
  }
}
