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
      const [{ data: sessions }, { data: invoices }] = await Promise.all([
        stripe.checkout.sessions.list({ limit: 100 }),
        stripe.invoices.list({ limit: 100 }),
      ]);

      const onlineSales = sessions
        .filter(s => s.payment_status === 'paid')
        .map(s => {
          const ids = (s.metadata?.productIds || s.metadata?.productId || '').split(',').filter(Boolean);
          const names = (s.metadata?.productNames || s.metadata?.productName || '').split(',').filter(Boolean);
          const products = ids.map((id, i) => ({ id, name: names[i] || '' }));
          return {
            id: s.id,
            channel: 'online',
            amount: s.amount_total,
            currency: s.currency,
            date: s.created,
            customer: s.customer_details?.name || s.customer_details?.email || '—',
            email: s.customer_details?.email || '',
            products,
            productName: products.map(p => p.name).filter(Boolean).join(', '),
            productId: ids[0] || '',
            paymentMethod: 'Stripe Checkout',
          };
        });

      const manualSales = invoices
        .filter(inv => inv.metadata?.manual === 'true' && inv.metadata?.deleted !== 'true')
        .map(inv => {
          let products = [];
          try {
            if (inv.metadata?.productNames) {
              const names = JSON.parse(inv.metadata.productNames);
              const ids = JSON.parse(inv.metadata.productIds || '[]');
              products = names.map((name, i) => ({ name: name || '', id: ids[i] || '' })).filter(p => p.name || p.id);
            } else if (inv.metadata?.productName) {
              products = [{ name: inv.metadata.productName || '', id: inv.metadata.productId || '' }];
            }
          } catch { products = []; }

          return {
            id: inv.id,
            channel: 'manual',
            amount: inv.amount_paid,
            currency: inv.currency,
            date: inv.created,
            customer: inv.metadata?.buyerName || '—',
            email: inv.customer_email || '',
            products,
            productName: products.map(p => p.name).filter(Boolean).join(', '),
            productId: products[0]?.id || '',
            paymentMethod: inv.metadata?.paymentMethod || 'Other',
            notes: inv.metadata?.notes || '',
          };
        });

      const sales = [...onlineSales, ...manualSales].sort((a, b) => b.date - a.date);
      return res.status(200).json({ sales });
    }

    if (req.method === 'POST') {
      const { buyerName, buyerEmail, items: rawItems, productId, productName, amount, paymentMethod, notes } = await parseBody(req);

      // Normalize: new multi-item format or legacy single-item
      const items = rawItems || [{ productId: productId || '', productName: productName || '', amount }];
      if (!items.length || !items.some(i => i.amount)) {
        return res.status(400).json({ error: 'at least one item with amount required' });
      }

      let customerId;
      if (buyerEmail) {
        const { data: existing } = await stripe.customers.list({ email: buyerEmail, limit: 1 });
        customerId = existing[0]?.id;
      }
      if (!customerId) {
        const customer = await stripe.customers.create({
          name: buyerName || 'Walk-in Customer',
          email: buyerEmail || undefined,
        });
        customerId = customer.id;
      }

      const invoice = await stripe.invoices.create({
        customer: customerId,
        auto_advance: false,
        collection_method: 'send_invoice',
        days_until_due: 0,
        metadata: {
          manual: 'true',
          buyerName: buyerName || '',
          productIds: JSON.stringify(items.map(i => i.productId || '')),
          productNames: JSON.stringify(items.map(i => i.productName || '')),
          paymentMethod: paymentMethod || 'Other',
          notes: notes || '',
        },
      });

      for (const item of items) {
        await stripe.invoiceItems.create({
          customer: customerId,
          invoice: invoice.id,
          amount: Math.round(parseFloat(item.amount) * 100),
          currency: 'usd',
          description: item.productName || 'Manual Sale',
        });
      }

      await stripe.invoices.finalizeInvoice(invoice.id);
      await stripe.invoices.pay(invoice.id, { paid_out_of_band: true });

      for (const item of items) {
        if (item.productId) {
          await stripe.products.update(item.productId, { metadata: { available: 'false' } });
        }
      }

      return res.status(201).json({ success: true, invoiceId: invoice.id });
    }

    if (req.method === 'DELETE') {
      const { id } = await parseBody(req);
      if (!id) return res.status(400).json({ error: 'id required' });
      await stripe.invoices.update(id, { metadata: { deleted: 'true' } });
      return res.status(200).json({ success: true });
    }

    res.status(405).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
