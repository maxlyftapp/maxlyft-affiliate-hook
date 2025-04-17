export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const event = req.body;
  console.log("🔔 RevenueCat Event:", event.event);

  const validEvents = [
    "INITIAL_PURCHASE",
    "RENEWAL",
    "NON_RENEWING_PURCHASE"
  ];

  if (!validEvents.includes(event.event)) {
    return res.status(200).json({ message: "Ignored event" });
  }

  const email = event?.subscriber_attributes?.$email?.value;
  const referralCode = event?.subscriber_attributes?.referral_code?.value;

  if (!email || !referralCode) {
    return res.status(400).json({ message: "Missing email or referral code" });
  }

  const amount = 9.99; // You can replace with dynamic value if needed

  const googleWebhookURL = "https://script.google.com/macros/s/AKfycbxGkJhAfHJOjsiRRwcvawmEs55lROy6dcqfsaTcR7Gpp0xLpzOrSv470PJNHkj3IQvQbw/exec"; // your Apps Script URL

  try {
    // 🔁 Send to Google Sheets
    await fetch(googleWebhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referral_code: referralCode,
        amount
      })
    });

    // ✅ Success response to RevenueCat
    res.status(200).json({ message: "Logged to Google Sheet" });

  } catch (err) {
    console.error("❌ Error forwarding to Google Sheets:", err);
    res.status(500).json({ message: "Failed to send to Google Sheet" });
  }
}
