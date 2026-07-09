import Stripe from 'stripe';

function shape(p, price) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    images: p.images,
    model: p.metadata.model,
    serial: p.metadata.serial,
    type: p.metadata.type,
    condition: p.metadata.condition,
    available: p.metadata.available !== 'false',
    price: price?.unit_amount ?? null,
    priceId: price?.id ?? null,
    currency: price?.currency ?? 'usd',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // Single product lookup
    if (req.query.id) {
      const p = await stripe.products.retrieve(req.query.id);
      if (p.metadata.deadstock !== 'true') return res.status(404).json({ error: 'Not found' });
      const { data: prices } = await stripe.prices.list({ product: p.id, active: true, limit: 1 });
      return res.status(200).json({ listing: shape(p, prices[0]) });
    }

    // All available listings
    const { data: products } = await stripe.products.list({ limit: 100, active: true });
    const listings = await Promise.all(
      products
        .filter(p => p.metadata.deadstock === 'true' && p.metadata.available !== 'false')
        .map(async (p) => {
          const { data: prices } = await stripe.prices.list({ product: p.id, active: true, limit: 1 });
          return shape(p, prices[0]);
        })
    );

    res.status(200).json({ listings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
}
