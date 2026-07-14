import Stripe from 'stripe';
import { verifyToken, getToken } from './_auth.js';
import { parseBody } from './_body.js';

export default async function handler(req, res) {
  if (!verifyToken(getToken(req), process.env.JWT_SECRET)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    if (req.method === 'GET') {
      // ?source=all returns every Stripe product for the "import" picker
      if (req.query?.source === 'all') {
        const { data } = await stripe.products.list({ limit: 100, active: true });
        return res.status(200).json({
          products: data.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            images: p.images || [],
            model: p.metadata?.model || '',
            type: p.metadata?.type || '',
          })),
        });
      }

      const [{ data: active }, { data: inactive }] = await Promise.all([
        stripe.products.list({ limit: 100, active: true }),
        stripe.products.list({ limit: 100, active: false }),
      ]);

      const all = [...active, ...inactive].filter(p => p.metadata.deadstock === 'true');

      const listings = await Promise.all(all.map(async (p) => {
        const { data: prices } = await stripe.prices.list({ product: p.id, limit: 1, active: true });
        const price = prices[0];
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          images: p.images,
          active: p.active,
          available: p.metadata.available !== 'false',
          model: p.metadata.model,
          serial: p.metadata.serial,
          type: p.metadata.type,
          condition: p.metadata.condition,
          createdAt: p.created,
          price: price?.unit_amount ?? null,
          priceId: price?.id ?? null,
        };
      }));

      listings.sort((a, b) => b.createdAt - a.createdAt);
      return res.status(200).json({ listings });
    }

    if (req.method === 'POST') {
      const { name, description, images, model, serial, type, condition, price } = await parseBody(req);

      if (!name || !price) return res.status(400).json({ error: 'name and price are required' });

      const product = await stripe.products.create({
        name,
        description: description || '',
        images: (images || []).filter(Boolean).slice(0, 8),
        tax_code: 'txcd_99999999',
        metadata: {
          deadstock: 'true',
          available: 'true',
          model: model || '',
          serial: serial || '',
          type: type || 'guitar',
          condition: condition || '',
        },
      });

      const stripePrice = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(parseFloat(price) * 100),
        currency: 'usd',
        tax_behavior: 'exclusive',
      });

      return res.status(201).json({
        listing: { ...product, priceId: stripePrice.id, price: stripePrice.unit_amount },
      });
    }

    if (req.method === 'PATCH') {
      const { id, available, active, name, description, images, model, serial, type, condition, price } = await parseBody(req);

      if (!id) return res.status(400).json({ error: 'id required' });

      const updates = {};
      const meta = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (images !== undefined) updates.images = images.filter(Boolean).slice(0, 8);
      if (active !== undefined) updates.active = active;
      if (available !== undefined) meta.available = String(available);
      if (model !== undefined) meta.model = model;
      if (serial !== undefined) meta.serial = serial;
      if (type !== undefined) meta.type = type;
      if (condition !== undefined) meta.condition = condition;
      if (Object.keys(meta).length) updates.metadata = meta;

      const product = await stripe.products.update(id, updates);

      let priceId = null;
      if (price) {
        const { data: existing } = await stripe.prices.list({ product: id, active: true, limit: 1 });
        const newPrice = await stripe.prices.create({
          product: id,
          unit_amount: Math.round(parseFloat(price) * 100),
          currency: 'usd',
          tax_behavior: 'exclusive',
        });
        priceId = newPrice.id;
        if (existing[0]) await stripe.prices.update(existing[0].id, { active: false });
      }

      return res.status(200).json({ product, priceId });
    }

    res.status(405).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
