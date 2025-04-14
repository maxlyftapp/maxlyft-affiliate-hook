export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const event = req.body;
  const email = event?.subscriber_attributes?.email?.value;
  const eventId = event?.event_id || event?.id || `evt_${Date.now()}`;
  const amountCents = event?.amount_cents || 100;

  if (!email || !eventId) {
    return res.status(400).json({ error: 'Missing required email or event ID' });
  }

  const payload = {
    email,
    event_id: eventId,
    amount_cents: amountCents,
    plan: "maxlyft-monthly"
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
    res.status(200).json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to forward to FirstPromoter' });
  }
}
