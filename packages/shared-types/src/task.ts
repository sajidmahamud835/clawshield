/**
 * Status lifecycle of a task managed by ClawShield.
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Priority levels for task ordering.
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * A task created by the AI agent on behalf of the user.
 */
export interface Task {
  /** Unique task identifier (UUID v4) */
  readonly id: string;
  /** Short summary of the task */
  readonly title: string;
  /** Optional detailed description */
  readonly description: string;
  /** Person or system responsible for the task */
  readonly assignee: string;
  /** ISO-8601 date string for the deadline */
  readonly due_date: string;
  /** Current task status */
  readonly status: TaskStatus;
  /** Task priority */
  readonly priority: TaskPriority;
}
