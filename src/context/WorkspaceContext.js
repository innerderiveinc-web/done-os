// DONE — Workspace & Organization Context
import { React, createContext, useContext, useState, useEffect, html } from '../react-helpers.js';
import { db } from '../services/db.js';
import { config } from '../config.js';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [organization, setOrganization] = useState(db.getOrganization());
  const [metrics, setMetrics] = useState(db.getValidationMetrics());

  const refreshWorkspace = () => {
    setOrganization(db.getOrganization());
    setMetrics(db.getValidationMetrics());
  };

  const updateOrg = (patch) => {
    const updated = db.updateOrganization(patch);
    setOrganization(updated);
    return updated;
  };

  const updateOrgName = (name) => {
    return updateOrg({ name });
  };

  const value = {
    organization,
    plan: organization.plan || 'growth',
    metrics,
    refreshWorkspace,
    updateOrganization: updateOrg,
    updateOrgName
  };

  return html`
    <${WorkspaceContext.Provider} value=${value}>
      ${children}
    <//>
  `;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
