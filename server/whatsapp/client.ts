/**
 * WhatsApp Cloud API Client
 * Uses the official Meta WhatsApp Business Cloud API.
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const BASE_URL = 'https://graph.facebook.com/v21.0';
const PROVIDER = String(process.env.WHATSAPP_PROVIDER || 'meta')
  .trim()
  .toLowerCase();
const INVITE_TEMPLATE_ID = process.env.WHATSAPP_INVITE_TEMPLATE_ID || '';

// Token is read dynamically on every call so it can be updated at runtime via /api/admin/whatsapp-token
const getToken = () => String(process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

const GATEWAY_ENDPOINT =
  process.env.WHATSAPP_GATEWAY_ENDPOINT ||
  'https://edge.automatiklabs.com.br/functions/v1/whatsapp-api';
const GATEWAY_API_KEY = process.env.WHATSAPP_GATEWAY_API_KEY || '';

if (PROVIDER === 'meta') {
  if (!getToken()) {
    console.warn('[whatsapp] WHATSAPP_ACCESS_TOKEN não configurada.');
  }
  if (!PHONE_NUMBER_ID) {
    console.warn('[whatsapp] WHATSAPP_PHONE_NUMBER_ID não configurada.');
  }
}
if (PROVIDER === 'automatik' && !GATEWAY_API_KEY) {
  console.warn('[whatsapp] WHATSAPP_GATEWAY_API_KEY não configurada para provider automatik.');
}

async function waFetch(path: string, options: RequestInit = {}) {
  const url =
    path.length > 10 && path.indexOf('messages') === -1
      ? `https://graph.facebook.com/${path}`
      : `${BASE_URL}/${PHONE_NUMBER_ID}/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WhatsApp API ${res.status}: ${body}`);
  }
  return res.json();
}

async function gatewayFetch(body: Record<string, unknown>) {
  const res = await fetch(GATEWAY_ENDPOINT, {
    method: 'POST',
    headers: {
      'X-API-Key': GATEWAY_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Automatik API ${res.status}: ${text}`);
  }
  const contentType = String(res.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return { ok: true, raw: await res.text() };
}

function formatRecipient(raw: string): string {
  const digits = String(raw || '').replace(/\D+/g, '');
  if (!digits) return '';
  if (PROVIDER === 'meta') return digits;
  return raw.startsWith('+') ? raw : `+${digits}`;
}

export type InteractiveListRow = {
  id: string;
  title: string;
  description?: string;
};

export type InteractiveListOptions = {
  buttonText?: string;
  sectionTitle?: string;
  footerText?: string;
};

export interface WhatsAppMediaMeta {
  id: string;
  url: string;
  mime_type?: string;
  sha256?: string;
  file_size?: number;
}

// ── Send a text message ─────────────────────────────────────
export async function sendTextMessage(to: string, text: string): Promise<string> {
  const recipient = formatRecipient(to);
  if (PROVIDER === 'evolution') {
    const data = await evolutionFetch('sendText', {
      number: recipient,
      text,
    });
    return data?.key?.id || '';
  }
  if (PROVIDER === 'automatik') {
    const data = await gatewayFetch({
      action: 'sendMessage',
      to: recipient,
      type: 'text',
      text,
    });
    return data?.message_id || data?.id || data?.data?.message_id || data?.data?.id || '';
  }

  const data = await waFetch('messages', {
    method: 'POST',
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'text',
      text: { body: text },
    }),
  });
  return data.messages?.[0]?.id ?? '';
}

// Evolution API helper
async function evolutionFetch(endpoint: string, body: any) {
  const url = `${process.env.EVOLUTION_API_URL}/message/${endpoint}/${process.env.EVOLUTION_INSTANCE_NAME}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': process.env.EVOLUTION_API_KEY || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Evolution API ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Send a template message (for first contact / invitations) ──
// Template must be pre-approved in Meta Business Suite
export async function sendTemplate(
  to: string,
  templateName: string,
  language: string = 'pt_BR',
  components: Record<string, unknown>[] = []
): Promise<string> {
  const recipient = formatRecipient(to);
  
  if (PROVIDER === 'evolution') {
    // For Evolution, we often send a text if the template isn't pre-configured 
    // or use their specific template endpoint.
    // For simplicity and immediate reliability, let's use sendTextMessage as fallback
    // if it's a dynamic invite.
    const data = await evolutionFetch('sendText', {
      number: recipient,
      text: `Olá! Você foi convidado para a triagem da vaga. Responda com "OK" para começar.`,
    });
    return data?.key?.id || '';
  }

  if (PROVIDER === 'automatik') {
    const payload: Record<string, unknown> = {
      action: 'sendMessage',
      to: recipient,
      type: 'template',
      template_language: language,
    };
    if (INVITE_TEMPLATE_ID && templateName === 'recruta_convite_vaga') {
      payload.template_id = INVITE_TEMPLATE_ID;
    } else {
      payload.template_name = templateName;
    }
    if (Array.isArray(components) && components.length > 0) {
      payload.template_components = components;
    }
    const data = await gatewayFetch(payload);
    return data?.message_id || data?.id || data?.data?.message_id || data?.data?.id || '';
  }

  const templatePayload: Record<string, unknown> = {
    name: templateName,
    language: { code: language },
  };
  if (Array.isArray(components) && components.length > 0) {
    templatePayload.components = components;
  }

  const data = await waFetch('messages', {
    method: 'POST',
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'template',
      template: {
        ...templatePayload,
      },
    }),
  });
  return data.messages?.[0]?.id ?? '';
}

export async function sendListMessage(
  to: string,
  bodyText: string,
  rows: InteractiveListRow[],
  options: InteractiveListOptions = {}
): Promise<string> {
  const cleanedRows = rows
    .map((row) => ({
      id: String(row.id || '').trim(),
      title: String(row.title || '').trim(),
      description: String(row.description || '').trim(),
    }))
    .filter((row) => row.id && row.title)
    .slice(0, 10);

  if (cleanedRows.length === 0) {
    throw new Error('sendListMessage requires at least one valid row.');
  }

  if (PROVIDER === 'evolution' || PROVIDER === 'automatik') {
    const fallback = [
      bodyText,
      '',
      ...cleanedRows.map((row, idx) => `${idx + 1}) ${row.title}`),
    ].join('\n');
    return sendTextMessage(to, fallback);
  }

  const recipient = formatRecipient(to);
  const interactivePayload: Record<string, unknown> = {
    type: 'list',
    body: { text: bodyText },
    action: {
      button: String(options.buttonText || 'Menu').trim(),
      sections: [
        {
          title: String(options.sectionTitle || 'Opcoes').trim(),
          rows: cleanedRows.map((row) => ({
            id: row.id,
            title: row.title,
            ...(row.description ? { description: row.description } : {}),
          })),
        },
      ],
    },
  };

  const footerText = String(options.footerText || '').trim();
  if (footerText) {
    interactivePayload.footer = { text: footerText };
  }

  const data = await waFetch('messages', {
    method: 'POST',
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'interactive',
      interactive: interactivePayload,
    }),
  });

  return data.messages?.[0]?.id ?? '';
}

// ── Send an audio message (from a local file or URL) ────────
export async function sendAudio(to: string, audioUrl: string): Promise<string> {
  const recipient = formatRecipient(to);
  if (PROVIDER === 'evolution') {
    const data = await evolutionFetch('sendWhatsAppAudio', {
      number: recipient,
      audio: audioUrl,
    });
    return data?.key?.id || '';
  }
  if (PROVIDER === 'automatik') {
    const data = await gatewayFetch({
      action: 'sendMessage',
      to: recipient,
      type: 'audio',
      media_url: audioUrl,
    });
    return data?.message_id || data?.id || data?.data?.message_id || data?.data?.id || '';
  }

  const data = await waFetch('messages', {
    method: 'POST',
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'audio',
      audio: { link: audioUrl },
    }),
  });
  return data.messages?.[0]?.id ?? '';
}

export async function getMediaMeta(mediaId: string): Promise<WhatsAppMediaMeta> {
  if (PROVIDER === 'automatik') {
    throw new Error(
      'getMediaMeta não suportado para provider automatik. Use URL direta de mídia no webhook.'
    );
  }
  const meta = await waFetch(mediaId);
  return meta as WhatsAppMediaMeta;
}

// ── Download media (audio) from WhatsApp ────────────────────
export async function downloadMedia(mediaId: string): Promise<ArrayBuffer> {
  if (/^https?:\/\//i.test(mediaId)) {
    const direct = await fetch(mediaId);
    if (!direct.ok) throw new Error(`Failed to download media URL: ${direct.status}`);
    return direct.arrayBuffer();
  }
  const mediaMeta = await getMediaMeta(mediaId);
  const downloadUrl = mediaMeta.url;

  const res = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`Failed to download media: ${res.status}`);
  return res.arrayBuffer();
}

export async function downloadMediaWithMeta(
  mediaId: string
): Promise<{ buffer: ArrayBuffer; mimeType?: string; fileSize?: number }> {
  if (/^https?:\/\//i.test(mediaId)) {
    const res = await fetch(mediaId);
    if (!res.ok) throw new Error(`Failed to download media URL: ${res.status}`);
    const mimeType = res.headers.get('content-type') || undefined;
    const fileSizeRaw = res.headers.get('content-length');
    const fileSize = fileSizeRaw ? Number(fileSizeRaw) : undefined;
    return {
      buffer: await res.arrayBuffer(),
      mimeType,
      fileSize: Number.isFinite(fileSize || NaN) ? fileSize : undefined,
    };
  }

  const mediaMeta = await getMediaMeta(mediaId);
  const res = await fetch(mediaMeta.url, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`Failed to download media: ${res.status}`);
  return {
    buffer: await res.arrayBuffer(),
    mimeType: mediaMeta.mime_type,
    fileSize: mediaMeta.file_size,
  };
}

// ── Get media URL (temporary, expires) ──────────────────────
export async function getMediaUrl(mediaId: string): Promise<string> {
  if (/^https?:\/\//i.test(mediaId)) return mediaId;
  const meta = await getMediaMeta(mediaId);
  return meta.url;
}
