import { supabase } from './supabase';

// ── Users ────────────────────────────────────────────────────────
export const users = {
  findByEmail: async (email: string) => {
    const { data } = await supabase.from('users').select('*').eq('email', email).single();
    return data;
  },
  findById: async (id: string) => {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    return data;
  },
  create: async (
    id: string,
    email: string,
    password_hash: string,
    role: string,
    name: string | null
  ) => {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id,
          email,
          password_hash,
          role,
          name,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  verify: async (id: string) => {
    await supabase.from('users').update({ verified: true }).eq('id', id);
  },
  updateLastLogin: async (id: string) => {
    await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', id);
  },
  updatePassword: async (password_hash: string, id: string) => {
    await supabase.from('users').update({ password_hash }).eq('id', id);
  },
};

// ── WhatsApp Sessions ────────────────────────────────────────────
export const wa = {
  createSession: async (
    id: string,
    candidate_phone: string,
    candidate_name: string,
    job_id: string,
    recruiter_id: string,
    questions: string
  ) => {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .insert([
        {
          id,
          candidate_phone,
          candidate_name,
          job_id,
          recruiter_id,
          questions: JSON.parse(questions),
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  getSession: async (id: string) => {
    const { data } = await supabase.from('whatsapp_sessions').select('*').eq('id', id).single();
    return data;
  },
  getSessionByPhone: async (candidate_phone: string) => {
    const normalizedDigits = String(candidate_phone || '').replace(/\D+/g, '');
    const rawPlus = normalizedDigits ? `+${normalizedDigits}` : '';
    const withoutCountry55 =
      normalizedDigits.startsWith('55') && normalizedDigits.length > 11
        ? normalizedDigits.slice(2)
        : normalizedDigits;
    const candidates = Array.from(
      new Set([candidate_phone, normalizedDigits, rawPlus, withoutCountry55].filter(Boolean))
    );

    const { data } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .in('candidate_phone', candidates as string[])
      .not('state', 'in', '("completed","declined")')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return data;
  },
  updateSessionState: async (state: string, id: string) => {
    await supabase
      .from('whatsapp_sessions')
      .update({ state, updated_at: new Date().toISOString() })
      .eq('id', id);
  },
  updateSessionQuestions: async (questions: string, id: string) => {
    await supabase
      .from('whatsapp_sessions')
      .update({ questions: JSON.parse(questions), updated_at: new Date().toISOString() })
      .eq('id', id);
  },
  addResponse: async (responseObj: any, id: string, options?: { advanceQuestion?: boolean }) => {
    const { data: session } = await supabase
      .from('whatsapp_sessions')
      .select('responses, current_question_idx')
      .eq('id', id)
      .single();
    if (!session) return;
    const responses = session.responses || [];
    responses.push(responseObj);
    const advanceQuestion = options?.advanceQuestion !== false;
    const nextQuestionIdx = advanceQuestion
      ? Number(session.current_question_idx || 0) + 1
      : Number(session.current_question_idx || 0);
    await supabase
      .from('whatsapp_sessions')
      .update({
        responses,
        current_question_idx: nextQuestionIdx,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  },
  setSummary: async (summary: string, match_score: number, id: string) => {
    await supabase
      .from('whatsapp_sessions')
      .update({
        summary,
        match_score,
        state: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  },
  declineSession: async (id: string) => {
    await supabase
      .from('whatsapp_sessions')
      .update({
        state: 'declined',
        declined_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  },
  declineSessionWithSummary: async (id: string, summary: string, matchScore: number = 0) => {
    const { error } = await supabase
      .from('whatsapp_sessions')
      .update({
        state: 'declined',
        summary,
        match_score: matchScore,
        declined_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw error;
  },
  getSessionsByJob: async (job_id: string) => {
    const { data } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('job_id', job_id)
      .order('created_at', { ascending: false });
    return data || [];
  },
  getSessionsByRecruiter: async (recruiter_id: string) => {
    const { data } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('recruiter_id', recruiter_id)
      .order('created_at', { ascending: false });
    return data || [];
  },
  getActiveSessions: async () => {
    const { data } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .in('state', [
        'accepted',
        'questioning',
        'consent_pending',
        'mic_check',
        'handoff_requested',
      ]);
    return data || [];
  },
  logMessage: async (
    id: string,
    session_id: string,
    direction: string,
    type: string,
    content: string,
    wa_message_id: string,
    status: string
  ) => {
    await supabase.from('wa_messages').insert([
      {
        id,
        session_id,
        direction,
        type,
        content,
        wa_message_id,
        status,
      },
    ]);
  },
  hasMessageId: async (wa_message_id: string): Promise<boolean> => {
    if (!wa_message_id) return false;
    const { data } = await supabase
      .from('wa_messages')
      .select('id')
      .eq('wa_message_id', wa_message_id)
      .limit(1)
      .maybeSingle();
    return Boolean(data?.id);
  },
  getMessagesBySession: async (session_id: string) => {
    const { data } = await supabase
      .from('wa_messages')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true });
    return data || [];
  },
  createAudioRecord: async (
    id: string,
    session_id: string,
    wa_media_id: string,
    local_path: string
  ) => {
    await supabase.from('audio_files').insert([
      {
        id,
        session_id,
        wa_media_id,
        local_path,
      },
    ]);
  },
  getAudioBySession: async (session_id: string) => {
    const { data } = await supabase.from('audio_files').select('*').eq('session_id', session_id);
    return data || [];
  },
  getAudioById: async (id: string) => {
    const { data } = await supabase.from('audio_files').select('*').eq('id', id).single();
    return data;
  },
  updateAudioTranscription: async (transcription: string, id: string) => {
    await supabase.from('audio_files').update({ transcription }).eq('id', id);
  },
};

// ── Dual Model ───────────────────────────────────────────────────
export const dual = {
  // Public Jobs
  createJob: async (
    id: string,
    recruiter_id: string,
    title: string,
    company: string,
    location: string,
    description: string,
    requirements: string,
    salary_range: string,
    job_type: string,
    modality: string
  ) => {
    await supabase.from('public_jobs').insert([
      {
        id,
        recruiter_id,
        title,
        company,
        location,
        description,
        requirements: JSON.parse(requirements || '[]'),
        salary_range,
        job_type,
        modality,
      },
    ]);
  },
  getActiveJobs: async () => {
    const { data } = await supabase
      .from('public_jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    return data || [];
  },
  getJobsByRecruiter: async (recruiter_id: string) => {
    const { data } = await supabase
      .from('public_jobs')
      .select('*')
      .eq('recruiter_id', recruiter_id)
      .order('created_at', { ascending: false });
    return data || [];
  },
  getJobById: async (id: string) => {
    const { data } = await supabase.from('public_jobs').select('*').eq('id', id).single();
    return data;
  },
  updateJob: async (title: string, description: string, requirements: string, id: string) => {
    await supabase
      .from('public_jobs')
      .update({
        title,
        description,
        requirements: JSON.parse(requirements || '[]'),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  },
  closeJob: async (id: string) => {
    await supabase
      .from('public_jobs')
      .update({
        is_active: false,
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  },
  incrementApplications: async (id: string) => {
    const { data: job } = await supabase
      .from('public_jobs')
      .select('application_count')
      .eq('id', id)
      .single();
    if (job) {
      await supabase
        .from('public_jobs')
        .update({ application_count: job.application_count + 1 })
        .eq('id', id);
    }
  },
  getJobsByLocation: async (locationQuery: string) => {
    const { data } = await supabase
      .from('public_jobs')
      .select('*')
      .eq('is_active', true)
      .ilike('location', locationQuery)
      .order('created_at', { ascending: false });
    return data || [];
  },

  // Candidate Profiles
  createProfile: async (
    id: string,
    user_id: string | null,
    name: string | null,
    email: string | null,
    phone: string | null,
    location: string | null,
    target_role: string | null,
    seniority: string | null
  ) => {
    await supabase.from('candidate_profiles').insert([
      {
        id,
        user_id,
        name,
        email,
        phone,
        location,
        target_role,
        seniority,
      },
    ]);
  },
  getProfileByUser: async (user_id: string) => {
    const { data } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();
    return data;
  },
  getProfileById: async (id: string) => {
    const { data } = await supabase.from('candidate_profiles').select('*').eq('id', id).single();
    return data;
  },
  getProfileByPhone: async (phone: string) => {
    const normalizedPhone = String(phone || '').replace(/\D+/g, '');
    const candidates = Array.from(
      new Set(
        [phone, normalizedPhone, normalizedPhone ? `+${normalizedPhone}` : ''].filter(Boolean)
      )
    );
    const { data } = await supabase
      .from('candidate_profiles')
      .select('*')
      .in('phone', candidates as string[])
      .limit(1)
      .maybeSingle();
    return data;
  },
  updateProfile: async (
    name: string | null,
    email: string | null,
    phone: string | null,
    location: string | null,
    target_role: string | null,
    seniority: string | null,
    user_id: string
  ) => {
    await supabase
      .from('candidate_profiles')
      .update({
        name,
        email,
        phone,
        location,
        target_role,
        seniority,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user_id);
  },
  setCV: async (
    cv_master: string,
    scp_score: number,
    scp_breakdown: string,
    diagnosis: string,
    suggestions: string,
    attention_points: string,
    user_id: string
  ) => {
    await supabase
      .from('candidate_profiles')
      .update({
        cv_master,
        scp_score,
        scp_breakdown: JSON.parse(scp_breakdown || 'null'),
        diagnosis,
        ai_suggestions: JSON.parse(suggestions || '[]'),
        attention_points: JSON.parse(attention_points || '[]'),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user_id);
  },
  searchProfiles: async (targetRoleQuery: string) => {
    const { data } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('is_active', true)
      .ilike('target_role', targetRoleQuery)
      .order('scp_score', { ascending: false });
    return data || [];
  },

  // CV Versions
  createCVVersion: async (
    id: string,
    profile_id: string,
    version_num: number,
    target_job_id: string | null,
    target_role: string | null,
    cv_text: string,
    changes_applied: string,
    match_score: number,
    ai_suggestions: string
  ) => {
    await supabase.from('cv_versions').insert([
      {
        id,
        profile_id,
        version_num,
        target_job_id,
        target_role,
        cv_text,
        changes_applied: JSON.parse(changes_applied || '[]'),
        match_score,
        ai_suggestions: JSON.parse(ai_suggestions || '[]'),
      },
    ]);
  },
  getVersionsByProfile: async (profile_id: string) => {
    const { data } = await supabase
      .from('cv_versions')
      .select('*')
      .eq('profile_id', profile_id)
      .order('version_num', { ascending: false });
    return data || [];
  },
  getVersionById: async (id: string) => {
    const { data } = await supabase.from('cv_versions').select('*').eq('id', id).single();
    return data;
  },
  getNextVersionNum: async (profile_id: string) => {
    const { data } = await supabase
      .from('cv_versions')
      .select('version_num')
      .eq('profile_id', profile_id)
      .order('version_num', { ascending: false })
      .limit(1)
      .single();
    return data ? data.version_num + 1 : 1;
  },

  // Job Applications
  createApplication: async (
    id: string,
    profile_id: string,
    job_id: string,
    cv_version_id: string | null,
    match_score: number
  ) => {
    await supabase.from('job_applications').insert([
      {
        id,
        profile_id,
        job_id,
        cv_version_id,
        match_score,
      },
    ]);
  },
  applyToJob: async (
    profile_id: string,
    job_id: string,
    cv_version_id: string | null,
    match_score: number,
    id: string
  ) => {
    await supabase.from('job_applications').insert([
      {
        id,
        profile_id,
        job_id,
        cv_version_id,
        match_score,
      },
    ]);
    await dual.incrementApplications(job_id);
  },
  getApplicationsByJob: async (job_id: string) => {
    const { data } = await supabase
      .from('job_applications')
      .select('*, candidate_profiles(name, phone)')
      .eq('job_id', job_id)
      .order('match_score', { ascending: false });
    return data || [];
  },
  getApplicationsByProfile: async (profile_id: string) => {
    const { data } = await supabase
      .from('job_applications')
      .select('*')
      .eq('profile_id', profile_id)
      .order('applied_at', { ascending: false });
    return data || [];
  },
  getApplicationDetail: async (id: string) => {
    const { data } = await supabase.from('job_applications').select('*').eq('id', id).single();
    return data;
  },
  updateApplicationStatus: async (status: string, recruiter_notes: string, id: string) => {
    await supabase
      .from('job_applications')
      .update({
        status,
        recruiter_notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  },
  hasApplied: async (profile_id: string, job_id: string) => {
    const { count } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profile_id)
      .eq('job_id', job_id);
    return { cnt: count || 0 };
  },

  // CV Insights
  upsertInsight: async (id: string, job_id: string, requirement_text: string, category: string) => {
    const { data: existing } = await supabase
      .from('cv_insights')
      .select('id, frequency')
      .eq('job_id', job_id)
      .eq('requirement_text', requirement_text)
      .single();
    if (existing) {
      await supabase
        .from('cv_insights')
        .update({ frequency: existing.frequency + 1 })
        .eq('id', existing.id);
    } else {
      await supabase.from('cv_insights').insert([
        {
          id,
          job_id,
          requirement_text,
          category,
          frequency: 1,
        },
      ]);
    }
  },
  getTopInsights: async (category: string) => {
    // Note: Supabase JS exact grouping needs RPC or raw SQL, but we'll fetch and group locally for simplicity due to limit 20
    const { data } = await supabase.from('cv_insights').select('*').eq('category', category);
    if (!data) return [];

    const aggregated: Record<
      string,
      { requirement_text: string; category: string; total_freq: number }
    > = {};
    for (const item of data) {
      if (!aggregated[item.requirement_text]) {
        aggregated[item.requirement_text] = {
          requirement_text: item.requirement_text,
          category: item.category,
          total_freq: 0,
        };
      }
      aggregated[item.requirement_text].total_freq += item.frequency;
    }
    return Object.values(aggregated)
      .sort((a, b) => b.total_freq - a.total_freq)
      .slice(0, 20);
  },
  getInsightsByJob: async (job_id: string) => {
    const { data } = await supabase
      .from('cv_insights')
      .select('*')
      .eq('job_id', job_id)
      .order('frequency', { ascending: false });
    return data || [];
  },

  // Payments
  createPayment: async (
    id: string,
    abacate_billing_id: string,
    user_id: string,
    user_type: string,
    product_type: string,
    credits_amount: number,
    amount_cents: number,
    return_url: string,
    checkout_url: string,
    metadata: string
  ) => {
    await supabase.from('payments').insert([
      {
        id,
        abacate_billing_id,
        user_id,
        user_type,
        product_type,
        credits_amount,
        amount_cents,
        return_url,
        checkout_url,
        metadata: JSON.parse(metadata || '{}'),
      },
    ]);
  },
  getPaymentById: async (id: string) => {
    const { data } = await supabase.from('payments').select('*').eq('id', id).single();
    return data;
  },
  getPaymentByAbacateId: async (abacate_billing_id: string) => {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('abacate_billing_id', abacate_billing_id)
      .single();
    return data;
  },
  markPaymentPaid: async (payment_method: string, abacate_billing_id: string) => {
    await supabase
      .from('payments')
      .update({
        status: 'paid',
        payment_method,
        paid_at: new Date().toISOString(),
      })
      .eq('abacate_billing_id', abacate_billing_id);
  },
  getPaymentsByUser: async (user_id: string, user_type: string) => {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user_id)
      .eq('user_type', user_type)
      .order('created_at', { ascending: false });
    return data || [];
  },
  hasPaidDiagnostic: async (user_id: string): Promise<boolean> => {
    const { data } = await supabase
      .from('payments')
      .select('id')
      .eq('user_id', user_id)
      .eq('product_type', 'diagnostic')
      .eq('status', 'paid')
      .limit(1)
      .maybeSingle();
    return !!data;
  },

  // Recruiter Wallet
  getWallet: async (recruiter_id: string) => {
    const { data } = await supabase
      .from('recruiter_wallet')
      .select('*')
      .eq('recruiter_id', recruiter_id)
      .single();
    return data;
  },
  initWallet: async (recruiter_id: string) => {
    const { data } = await supabase
      .from('recruiter_wallet')
      .select('recruiter_id')
      .eq('recruiter_id', recruiter_id)
      .single();
    if (!data) {
      await supabase
        .from('recruiter_wallet')
        .insert([{ recruiter_id, balance: 0, total_purchased: 0, total_spent: 0 }]);
    }
  },
  addCredits: async (amount: number, purchased: number, recruiter_id: string) => {
    const { data: wallet } = await supabase
      .from('recruiter_wallet')
      .select('balance, total_purchased')
      .eq('recruiter_id', recruiter_id)
      .single();
    if (wallet) {
      await supabase
        .from('recruiter_wallet')
        .update({
          balance: wallet.balance + amount,
          total_purchased: wallet.total_purchased + purchased,
          updated_at: new Date().toISOString(),
        })
        .eq('recruiter_id', recruiter_id);
    }
  },
  spendCredits: async (amount: number, recruiter_id: string) => {
    const { data: wallet } = await supabase
      .from('recruiter_wallet')
      .select('balance, total_spent')
      .eq('recruiter_id', recruiter_id)
      .single();
    if (wallet) {
      await supabase
        .from('recruiter_wallet')
        .update({
          balance: wallet.balance - amount,
          total_spent: wallet.total_spent + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('recruiter_id', recruiter_id);
    }
  },
  spendTriggerCredits: async (amount: number, recruiter_id: string) => {
    const { data: wallet } = await supabase
      .from('recruiter_wallet')
      .select('trigger_balance')
      .eq('recruiter_id', recruiter_id)
      .single();
    if (wallet && wallet.trigger_balance >= amount) {
      await supabase
        .from('recruiter_wallet')
        .update({
          trigger_balance: wallet.trigger_balance - amount,
          updated_at: new Date().toISOString(),
        })
        .eq('recruiter_id', recruiter_id);
      return true;
    }
    return false;
  },
  addTriggerCredits: async (amount: number, recruiter_id: string) => {
    const { data: wallet } = await supabase
      .from('recruiter_wallet')
      .select('trigger_balance')
      .eq('recruiter_id', recruiter_id)
      .single();
    if (wallet) {
      await supabase
        .from('recruiter_wallet')
        .update({
          trigger_balance: (wallet.trigger_balance || 0) + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('recruiter_id', recruiter_id);
    }
  },

  // Candidate Wallet (B2C)
  getCandidateWallet: async (candidate_id: string) => {
    const { data } = await supabase
      .from('candidate_wallet')
      .select('*')
      .eq('candidate_id', candidate_id)
      .single();
    return data;
  },
  initCandidateWallet: async (candidate_id: string) => {
    const { data: existing } = await supabase
      .from('candidate_wallet')
      .select('candidate_id')
      .eq('candidate_id', candidate_id)
      .maybeSingle();
    if (!existing) {
      await supabase.from('candidate_wallet').insert([{ candidate_id, balance: 3 }]);
    }
  },
  deductCandidateCredit: async (candidate_id: string, amount: number = 1): Promise<boolean> => {
    const { data: wallet } = await supabase
      .from('candidate_wallet')
      .select('balance, total_spent')
      .eq('candidate_id', candidate_id)
      .single();
    
    if (wallet && wallet.balance >= amount) {
      await supabase
        .from('candidate_wallet')
        .update({
          balance: wallet.balance - amount,
          total_spent: wallet.total_spent + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('candidate_id', candidate_id);
      return true;
    }
    return false;
  },

  // Recruiter Profiles
  getRecruiterProfile: async (recruiter_id: string) => {
    const { data } = await supabase
      .from('recruiter_profiles')
      .select('*')
      .eq('user_id', recruiter_id)
      .single();
    return data;
  },
  initRecruiterProfile: async (recruiter_id: string, company_name: string) => {
    const { data: existing } = await supabase
      .from('recruiter_profiles')
      .select('user_id')
      .eq('user_id', recruiter_id)
      .maybeSingle();
    if (!existing) {
      await supabase.from('recruiter_profiles').insert([{ user_id: recruiter_id, company_name }]);
    }
  },
  updateSubscription: async (
    recruiter_id: string,
    plan: string,
    status: string,
    expires_at: string
  ) => {
    await supabase
      .from('recruiter_profiles')
      .update({
        subscription_plan: plan,
        subscription_status: status,
        subscription_expires_at: expires_at,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', recruiter_id);
  },

  // Credit transactions
  addTransaction: async (
    id: string,
    recruiter_id: string,
    payment_id: string | null,
    type: string,
    amount: number,
    balance_after: number,
    description: string
  ) => {
    await supabase.from('credit_transactions').insert([
      {
        id,
        recruiter_id,
        payment_id,
        type,
        amount,
        balance_after,
        description,
      },
    ]);
  },
  getTransactions: async (recruiter_id: string) => {
    const { data } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('recruiter_id', recruiter_id)
      .order('created_at', { ascending: false })
      .limit(50);
    return data || [];
  },

  // Recruiter candidate bank
  listCandidateBank: async (limit: number = 200) => {
    const { data } = await supabase
      .from('candidate_profiles')
      .select('*')
      .not('cv_master', 'is', null)
      .gt('scp_score', 0)
      .order('scp_score', { ascending: false })
      .limit(limit);
    return data || [];
  },

  listBulkProfilesByJob: async (job_id: string) => {
    const { data } = await supabase
      .from('candidate_profiles')
      .select('*')
      .like('id', `bulk_${job_id}_%`)
      .not('cv_master', 'is', null)
      .gt('scp_score', 0)
      .order('scp_score', { ascending: false });
    return data || [];
  },

  logEvent: async (
    user_id: string | null,
    event: string,
    level: string,
    details: any,
    correlation_id: string | null
  ) => {
    await supabase.from('system_logs').insert([
      {
        user_id,
        event,
        level,
        details,
        correlation_id,
      },
    ]);
  },
};

export default { users, wa, dual };
