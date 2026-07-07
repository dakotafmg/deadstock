import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { data: products } = await stripe.products.list({ limit: 100, active: true });
    const deadstockProducts = products.filter(
      p => p.metadata.deadstock === 'true' && p.metadata.available !== 'false'
    );

    const listings = await Promise.all(deadstockProducts.map(async (p) => {
      const { data: prices } = await stripe.prices.list({ product: p.id, active: true, limit: 1 });
      const price = prices[0];
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        images: p.images,
        model: p.metadata.model,
        serial: p.metadata.serial,
        type: p.metadata.type,
        condition: p.metadata.condition,
        price: price?.unit_amount ?? null,
        priceId: price?.id ?? null,
        currency: price?.currency ?? 'usd',
      };
    }));

    res.status(200).json({ listings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
}
