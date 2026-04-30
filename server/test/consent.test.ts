import { describe, it, expect, vi, beforeAll } from 'vitest';
import { processInboundMessage } from '../conversation/flow';
import { wa, dual } from '../storage/db';

// Mocking WhatsApp Client
vi.mock('../whatsapp/client', () => ({
  sendTextMessage: vi.fn(async () => 'mock_msg_id'),
  sendTemplate: vi.fn(async () => 'mock_msg_id'),
  sendListMessage: vi.fn(async () => 'mock_msg_id'),
  downloadMediaWithMeta: vi.fn(async () => ({
    buffer: Buffer.from('test'),
    mimeType: 'audio/ogg',
    fileSize: 100,
  })),
}));

// Mocking Database
vi.mock('../storage/db', () => {
  const sessions: Record<string, any> = {};
  return {
    wa: {
      getSession: vi.fn(async (id) => sessions[id]),
      getSessionByPhone: vi.fn(async (phone) =>
        Object.values(sessions).find((s) => s.candidate_phone === phone)
      ),
      updateSessionState: vi.fn(async (state, id) => {
        if (sessions[id]) sessions[id].state = state;
      }),
      createSession: vi.fn(async (id, phone, name, jobId, recruiterId) => {
        sessions[id] = {
          id,
          candidate_phone: phone,
          candidate_name: name,
          job_id: jobId,
          recruiter_id: recruiterId,
          state: 'invited',
        };
      }),
      logMessage: vi.fn(),
      hasMessageId: vi.fn(() => false),
      addResponse: vi.fn(),
      getActiveSessions: vi.fn(async () => []),
    },

    dual: {
      createJob: vi.fn(),
      getJobById: vi.fn(async () => ({ id: 'job1', title: 'Test Job' })),
    },
  };
});

// Mocking AI Services to avoid hitting Gemini
vi.mock('../ai/sentiment', () => ({
  analyzeResponseRealtime: vi.fn(async () => ({
    sentiment: 'neutral',
    clarity: 1,
    keyInsights: [],
  })),
}));
vi.mock('../admin/ai-control', () => ({
  getAIControl: vi.fn(async () => ({ textFallbackEnabled: true })),
}));
vi.mock('../admin/ai-squad', () => ({
  getAISquad: vi.fn(async () => ({
    id: 'default',
    experts: [],
    governance: {
      maxParallelSessions: 10,
      consentRequired: true,
    },
  })),
}));

vi.mock('../ai/transcribe', () => ({
  transcribeAudio: vi.fn(async () => 'mock transcription'),
}));

// Mocking the @google/genai module itself
vi.mock('@google/genai', () => {
  class MockGoogleGenAI {
    getGenerativeModel() {
      return {
        generateContent: vi.fn(async () => ({
          response: { text: () => JSON.stringify({ questions: [] }) },
        })),
      };
    }
  }
  return {
    GoogleGenAI: MockGoogleGenAI,
    Type: {},
  };
});

describe('E2E Consent Flow (Mocked DB & AI)', () => {
  const TEST_PHONE = '554999999123';
  const jobId = 'job1';
  const recruiterId = 'rec1';
  const sessionId = 'sess1';

  beforeAll(async () => {
    await wa.createSession(sessionId, TEST_PHONE, 'Candidato Teste', jobId, recruiterId, '[]');
  });

  it('should transition from invited to consent_pending on SIM', async () => {
    const res = await processInboundMessage(TEST_PHONE, 'text', 'SIM');
    const session = await wa.getSession(sessionId);
    expect(session.state).toBe('consent_pending');
    expect(res.nextState).toBe('consent_pending');
  });

  it('should remain in consent_pending if user says something else', async () => {
    const res = await processInboundMessage(TEST_PHONE, 'text', 'Como funciona?');
    const session = await wa.getSession(sessionId);
    expect(session.state).toBe('consent_pending');
    expect(res.nextState).toBe('consent_pending');
  });

  it('should transition to mic_check on CONCORDO', async () => {
    const res = await processInboundMessage(TEST_PHONE, 'text', 'CONCORDO');
    const session = await wa.getSession(sessionId);
    expect(session.state).toBe('mic_check');
    expect(res.nextState).toBe('mic_check');
  });
});
