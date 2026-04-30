import { z } from 'zod';

export const ActionSchemas = {
  'tenant.create': z.object({
    email: z.string().email(),
    role: z.enum(['candidate', 'recruiter']),
  }),

  'candidate.upload_cv': z.object({
    file_path: z.string(),
    file_type: z.enum(['pdf', 'docx']),
  }),

  'candidate.analyze_cv': z.object({
    cv_id: z.string(),
    target_role: z.string(),
  }),

  'recruiter.unlock_candidate': z.object({
    candidate_id: z.string(),
  }),

  'job.create': z.object({
    title: z.string(),
    description: z.string(),
  }),

  'recruiter.post_job': z.object({
    title: z.string(),
    company: z.string(),
    location: z.string(),
    description: z.string(),
    requirements: z.array(z.any()),
  }),

  'recruiter.invite_candidate': z.object({
    jobId: z.string(),
    phone: z.string(),
    name: z.string(),
    recruiterId: z.string(),
    jobTitle: z.string().optional(),
    companyName: z.string().optional(),
    scenario: z.enum(['direct', 'talent_bank']).optional(),
  }),

  'recruiter.update_review_status': z.object({
    sessionId: z.string(),
    recommendation: z.enum(['entrevista', 'rejeitar', 'mais_info']),
    state: z.string().optional(),
  }),

  'recruiter.bulk_analyze': z.object({
    jobId: z.string(),
    candidates: z.array(
      z.object({
        name: z.string(),
        phone: z.string(),
        cvText: z.string(),
      })
    ),
  }),

  'billing.add_credits': z.object({
    package_id: z.string(),
    payment_method_id: z.string(),
  }),

  'terminal.run_safe': z.object({
    script_name: z.string(),
  }),

  // Actions sem schema específico mapeado
  'observability.create_alert': z.object({}).passthrough(),
  'audit.export': z.object({}).passthrough(),
  'landing.preview': z.object({}).passthrough(),
  'landing.deploy_prod': z.object({}).passthrough(),
  'infra.rotate_keys': z.object({}).passthrough(),
};

export type ActionId = keyof typeof ActionSchemas;

export type ActionPayload<T extends ActionId> = z.infer<(typeof ActionSchemas)[T]>;
