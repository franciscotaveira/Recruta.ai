import { ActionId } from '../contracts/ActionSchemas';
import { ActionManager } from './ActionManager';
import { supabase } from './supabase';
import { postJob, bulkAnalyzeCVs, sendWhatsAppInvite } from '../services/api';
import { updateSessionStatus } from '../services/whatsappApi';

export type JobStatus =
  | 'pending_approval'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface Job<T = any> {
  id: string;
  actionId: ActionId;
  payload: T;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  result?: any;
  error?: string;
  userId?: string;
}

export class JobQueue {
  private static listeners: Array<(job: Job) => void> = [];
  private static isSubscribed = false;

  static subscribe(listener: (job: Job) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify(job: Job) {
    this.listeners.forEach((l) => l(job));
  }

  static initRealtime() {
    if (this.isSubscribed) return;

    supabase
      .channel('system_jobs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_jobs' }, (payload) => {
        const row = (payload.new as any) || (payload.old as any);
        if (!row) return;

        const job: Job = {
          id: row.id,
          actionId: row.action_id as ActionId,
          payload: row.payload,
          status: row.status as JobStatus,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
          result: row.result,
          error: row.error,
          userId: row.user_id,
        };

        this.notify(job);

        // Worker logic: if status changed to queued, start processing
        if (payload.eventType === 'UPDATE' && row.status === 'queued') {
          this.executeJob(job.id);
        }
      })
      .subscribe();

    this.isSubscribed = true;
  }

  static async listJobs(): Promise<Job[]> {
    const { data, error } = await supabase
      .from('system_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch jobs:', error);
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      actionId: row.action_id as ActionId,
      payload: row.payload,
      status: row.status as JobStatus,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      result: row.result,
      error: row.error,
      userId: row.user_id,
    }));
  }

  static async createJob<T extends ActionId>(
    actionId: T,
    payload: any,
    userId?: string
  ): Promise<Job | null> {
    const validation = ActionManager.validateIntent(actionId, payload);

    if (!validation.valid) {
      console.error(`Job validation failed for ${actionId}:`, validation.errors);
      return null;
    }

    const needsApproval = validation.metadata.approval_required;
    const initialStatus: JobStatus = needsApproval ? 'pending_approval' : 'queued';

    const { data, error } = await supabase
      .from('system_jobs')
      .insert({
        user_id: userId || null,
        action_id: actionId,
        payload: validation.payload,
        status: initialStatus,
        risk_level: validation.metadata.risk_level,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Failed to create job in DB:', error);
      return null;
    }

    const job: Job = {
      id: data.id,
      actionId,
      payload: data.payload,
      status: data.status as JobStatus,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      userId: data.user_id,
    };

    this.notify(job);

    if (initialStatus === 'queued') {
      this.executeJob(job.id);
    }

    return job;
  }

  static async approveJob(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('system_jobs')
      .update({ status: 'queued', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending_approval');

    return !error;
  }

  static async rejectJob(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('system_jobs')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending_approval');

    return !error;
  }

  static async logEvent(
    event: string,
    level: 'info' | 'warn' | 'error' = 'info',
    details: any = {},
    userId?: string,
    correlationId?: string
  ) {
    try {
      await supabase.from('system_logs').insert({
        event,
        level,
        details,
        user_id: userId,
        correlation_id: correlationId,
      });
    } catch (err) {
      console.error('Failed to log system event:', err);
    }
  }

  private static async updateJobStatus(
    id: string,
    status: JobStatus,
    result?: any,
    error?: string
  ) {
    const { data: job } = await supabase
      .from('system_jobs')
      .update({
        status,
        result,
        error,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (job) {
      this.notify(job);
      // Log the transition
      await this.logEvent(
        `job.${status}`,
        status === 'failed' ? 'error' : 'info',
        { jobId: id, actionId: job.action_id },
        job.user_id,
        id
      );
    }
  }

  private static calculateCost(metadata: any, payload: any): number {
    const baseCost = metadata.estimated_cost || 0;
    if (metadata.id === 'recruiter.bulk_analyze' && payload.candidates) {
      return baseCost * payload.candidates.length;
    }
    return baseCost;
  }

  private static async checkAndDeductCredits(
    userId: string,
    actionId: ActionId,
    payload: any,
    jobId: string
  ): Promise<boolean> {
    const metadata = ActionManager.getMetadata(actionId);
    if (!metadata || !metadata.estimated_cost) return true;

    const cost = this.calculateCost(metadata, payload);
    if (cost <= 0) return true;

    // Get current balance
    const { data: wallet } = await supabase
      .from('recruiter_wallet')
      .select('balance')
      .eq('recruiter_id', userId)
      .single();

    if (!wallet || wallet.balance < cost) {
      return false;
    }

    // Deduct credits
    const newBalance = wallet.balance - cost;
    const { error: updateError } = await supabase
      .from('recruiter_wallet')
      .update({
        balance: newBalance,
        total_spent:
          (
            await supabase
              .from('recruiter_wallet')
              .select('total_spent')
              .eq('recruiter_id', userId)
              .single()
          ).data?.total_spent + cost,
        updated_at: new Date().toISOString(),
      })
      .eq('recruiter_id', userId);

    if (updateError) return false;

    // Record transaction
    await supabase.from('credit_transactions').insert({
      recruiter_id: userId,
      type: 'spend',
      amount: cost,
      balance_after: newBalance,
      description: `Job: ${actionId} (${jobId})`,
    });

    await this.logEvent('credits.deducted', 'info', { cost, actionId, jobId }, userId, jobId);
    return true;
  }

  private static async getSpecialistConfig(area: string) {
    const { data } = await supabase
      .from('ai_specialists')
      .select('*')
      .eq('area', area)
      .eq('enabled', true)
      .limit(1)
      .maybeSingle();

    return data;
  }

  private static async executeJob(id: string) {
    const { data: job } = await supabase.from('system_jobs').select('*').eq('id', id).single();
    if (!job || job.status !== 'queued') return;

    // Credit Check & Guard
    if (job.user_id) {
      const hasCredits = await this.checkAndDeductCredits(
        job.user_id,
        job.action_id as ActionId,
        job.payload,
        id
      );
      if (!hasCredits) {
        await this.updateJobStatus(id, 'failed', null, 'Saldo de créditos insuficiente');
        return;
      }
    }

    await this.updateJobStatus(id, 'processing');

    try {
      // REAL INTEGRATION for analyze_cv
      if (job.action_id === 'candidate.analyze_cv') {
        const specialist = await this.getSpecialistConfig('triage');
        const model = specialist?.model_policy || 'auto';

        await this.logEvent(
          'ai.routing',
          'info',
          { specialistId: specialist?.id, model },
          job.user_id,
          id
        );

        const response = await fetch(
          'https://csuxlpodmqmycxfkmuxv.functions.supabase.co/analyze-cv',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ ...job.payload, model_policy: model }),
          }
        );

        if (!response.ok) throw new Error(`AI Function error: ${response.statusText}`);

        const result = await response.json();
        await this.updateJobStatus(id, 'completed', result);
        return;
      }

      // Recruiter: Post Job
      if (job.action_id === 'recruiter.post_job') {
        const result = await postJob(job.payload);
        await this.updateJobStatus(id, 'completed', result);
        return;
      }

      // Recruiter: Invite Candidate
      if (job.action_id === 'recruiter.invite_candidate') {
        const { phone, name, jobId, jobTitle, companyName, scenario } = job.payload;

        // Get auth token from supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await fetch('/api/whatsapp/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            candidatePhone: phone,
            candidateName: name,
            jobId,
            jobTitle: jobTitle || '',
            companyName: companyName || '',
            scenario: scenario || 'direct',
          }),
        });

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`WhatsApp invite failed: ${response.status} — ${errBody}`);
        }

        const result = await response.json();
        await this.updateJobStatus(id, 'completed', result);
        return;
      }

      // Recruiter: Update Review Status
      if (job.action_id === 'recruiter.update_review_status') {
        const { sessionId, recommendation, state } = job.payload;
        const result = await updateSessionStatus(sessionId, { recommendation, state });
        await this.updateJobStatus(id, 'completed', result);
        return;
      }

      // Recruiter: Bulk Analyze
      if (job.action_id === 'recruiter.bulk_analyze') {
        const result = await bulkAnalyzeCVs(job.payload);
        await this.updateJobStatus(id, 'completed', result);
        return;
      }

      // Default mock behavior for other actions
      setTimeout(async () => {
        await this.updateJobStatus(id, 'completed', {
          message: `Executed ${job.action_id}`,
          t: new Date(),
        });
      }, 1000);
    } catch (err: any) {
      console.error(`Job execution failed for ${job.action_id}:`, err);
      await this.updateJobStatus(id, 'failed', undefined, err.message || 'Unknown error');
    }
  }
}
