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

export async function createAsaasCustomer(data: {
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
}) {
  try {
    const res = await asaas.post('/customers', data);
    return res.data;
  } catch (err: any) {
    console.error('Error creating Asaas customer:', err.response?.data || err.message);
    throw err;
  }
}

export async function createAsaasPayment(data: {
  customer: string;
  billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'UNDEFINED';
  value: number;
  dueDate: string;
  description: string;
  externalReference?: string;
}) {
  try {
    const res = await asaas.post('/payments', data);
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
