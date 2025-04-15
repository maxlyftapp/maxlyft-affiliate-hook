export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const fullEvent = req.body;
  const event = fullEvent?.event;

  const referralCode = event?.subscriber_attributes?.referral_code?.value || "none";
  const userId = event?.subscriber_attributes?.email?.value || event?.app_user_id || "unknown";
  const productId = event?.product_id || "";
  const timestamp = new Date().toISOString();
  const amount = event?.amount_cents ? event.amount_cents / 100 : "";
  const plan = productId.includes("yearly") ? "Yearly" : productId.includes("monthly") ? "Monthly" : "Unknown";

  const eventName = event?.name || "";
  let status = "unknown";
  if (eventName === "INITIAL_PURCHASE") status = "subscribed";
  else if (eventName === "RENEWAL") status = "renewed";
  else if (eventName === "CANCELLATION") status = "cancelled";

  // 🟢 Send to Google Sheets Apps Script webhook
  await fetch("https://script.google.com/macros/s/AKfycbxX7v6HVf_eQPviLJnyVRKAyS7mq0f3GuJ0MQ1hCs1s1W6rq6TLCiYA4kpveqXmjfXx/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      referral_code: referralCode,
      user_id: userId,
      timestamp,
      plan,
      amount,
      status
    })
  });

  res.status(200).json({ success: true });
}
