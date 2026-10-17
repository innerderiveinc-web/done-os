// DONE — Production Supabase Client & SDK Integration
import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

let supabaseClient = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  if (config.supabaseUrl && config.supabaseAnonKey) {
    try {
      supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
      console.log('[Supabase] Connected to live Supabase project:', config.supabaseUrl);
    } catch (err) {
      console.warn('[Supabase] Initialization error:', err);
    }
  }
  return supabaseClient;
}

export const isLiveBackend = () => Boolean(config.supabaseUrl && config.supabaseAnonKey);

export async function uploadToSupabaseStorage(file, storagePath) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb.storage
    .from('request-attachments')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('[Supabase Storage] Upload error:', error);
    throw error;
  }

  // Generate private signed URL valid for 24 hours
  const { data: signedData, error: signErr } = await sb.storage
    .from('request-attachments')
    .createSignedUrl(storagePath, 86400);

  if (signErr) {
    console.error('[Supabase Storage] Sign URL error:', signErr);
    return null;
  }

  return {
    path: data.path,
    signedUrl: signedData.signedUrl
  };
}

export async function fetchPublicRequestRpc(token) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb.rpc('get_public_request_by_token', { p_token: token });
  if (error) {
    console.error('[Supabase RPC] get_public_request_by_token error:', error);
    return null;
  }
  return data;
}

export async function submitPublicActionRpc(token, actionId, status, result) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb.rpc('submit_public_action', {
    p_token: token,
    p_action_id: String(actionId),
    p_status: status,
    p_result: result || {}
  });

  if (error) {
    console.error('[Supabase RPC] submit_public_action error:', error);
    throw error;
  }
  return data;
}
