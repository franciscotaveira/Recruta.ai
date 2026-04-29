import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.WHATSAPP_PROVIDER = 'automatik';
process.env.WHATSAPP_GATEWAY_API_KEY = 'test_key';
process.env.WHATSAPP_GATEWAY_ENDPOINT = 'https://fake.gateway.local/functions/v1/whatsapp-api';
process.env.SKIP_SERVER_START = '1';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

const { createSession, processInboundMessage } = await import('../conversation/flow.js');
const { wa, dual } = await import('../storage/db.js');

type SessionRecord = {
  id: string;
  candidate_phone: string;
  candidate_name: string;
  job_id: string;
  recruiter_id: string;
  questions: unknown[];
  responses: unknown[];
  state: string;
  current_question_idx: number;
  summary?: string;
  match_score?: number;
};

type MessageRecord = {
  sessionId: string;
  direction: string;
  type: string;
  content: string;
  status: string;
};

function normalizeDigits(value: string): string {
  return String(value || '').replace(/\D+/g, '');
}

function createHarness() {
  const sessions = new Map<string, SessionRecord>();
  const messages: MessageRecord[] = [];

  const originals = {
    waCreateSession: wa.createSession,
    waGetSession: wa.getSession,
    waGetSessionByPhone: wa.getSessionByPhone,
    waUpdateSessionState: wa.updateSessionState,
    waUpdateSessionQuestions: wa.updateSessionQuestions,
    waAddResponse: wa.addResponse,
    waSetSummary: wa.setSummary,
    waDeclineSession: wa.declineSession,
    waDeclineSessionWithSummary: wa.declineSessionWithSummary,
    waGetActiveSessions: wa.getActiveSessions,
    waLogMessage: wa.logMessage,
    waCreateAudioRecord: wa.createAudioRecord,
    waUpdateAudioTranscription: wa.updateAudioTranscription,
    dualGetJobById: dual.getJobById,
    fetch: globalThis.fetch,
  };

  const job = {
    id: 'job-1',
    title: 'Executivo de Contas',
    company: 'Recrutaria',
    description: 'Venda consultiva B2B com foco em retenção e expansão.',
    requirements: [],
  };

  wa.createSession = (async (
    id: string,
    candidatePhone: string,
    candidateName: string,
    jobId: string,
    recruiterId: string,
    questions: string
  ) => {
    const record: SessionRecord = {
      id,
      candidate_phone: candidatePhone,
      candidate_name: candidateName,
      job_id: jobId,
      recruiter_id: recruiterId,
      questions: JSON.parse(questions),
      responses: [],
      state: 'invited',
      current_question_idx: 0,
    };
    sessions.set(id, record);
    return record;
  }) as typeof wa.createSession;

  wa.getSession = (async (id: string) => sessions.get(id) || null) as typeof wa.getSession;

  wa.getSessionByPhone = (async (phone: string) => {
    const normalized = normalizeDigits(phone);
    const found = Array.from(sessions.values()).find((session) => {
      const candidate = normalizeDigits(session.candidate_phone);
      if (session.state === 'completed' || session.state === 'declined') return false;
      return candidate === normalized;
    });
    return found || null;
  }) as typeof wa.getSessionByPhone;

  wa.updateSessionState = (async (state: string, id: string) => {
    const session = sessions.get(id);
    if (session) session.state = state;
  }) as typeof wa.updateSessionState;

  wa.updateSessionQuestions = (async (questions: string, id: string) => {
    const session = sessions.get(id);
    if (session) session.questions = JSON.parse(questions);
  }) as typeof wa.updateSessionQuestions;

  wa.addResponse = (async (responseObj: any, id: string, options?: { advanceQuestion?: boolean }) => {
    const session = sessions.get(id);
    if (!session) return;
    session.responses.push(responseObj);
    if (options?.advanceQuestion !== false) {
      session.current_question_idx += 1;
    }
  }) as typeof wa.addResponse;

  wa.setSummary = (async (summary: string, matchScore: number, id: string) => {
    const session = sessions.get(id);
    if (!session) return;
    session.summary = summary;
    session.match_score = matchScore;
    session.state = 'completed';
  }) as typeof wa.setSummary;

  wa.declineSession = (async (id: string) => {
    const session = sessions.get(id);
    if (session) session.state = 'declined';
  }) as typeof wa.declineSession;

  wa.declineSessionWithSummary = (async (id: string, summary: string, matchScore: number) => {
    const session = sessions.get(id);
    if (!session) return;
    session.state = 'declined';
    session.summary = summary;
    session.match_score = matchScore;
  }) as typeof wa.declineSessionWithSummary;

  wa.getActiveSessions = (async () => {
    return Array.from(sessions.values()).filter((session) =>
      ['accepted', 'questioning', 'consent_pending', 'mic_check', 'handoff_requested'].includes(
        session.state
      )
    );
  }) as typeof wa.getActiveSessions;

  wa.logMessage = (async (
    _id: string,
    sessionId: string,
    direction: string,
    type: string,
    content: string,
    _waMessageId: string,
    status: string
  ) => {
    messages.push({ sessionId, direction, type, content, status });
  }) as typeof wa.logMessage;

  wa.createAudioRecord = (async () => undefined) as typeof wa.createAudioRecord;
  wa.updateAudioTranscription = (async () => undefined) as typeof wa.updateAudioTranscription;

  dual.getJobById = (async (id: string) => (id === job.id ? job : null)) as typeof dual.getJobById;

  globalThis.fetch = (async () => {
    return {
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => {
          if (name.toLowerCase() === 'content-type') return 'application/json';
          return null;
        },
      },
      json: async () => ({ id: 'msg_123', message_id: 'msg_123' }),
      text: async () => JSON.stringify({ id: 'msg_123', message_id: 'msg_123' }),
      arrayBuffer: async () => new ArrayBuffer(0),
    } as unknown as Response;
  }) as typeof fetch;

  const restore = () => {
    wa.createSession = originals.waCreateSession;
    wa.getSession = originals.waGetSession;
    wa.getSessionByPhone = originals.waGetSessionByPhone;
    wa.updateSessionState = originals.waUpdateSessionState;
    wa.updateSessionQuestions = originals.waUpdateSessionQuestions;
    wa.addResponse = originals.waAddResponse;
    wa.setSummary = originals.waSetSummary;
    wa.declineSession = originals.waDeclineSession;
    wa.declineSessionWithSummary = originals.waDeclineSessionWithSummary;
    wa.getActiveSessions = originals.waGetActiveSessions;
    wa.logMessage = originals.waLogMessage;
    wa.createAudioRecord = originals.waCreateAudioRecord;
    wa.updateAudioTranscription = originals.waUpdateAudioTranscription;
    dual.getJobById = originals.dualGetJobById;
    globalThis.fetch = originals.fetch;
  };

  return { sessions, messages, restore, job };
}

test('conversation flow happy path reaches completed with deterministic state transitions', async () => {
  const h = createHarness();
  try {
    const sessionId = await createSession(
      '+55 49 98844-7562',
      'Francisco',
      h.job.id,
      h.job.title,
      h.job.company,
      'recruiter-1'
    );

    assert.ok(sessionId);
    assert.equal(h.sessions.get(sessionId)?.state, 'invited');

    const r1 = await processInboundMessage('+55 49 98844-7562', 'text', 'SIM');
    assert.equal(r1.nextState, 'consent_pending');
    assert.equal(h.sessions.get(sessionId)?.state, 'consent_pending');

    const r2 = await processInboundMessage('+55 49 98844-7562', 'text', 'CONCORDO');
    assert.equal(r2.nextState, 'mic_check');
    assert.equal(h.sessions.get(sessionId)?.state, 'mic_check');

    const r3 = await processInboundMessage(
      '+55 49 98844-7562',
      'text',
      'nao consigo gravar, meu microfone quebrou'
    );
    assert.equal(r3.nextState, 'accepted');
    assert.equal(h.sessions.get(sessionId)?.state, 'accepted');

    const detailedAnswer =
      'Atuei por 5 anos em vendas consultivas B2B, com carteira de 120 contas, rotina de funil no CRM, diagnóstico por segmento e plano de ação por cliente. Em 12 meses, aumentei retenção em 18% e expansão em 22% com cadências semanais, negociação estruturada e revisão de indicadores por etapa.';
    let finalState = 'questioning';
    for (let i = 0; i < 8; i += 1) {
      const response = await processInboundMessage('+55 49 98844-7562', 'text', detailedAnswer);
      finalState = response.nextState;
      if (finalState === 'completed') break;
    }
    assert.equal(finalState, 'completed');

    const finalSession = h.sessions.get(sessionId);
    assert.equal(finalSession?.state, 'completed');
    assert.ok(finalSession?.summary);
    assert.ok(
      h.messages.some(
        (msg) =>
          msg.sessionId === sessionId &&
          msg.direction === 'outbound' &&
          msg.content.includes('Encerramos sua etapa de áudio')
      )
    );
  } finally {
    h.restore();
  }
});

test('conversation flow decline path captures reason and closes as declined', async () => {
  const h = createHarness();
  try {
    const sessionId = await createSession(
      '+55 49 98844-7562',
      'Francisco',
      h.job.id,
      h.job.title,
      h.job.company,
      'recruiter-1'
    );

    const r1 = await processInboundMessage('+55 49 98844-7562', 'text', 'não tenho interesse');
    assert.equal(r1.nextState, 'decline_reason_pending');
    assert.equal(h.sessions.get(sessionId)?.state, 'decline_reason_pending');

    const r2 = await processInboundMessage('+55 49 98844-7562', 'text', '5');
    assert.equal(r2.nextState, 'declined');
    assert.equal(h.sessions.get(sessionId)?.state, 'declined');
    assert.match(String(h.sessions.get(sessionId)?.summary || ''), /Já empregado/i);
  } finally {
    h.restore();
  }
});

test('conversation flow serializes concurrent duplicate inbound messages from the same phone', async () => {
  const h = createHarness();
  try {
    const sessionId = await createSession(
      '+55 49 98844-7562',
      'Francisco',
      h.job.id,
      h.job.title,
      h.job.company,
      'recruiter-1'
    );

    const [firstResult, secondResult] = await Promise.all([
      processInboundMessage('+55 49 98844-7562', 'text', 'SIM'),
      processInboundMessage('+55 49 98844-7562', 'text', 'SIM'),
    ]);

    assert.equal(firstResult.sessionId, sessionId);
    assert.equal(secondResult.sessionId, sessionId);
    assert.equal(h.sessions.get(sessionId)?.state, 'consent_pending');
    assert.ok(
      h.messages.some(
        (msg) =>
          msg.sessionId === sessionId &&
          msg.direction === 'outbound' &&
          msg.content.includes('consentimento')
      )
    );
    assert.ok(
      h.messages.filter(
        (msg) =>
          msg.sessionId === sessionId &&
          msg.direction === 'outbound' &&
          msg.content.includes('consentimento')
      ).length >= 1
    );
  } finally {
    h.restore();
  }
});
