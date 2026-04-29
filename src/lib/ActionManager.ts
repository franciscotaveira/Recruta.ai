import actionContracts from '../../docs/ACTION_CONTRACTS.json';
import { ActionSchemas, ActionId } from '../contracts/ActionSchemas';

export interface ActionMetadata {
  id: string;
  description: string;
  category: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  approval_required: boolean;
  rate_limit?: string;
  estimated_cost?: number;
  audit_events?: string[];
  rollback_strategy?: string;
  preconditions?: string[];
  allowlist?: string[];
}

export interface ValidationResult {
  valid: boolean;
  actionId: ActionId;
  metadata: ActionMetadata;
  payload: any;
  errors?: any;
}

export class ActionManager {
  private static actions: Map<string, ActionMetadata> = new Map();

  static {
    // Initialize mapping
    actionContracts.actions.forEach((action: any) => {
      ActionManager.actions.set(action.id, action as ActionMetadata);
    });
  }

  static getMetadata(actionId: ActionId): ActionMetadata | undefined {
    return this.actions.get(actionId);
  }

  static validateIntent<T extends ActionId>(actionId: T, payload: any): ValidationResult {
    const metadata = this.getMetadata(actionId);
    
    if (!metadata) {
      return {
        valid: false,
        actionId,
        metadata: {} as ActionMetadata,
        payload,
        errors: [`Action contract ${actionId} not found`]
      };
    }

    const schema = ActionSchemas[actionId];
    if (!schema) {
      return {
        valid: false,
        actionId,
        metadata,
        payload,
        errors: [`Zod schema for ${actionId} not found`]
      };
    }

    const parseResult = schema.safeParse(payload);

    if (!parseResult.success) {
      return {
        valid: false,
        actionId,
        metadata,
        payload,
        errors: parseResult.error.format()
      };
    }

    return {
      valid: true,
      actionId,
      metadata,
      payload: parseResult.data
    };
  }
}
