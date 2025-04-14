export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const event = req.body;
  console.log('🚀 Incoming event from RevenueCat:', JSON.stringify(event, null, 2));

  const email = event?.subscriber_attributes?.email?.value;
  const eventId = event?.event_id || event?.id || `evt_${Date.now()}`;
  const amountCents = event?.amount_cents || 100;

  if (!eventId) {
    console.log('❌ Missing eventId');
    return res.status(400).json({ error: 'Missing required event ID' });
  }

  const payload = {
    event_id: eventId,
    plan: "maxlyft-monthly",
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
    console.log("Sending this payload to FirstPromoter:", payload);
    console.log("FirstPromoter response:", result);
    res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('🔥 FirstPromoter ERROR:', err);
    res.status(500).json({ error: 'Failed to forward to FirstPromoter' });
  }
}
