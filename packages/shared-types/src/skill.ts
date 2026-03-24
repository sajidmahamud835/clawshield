/**
 * A sandboxed skill that can be installed and run inside a Docker container.
 */
export interface Skill {
  /** Unique skill identifier (UUID v4) */
  readonly id: string;
  /** Human-readable skill name */
  readonly name: string;
  /** Semantic version string (e.g. "1.2.0") */
  readonly version: string;
  /** List of permissions the skill requires (e.g. "network", "filesystem:read") */
  readonly permissions: readonly string[];
  /** Docker image reference for the skill executor */
  readonly dockerImage: string;
}
