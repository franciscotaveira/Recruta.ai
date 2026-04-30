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


export const CREDIT_PACKAGES = {
  pack10: {
    externalId: 'recruta_pack_10',
    name: 'Pack 10 Disparos',
    credits: 10,
    priceCents: 10000, // R$100
  },
  pack20: {
    externalId: 'recruta_pack_20',
    name: 'Pack 20 Disparos',
    credits: 20,
    priceCents: 18000, // R$180
  },
  pack50: {
    externalId: 'recruta_pack_50',
    name: 'Pack 50 Disparos',
    credits: 50,
    priceCents: 40000, // R$400
  },
  pack100: {
    externalId: 'recruta_pack_100',
    name: 'Pack 100 Disparos',
    credits: 100,
    priceCents: 70000, // R$700
  },
  pack200: {
    externalId: 'recruta_pack_200',
    name: 'Pack 200 Disparos',
    credits: 200,
    priceCents: 120000, // R$1.200
  },
  pack500: {
    externalId: 'recruta_pack_500',
    name: 'Pack 500 Disparos',
    credits: 500,
    priceCents: 250000, // R$2.500
  },
};

export const SUBSCRIPTION_PLANS = {
  monthly: {
    externalId: 'recruta_pro_monthly',
    name: 'Plano Pro Mensal',
    priceCents: 39700, // R$397
  },
  annual: {
    externalId: 'recruta_pro_annual',
    name: 'Plano Pro Anual',
    priceCents: 428760, // R$4.287,60
  }
};

export const DIAGNOSTIC_PRODUCT = {
  externalId: 'recruta_diagnostico',
  name: 'Plano Elite Advisor',
  description: 'Mentoria IA + Análise de Elite + Radar de Carreira',
  priceCents: 2990, // R$29,90
};
