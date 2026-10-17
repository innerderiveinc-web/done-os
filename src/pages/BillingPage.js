// DONE — Billing & Subscriptions (React 19 Component)
import { React, useState, html } from '../react-helpers.js';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { db } from '../services/db.js';
import { showToast } from '../components/toast.js';

export function BillingPage({ navigate }) {
  const { organization, updatePlan } = useWorkspace();
  const [selectedPlan, setSelectedPlan] = useState(organization?.plan || 'growth');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '₹0',
      period: '/month',
      requestsLimit: '10 requests / month',
      description: 'Test the request workflow with zero commitment',
      features: ['10 requests / month', 'All 4 request types', 'WhatsApp & Email sharing', 'Recipient no-app flow', '7-day audit history']
    },
    {
      id: 'starter',
      name: 'Starter',
      price: '₹299',
      period: '/month',
      requestsLimit: '100 requests / month',
      description: 'Ideal for independent professionals & freelancers',
      features: ['100 requests / month', 'Multi-action requests', 'AI natural language composer', 'Scheduled reminders', '90-day audit timeline', 'Custom templates']
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '₹799',
      period: '/month',
      requestsLimit: '500 requests / month',
      popular: true,
      description: 'For growing client-facing SMBs and agencies',
      features: ['500 requests / month', 'Team workspace & RBAC roles', 'Custom brand watermark', 'Product validation analytics', 'Priority WhatsApp delivery', 'Webhook integration']
    },
    {
      id: 'business',
      name: 'Business',
      price: '₹1,499',
      period: '/month',
      requestsLimit: '2,000 requests / month',
      description: 'High-volume firms requiring enterprise controls',
      features: ['2,000 requests / month', 'Unlimited team members', 'Dedicated account manager', 'Custom API access', 'SLA uptime guarantee', 'Full data export']
    }
  ];

  const handlePlanSelect = (planId) => {
    updatePlan(planId);
    setSelectedPlan(planId);
    showToast(`Workspace upgraded to ${planId.toUpperCase()} Plan!`, 'success');
  };

  const totalRequests = db.getRequests().length;
  const planLimits = { free: 10, starter: 100, growth: 500, business: 2000 };
  const currentLimit = planLimits[selectedPlan] || 500;
  const usagePercent = Math.min(100, parseFloat(((totalRequests / currentLimit) * 100).toFixed(1)));

  return html`
    <section className="page billing-page">
      <div className="hero compact">
        <div>
          <div className="eyebrow">BILLING & USAGE</div>
          <h1>Subscription & Limits</h1>
          <p className="lead">Recipients are always 100% free. Upgrade anytime as your request volume grows.</p>
        </div>
      </div>

      
      <div className="card current-plan-card mt-16">
        <div className="current-plan-head">
          <div>
            <span className="eyebrow">ACTIVE PLAN</span>
            <h2>${organization?.name || 'Northstar Consulting'} — <span className="text-green">${(selectedPlan || 'growth').toUpperCase()}</span></h2>
            <p>Next billing cycle renews in 25 days. Billed monthly.</p>
          </div>
          <div>
            <span className="badge badge-success" style=${{ fontSize: '12px', padding: '6px 12px' }}>
              ✓ Active Subscription
            </span>
          </div>
        </div>

        <div className="usage-meter-row mt-16">
          <div className="meter-info">
            <span>Monthly Request Usage</span>
            <strong>${totalRequests} / ${currentLimit} requests used (${usagePercent}%)</strong>
          </div>
          <div className="meter-track">
            <div className="meter-fill" style="width: ${usagePercent}%;"></div>
          </div>
        </div>
      </div>

      
      <div className="billing-plans-grid mt-24">
        ${plans.map(p => {
          const isCurrent = selectedPlan === p.id;
          return html`
            <div key=${p.id} className=${`billing-plan-card card ${p.popular ? 'popular' : ''} ${isCurrent ? 'active-plan' : ''}`}>
              ${p.popular ? html`<div className="popular-ribbon">RECOMMENDED</div>` : null}
              <div className="plan-header">
                <h3>${p.name}</h3>
                <div className="plan-price-row">
                  <span className="plan-amount">${p.price}</span>
                  <span className="plan-period">${p.period}</span>
                </div>
                <p className="plan-sub-text">${p.description}</p>
              </div>

              <div className="plan-divider"></div>

              <ul className="plan-features-list">
                ${p.features.map((f, i) => html`<li key=${i}>✓ ${f}</li>`)}
              </ul>

              <div className="plan-action-bottom">
                ${isCurrent ? html`
                  <button className="btn btn-secondary wide disabled" disabled>Current Active Plan</button>
                ` : html`
                  <button
                    className=${`btn ${p.popular ? 'btn-primary' : 'btn-secondary'} wide`}
                    onClick=${() => handlePlanSelect(p.id)}
                  >
                    Switch to ${p.name} →
                  </button>
                `}
              </div>
            </div>
          `;
        })}
      </div>
    </section>
  `;
}
