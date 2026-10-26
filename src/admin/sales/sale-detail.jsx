import React from 'react';
import { fmt$$, fmtDate } from '../api';

// ============================================================
// SALE DETAIL
// ============================================================
export function SaleDetail({ sale, onClose }) {
  if (!sale) return null;
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <div className="admin-modal-title">
            <span>Sale Details</span>
            <span className={`badge badge-${sale.channel}`}>{sale.channel}</span>
          </div>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="admin-modal-amount">{fmt$$(sale.amount)}</div>
        <div className="admin-modal-date">{fmtDate(sale.date)}</div>

        <div className="admin-detail-grid">
          {(sale.products?.length > 0 || sale.productName) ? (
            <div className="admin-detail-row">
              <span className="admin-detail-label">{(sale.products?.length ?? 1) > 1 ? 'Products' : 'Product'}</span>
              <span className="admin-detail-value">
                {sale.products?.length > 0
                  ? sale.products.map((p, i) => (
                      <span key={i} style={{ display: 'block' }}>
                        {p.id
                          ? <a href={`/listing/${p.id}`} target="_blank" rel="noopener noreferrer" className="admin-detail-link">{p.name || p.id}</a>
                          : (p.name || '—')
                        }
                      </span>
                    ))
                  : sale.productName}
              </span>
            </div>
          ) : null}

          <div className="admin-detail-row">
            <span className="admin-detail-label">Payment</span>
            <span className="admin-detail-value">{sale.paymentMethod || '—'}</span>
          </div>

          {sale.customer && sale.customer !== '—' ? (
            <div className="admin-detail-row">
              <span className="admin-detail-label">Buyer</span>
              <span className="admin-detail-value">{sale.customer}</span>
            </div>
          ) : null}

          {sale.email ? (
            <div className="admin-detail-row">
              <span className="admin-detail-label">Email</span>
              <span className="admin-detail-value">{sale.email}</span>
            </div>
          ) : null}

          {sale.notes ? (
            <div className="admin-detail-row">
              <span className="admin-detail-label">Notes</span>
              <span className="admin-detail-value">{sale.notes}</span>
            </div>
          ) : null}

          <div className="admin-detail-row">
            <span className="admin-detail-label">ID</span>
            <span className="admin-detail-value admin-mono" style={{ fontSize: 11, wordBreak: 'break-all' }}>{sale.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
