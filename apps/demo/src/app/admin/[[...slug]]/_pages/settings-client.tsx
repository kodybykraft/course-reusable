'use client';

import { useState } from 'react';
import { PageHeader, Card, FormGroup, Badge } from './_shared';

/* ==========================================================================
   Settings — Admin Client Components
   ========================================================================== */

export function SettingsGeneralClient() {
  const [form, setForm] = useState({
    platformName: 'My Course Platform',
    supportEmail: 'support@example.com',
    defaultLanguage: 'en',
    timezone: 'UTC',
  });

  const set = (key: keyof typeof form, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <PageHeader title="General Settings" subtitle="Platform configuration" />
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormGroup label="Platform Name">
            <input className="admin-input" value={form.platformName} onChange={(e) => set('platformName', e.target.value)} />
          </FormGroup>

          <FormGroup label="Support Email">
            <input className="admin-input" type="email" value={form.supportEmail} onChange={(e) => set('supportEmail', e.target.value)} />
          </FormGroup>

          <FormGroup label="Default Language">
            <select className="admin-input" value={form.defaultLanguage} onChange={(e) => set('defaultLanguage', e.target.value)}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ar">Arabic</option>
            </select>
          </FormGroup>

          <FormGroup label="Timezone">
            <select className="admin-input" value={form.timezone} onChange={(e) => set('timezone', e.target.value)}>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Dubai">Dubai</option>
            </select>
          </FormGroup>
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="admin-btn admin-btn--primary">Save Settings</button>
        </div>
      </Card>
    </div>
  );
}

export function SettingsPaymentsClient() {
  const [currency, setCurrency] = useState('usd');
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState('0');

  return (
    <div>
      <PageHeader title="Payment Settings" subtitle="Stripe and tax configuration" />
      <Card title="Stripe Connection">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ color: '#A3AED0', fontSize: 14 }}>Status:</span>
          <Badge status="active" />
          <span style={{ color: '#A3AED0', fontSize: 13 }}>Connected as acct_1234</span>
        </div>
        <button type="button" className="admin-btn admin-btn--secondary">Reconnect Stripe</button>
      </Card>

      <div style={{ marginTop: 20 }}>
        <Card title="Currency & Tax">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormGroup label="Currency">
              <select className="admin-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="usd">USD ($)</option>
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
                <option value="aed">AED</option>
              </select>
            </FormGroup>

            <FormGroup label="Tax Collection">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 38 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#A3AED0', fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={taxEnabled} onChange={(e) => setTaxEnabled(e.target.checked)} />
                  Enable tax collection
                </label>
              </div>
            </FormGroup>

            {taxEnabled && (
              <FormGroup label="Tax Rate (%)" hint="Applied to all purchases">
                <input className="admin-input" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
              </FormGroup>
            )}
          </div>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="admin-btn admin-btn--primary">Save Payments</button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function SettingsBrandingClient() {
  const [form, setForm] = useState({
    logoUrl: 'https://example.com/logo.png',
    primaryColor: '#2D60FF',
    accentColor: '#1B2559',
  });

  const set = (key: keyof typeof form, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <PageHeader title="Branding" subtitle="Logo and color customization" />
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <FormGroup label="Logo URL">
              <input className="admin-input" value={form.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} />
            </FormGroup>
          </div>

          <FormGroup label="Primary Color">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={form.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} style={{ width: 38, height: 38, border: 'none', background: 'none', cursor: 'pointer' }} />
              <input className="admin-input" value={form.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} style={{ flex: 1 }} />
            </div>
          </FormGroup>

          <FormGroup label="Accent Color">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={form.accentColor} onChange={(e) => set('accentColor', e.target.value)} style={{ width: 38, height: 38, border: 'none', background: 'none', cursor: 'pointer' }} />
              <input className="admin-input" value={form.accentColor} onChange={(e) => set('accentColor', e.target.value)} style={{ flex: 1 }} />
            </div>
          </FormGroup>
        </div>

        {/* Preview */}
        <div style={{ marginTop: 24, padding: 20, background: '#111C44', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, color: '#A3AED0', marginBottom: 12 }}>Preview</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 8, background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 11, overflow: 'hidden' }}>
              {form.logoUrl ? <img src={form.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : 'Logo'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 80, height: 32, borderRadius: 6, background: form.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 600 }}>Primary</div>
              <div style={{ width: 80, height: 32, borderRadius: 6, background: form.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 600 }}>Accent</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="admin-btn admin-btn--primary">Save Branding</button>
        </div>
      </Card>
    </div>
  );
}
