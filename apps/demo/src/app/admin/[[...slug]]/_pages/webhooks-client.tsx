'use client';

import { PageHeader, Card, Badge } from './_shared';

const MOCK_WEBHOOKS = [
  { id: 'wh1', url: 'https://hooks.zapier.com/hooks/catch/123/abc', events: ['enrollment.created', 'purchase.completed'], isActive: true, lastDelivery: '2026-04-07', lastStatus: 200 },
  { id: 'wh2', url: 'https://api.mysite.com/webhooks/course', events: ['enrollment.completed', 'certificate.issued'], isActive: true, lastDelivery: '2026-04-06', lastStatus: 200 },
  { id: 'wh3', url: 'https://old.endpoint.com/hook', events: ['purchase.completed'], isActive: false, lastDelivery: '2026-03-15', lastStatus: 500 },
];

export function WebhooksPage() {
  return (
    <>
      <PageHeader
        title="Webhooks"
        subtitle={`${MOCK_WEBHOOKS.length} endpoints configured`}
        actions={<button className="admin-btn admin-btn--primary">Add Webhook</button>}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {MOCK_WEBHOOKS.map((wh) => (
          <Card key={wh.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{wh.url}</div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {wh.events.map((e) => (
                    <span key={e} style={{ fontSize: '11px', background: 'var(--admin-bg-alt)', padding: '2px 8px', borderRadius: 4 }}>{e}</span>
                  ))}
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--admin-text-muted)' }}>
                  Last delivery: {new Date(wh.lastDelivery).toLocaleDateString()} — Status: {wh.lastStatus}
                </div>
              </div>
              <Badge status={wh.isActive ? 'active' : 'paused'} />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
