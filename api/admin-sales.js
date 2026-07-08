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
        .map(s => ({
          id: s.id,
          channel: 'online',
          amount: s.amount_total,
          currency: s.currency,
          date: s.created,
          customer: s.customer_details?.name || s.customer_details?.email || '—',
          email: s.customer_details?.email || '',
          productId: s.metadata?.productId || '',
          paymentMethod: 'Stripe Checkout',
        }));

      const manualSales = invoices
        .filter(inv => inv.metadata?.manual === 'true' && inv.metadata?.deleted !== 'true')
        .map(inv => ({
          id: inv.id,
          channel: 'manual',
          amount: inv.amount_paid,
          currency: inv.currency,
          date: inv.created,
          customer: inv.metadata?.buyerName || '—',
          email: inv.customer_email || '',
          productId: inv.metadata?.productId || '',
          productName: inv.metadata?.productName || '',
          paymentMethod: inv.metadata?.paymentMethod || 'Other',
          notes: inv.metadata?.notes || '',
        }));

      const sales = [...onlineSales, ...manualSales].sort((a, b) => b.date - a.date);
      return res.status(200).json({ sales });
    }

    if (req.method === 'POST') {
      const { buyerName, buyerEmail, productId, productName, amount, paymentMethod, notes } = await parseBody(req);

      if (!amount) return res.status(400).json({ error: 'amount required' });

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
          productId: productId || '',
          productName: productName || '',
          paymentMethod: paymentMethod || 'Other',
          notes: notes || '',
        },
      });

      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        amount: Math.round(parseFloat(amount) * 100),
        currency: 'usd',
        description: productName || 'Manual Sale',
      });

      await stripe.invoices.finalizeInvoice(invoice.id);
      await stripe.invoices.pay(invoice.id, { paid_out_of_band: true });

      if (productId) {
        await stripe.products.update(productId, { metadata: { available: 'false' } });
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
