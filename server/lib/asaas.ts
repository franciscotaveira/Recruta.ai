import axios from 'axios';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';
const ASAAS_URL = process.env.ASAAS_URL || 'https://www.asaas.com/api/v3';

const asaas = axios.create({
  baseURL: ASAAS_URL,
  headers: {
    'access_token': ASAAS_API_KEY,
    'Content-Type': 'application/json'
  }
});

export async function getOrCreateAsaasCustomer(name: string, email: string, cpfCnpj: string, phone?: string) {
  try {
    // Try to find existing customer by email
    const searchRes = await asaas.get(`/customers?email=${encodeURIComponent(email)}`);
    if (searchRes.data?.data?.length > 0) {
      console.log(`[asaas] Found existing customer: ${email}`);
      return searchRes.data.data[0];
    }

    // Create new if not found
    console.log(`[asaas] Creating new customer: ${email}`);
    const res = await asaas.post('/customers', { name, email, cpfCnpj, phone });
    return res.data;
  } catch (err: any) {
    console.error('Error in getOrCreateAsaasCustomer:', err.response?.data || err.message);
    throw err;
  }
}

export async function createAsaasPayment(data: {
  customer: string;
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'UNDEFINED';
  value: number;
  dueDate?: string;
  description: string;
  externalReference?: string;
}) {
  try {
    // If dueDate is not provided, set to tomorrow
    const dueDate = data.dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    const res = await asaas.post('/payments', {
      ...data,
      dueDate
    });
    return res.data;
  } catch (err: any) {
    console.error('Error creating Asaas payment:', err.response?.data || err.message);
    throw err;
  }
}

export async function getAsaasPaymentStatus(id: string) {
  try {
    const res = await asaas.get(`/payments/${id}`);
    return res.data;
  } catch (err: any) {
    console.error('Error getting Asaas payment status:', err.response?.data || err.message);
    throw err;
  }
}
