export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const fullEvent = req.body;
  const event = fullEvent?.event;

  // Debug: send full payload to webhook.site for inspection
  await fetch("https://webhook.site/a5ed0e76-3a96-4dc4-985c-e9f406988723", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fullEvent),
  });

  const productId = event?.product_id;
  const email = event?.subscriber_attributes?.email?.value;
  const eventId = event?.event_id || event?.id || `evt_${Date.now()}`;

  let plan;
  if (productId === "maxlyft.monthly7") {
    plan = "maxlyft-monthly";
  } else if (productId === "maxlyft.yearly7") {
    plan = "maxlyft-yearly";
  } else {
    console.log('❌ Invalid or missing product_id:', productId);
    return res.status(400).json({ error: 'Invalid or missing product_id' });
  }

  const amountCents = event?.amount_cents || (plan === "maxlyft-yearly" ? 999 : 99);

  if (!eventId) {
    console.log('❌ Missing eventId');
    return res.status(400).json({ error: 'Missing required event ID' });
  }

  const payload = {
    event_id: eventId,
    plan,
    amount_cents: amountCents,
    ...(email && { email })
  };

  try {
    const response = await fetch('https://firstpromoter.com/api/v1/track/sale', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRSTPROMOTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("✅ Payload sent to FirstPromoter:", payload);
    console.log("📨 FirstPromoter response:", result);
    res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('🔥 FirstPromoter ERROR:', err);
    res.status(500).json({ error: 'Failed to forward to FirstPromoter' });
  }
}

