import { spawn } from 'node:child_process';
import type { Skill } from '@clawshield/shared-types';

export class SkillRunner {
  private activeContainers = new Map<string, string>(); // skillId -> containerId

  /**
   * Runs a skill in a sandboxed Docker container.
   */
  async runSkill(skill: Skill, params: Record<string, any>): Promise<string> {
    console.log(`[SkillRunner] Running skill: ${skill.name} (${skill.id})`);

    const containerName = `clawshield-skill-${skill.id}-${Date.now()}`;

    // Construct docker run command
    // --rm: Automatically remove the container when it exits
    // --network none: Default to no network for security, unless permitted
    const network = skill.permissions.includes('network') ? 'clawshield-internal' : 'none';

    const args = [
      'run',
      '--rm',
      '--name',
      containerName,
      '--network',
      network,
      skill.dockerImage,
      JSON.stringify(params),
    ];

    return new Promise((resolve, reject) => {
      const docker = spawn('docker', args);
      let stdout = '';
      let stderr = '';

      docker.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      docker.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      docker.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Skill execution failed with code ${code}: ${stderr}`));
        }
      });
    });
  }

  async stopSkill(skillId: string): Promise<void> {
    const containerId = this.activeContainers.get(skillId);
    if (containerId) {
      spawn('docker', ['stop', containerId]);
      this.activeContainers.delete(skillId);
    }
  }
}

export const SKILL_RUNNER_VERSION = '0.1.0' as const;
