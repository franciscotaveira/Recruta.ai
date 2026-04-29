/**
 * AbacatePay Payment Service
 * https://docs.abacatepay.com
 *
 * Endpoints:
 *   POST /v1/customer/create
 *   POST /v1/billing/create
 *   GET  /v1/billing/get
 *   GET  /v1/billing/list
 *   POST /v1/pixQrCode/create
 *   GET  /v1/pixQrCode/check
 */

const ABACATE_BASE = 'https://api.abacatepay.com';
const ABACATE_TOKEN = process.env.ABACATE_PAY_TOKEN || '';

async function abacateFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${ABACATE_TOKEN}`,
    'Content-Type': 'application/json',
    accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const res = await fetch(`${ABACATE_BASE}${path}`, {
    ...options,
    headers,
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || json.error || `HTTP ${res.status}`);
  }
  return json.data;
}

// ── Customers ─────────────────────────────────────────────────
export async function createCustomer(params: {
  name: string;
  cellphone: string;
  email: string;
  taxId: string;
}): Promise<{ id: string; metadata: Record<string, string> }> {
  return abacateFetch('/v1/customer/create', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ── Billing (Checkout) ────────────────────────────────────────
export async function createBilling(params: {
  frequency?: 'ONE_TIME' | 'MULTIPLE_PAYMENTS';
  methods?: ('PIX' | 'CARD')[];
  products: Array<{
    externalId: string;
    name: string;
    description?: string;
    quantity: number;
    price: number; // cents
  }>;
  returnUrl: string;
  completionUrl: string;
  customerId?: string;
  customer?: {
    name: string;
    cellphone: string;
    email: string;
    taxId: string;
  };
}): Promise<{
  id: string;
  url: string;
  amount: number;
  status: string;
  customer: { id: string; metadata: Record<string, string> };
  createdAt: string;
}> {
  return abacateFetch('/v1/billing/create', {
    method: 'POST',
    body: JSON.stringify({
      frequency: 'ONE_TIME',
      methods: ['PIX', 'CARD'],
      ...params,
    }),
  });
}

export async function getBilling(id: string) {
  return abacateFetch(`/v1/billing/get?id=${id}`);
}

export async function listBilling() {
  return abacateFetch('/v1/billing/list');
}

// ── PIX QRCode ────────────────────────────────────────────────
export async function createPixQrCode(params: {
  amount: number; // cents
  expiresIn?: number;
  description?: string;
  customer?: {
    name: string;
    cellphone: string;
    email: string;
    taxId: string;
  };
  metadata?: Record<string, string>;
}): Promise<{
  id: string;
  amount: number;
  status: string;
  brCode: string; // PIX copy-paste
  brCodeBase64: string; // QR code image
  platformFee: number;
  expiresAt: string;
}> {
  return abacateFetch('/v1/pixQrCode/create', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function checkPixQrCode(id: string) {
  return abacateFetch(`/v1/pixQrCode/check?id=${id}`);
}

// ── Withdrawals ───────────────────────────────────────────────
export async function createWithdraw(params: {
  amount: number; // cents
  pixKey: string;
  notes?: string;
}) {
  return abacateFetch('/v1/withdraw/create', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function listWithdraws() {
  return abacateFetch('/v1/withdraw/list');
}

// ── Credit Packages (mapped to AbacatePay products) ───────────
export const CREDIT_PACKAGES = {
  starter: {
    externalId: 'recruta_starter',
    name: 'Pack Decisão Rápida',
    credits: 50,
    priceCents: 19900,
  }, // R$199
  growth: {
    externalId: 'recruta_growth',
    name: 'Pack Processo Full',
    credits: 200,
    priceCents: 69900,
  }, // R$699
  scale: {
    externalId: 'recruta_scale',
    name: 'Pack Enterprise',
    credits: 1000,
    priceCents: 299000,
  }, // R$2.990
};

export const DIAGNOSTIC_PRODUCT = {
  externalId: 'recruta_diagnostico',
  name: 'Diagnóstico Profissional + Otimização de CV',
  description: 'Análise completa do seu currículo com IA + sugestões de otimização',
  priceCents: 4900, // R$49
};
