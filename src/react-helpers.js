// DONE — React 19 Core Helper & Hyperscript Tagged Markup
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
  createContext,
  Fragment
} from 'react';
import { createRoot } from 'react-dom/client';
import htm from 'htm';

// Safe parser converting CSS string styles into React 19-compatible style objects
export function parseStyleString(str) {
  if (typeof str !== 'string') return str;
  const styleObj = {};
  const rules = str.split(';');
  for (let rule of rules) {
    rule = rule.trim();
    if (!rule) continue;
    const colonIdx = rule.indexOf(':');
    if (colonIdx === -1) continue;
    const rawKey = rule.slice(0, colonIdx).trim();
    const val = rule.slice(colonIdx + 1).trim();
    if (!rawKey || !val) continue;

    // Convert kebab-case to camelCase: font-size -> fontSize, z-index -> zIndex, margin-top -> marginTop
    let camelKey = rawKey.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
    if (camelKey.startsWith('ms')) {
      camelKey = 'ms' + camelKey.slice(2);
    }
    styleObj[camelKey] = val;
  }
  return styleObj;
}

// React 19 createElement wrapper to auto-normalize HTML attributes (class -> className, string style -> object style)
export function safeCreateElement(type, props, ...children) {
  if (props && typeof props === 'object') {
    let modified = false;
    let newProps = props;

    // Normalize class to className if className not explicitly set
    if (props.class !== undefined && props.className === undefined) {
      if (!modified) { newProps = { ...props }; modified = true; }
      newProps.className = props.class;
      delete newProps.class;
    }

    // Convert string style attribute to React 19 object (prevents Minified React error #62)
    if (typeof props.style === 'string') {
      if (!modified) { newProps = { ...props }; modified = true; }
      newProps.style = parseStyleString(props.style);
    }

    return React.createElement(type, newProps, ...children);
  }
  return React.createElement(type, props, ...children);
}

// Safe htm binding compatible with both ESM default and named module exports
const htmFn = (typeof htm === 'function') ? htm : (htm && htm.default) ? htm.default : htm;
export const html = htmFn.bind(safeCreateElement);

export {
  React,
  Fragment,
  createRoot,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
  createContext
};
