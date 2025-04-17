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

  const FIRST_PROMOTER_API_KEY = process.env.FIRST_PROMOTER_API_KEY;

  try {
    const payload = {
      email,
      referral_code: referralCode,
      amount: 9.99,
      currency: "USD",
      type: "sale"
    };

    const response = await fetch("https://api.firstpromoter.com/v1/conversions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRST_PROMOTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("✅ Sent to FirstPromoter:", data);
    res.status(200).json({ message: "Conversion sent" });
  } catch (err) {
    console.error("❌ Error forwarding to FirstPromoter:", err);
    res.status(500).json({ message: "Failed to send conversion" });
  }
  // Add this inside your handler logic
const googleWebhookURL = "https://script.google.com/macros/s/AKfycbxGkJhAfHJOjsiRRwcvawmEs55lROy6dcqfsaTcR7Gpp0xLpzOrSv470PJNHkj3IQvQbw/exec"; // replace this

await fetch(googleWebhookURL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    referral_code: referralCode,
    amount: 9.99 // or dynamically based on the product
  })
});

}

