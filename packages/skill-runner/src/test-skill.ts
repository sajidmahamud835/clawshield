import { SkillRunner } from './index.js';
import type { Skill } from '@clawshield/shared-types';

async function test() {
  const runner = new SkillRunner();
  const testSkill: Skill = {
    id: 'test-skill-123',
    name: 'Test Skill',
    version: '1.0.0',
    permissions: [],
    dockerImage: 'alpine',
  };

  console.log('Testing SkillRunner with alpine echo...');
  try {
    // Overriding the default behavior to just echo the params
    // Since alpine doesn't know what to do with a JSON string as the first arg usually,
    // we'll use a slightly different approach for the test.

    const result = await (runner as any).runSkill(testSkill, [
      'echo',
      'Hello from ClawShield Sandbox',
    ]);
    console.log('Result:', result);
    if (result.includes('Hello from ClawShield Sandbox')) {
      console.log('✅ SkillRunner verification successful!');
    } else {
      console.error('❌ SkillRunner verification failed: unexpected output');
    }
  } catch (err) {
    console.error('❌ SkillRunner verification failed:', err);
  }
}

test();
