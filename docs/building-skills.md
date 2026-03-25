# Building Skills for ClawShield

Skills are the "apps" of the ClawShield ecosystem. They allow the agent to perform specific actions like managing tasks, searching the web, or sending notifications.

## 🏗️ Skill Structure

A skill is a Node.js package located in its own directory. It must contain the following:

- **index.ts**: The main entry point for the skill's logic.
- **manifest.json** (or **SKILL.md**): Defines the skill's name, description, parameters, and icons.
- **package.json**: Lists dependencies for the skill.

## 🚀 Creating Your First Skill

1.  **Skeleton**:
    Create a new directory in `packages/skill-runner/skills/my-skill`.

2.  **Manifest Definition**:
    Define what your skill can do in a JSON manifest:
    ```json
    {
        "name": "Weather Reporter",
        "slug": "weather-reporter",
        "description": "Gets the current weather for a city.",
        "parameters": [
            {
                "name": "city",
                "type": "string",
                "description": "The city to get the weather for"
            }
        ]
    }
    ```

3.  **Implementation**:
    Write the function that ClawShield will call:
    ```typescript
    export async function run(params: { city: string }) {
        const response = await fetch(`https://api.weather.com/.../${params.city}`);
        const data = await response.json();
        return `The weather in ${params.city} is ${data.temp} degrees.`;
    }
    ```

## 🔒 Security & Sandboxing

Skills run inside a restricted Docker container. They:
- **Cannot** access the host filesystem.
- **Cannot** access other skills' data.
- **Must** request explicit permission for network access.

## 🧪 Testing Your Skill

You can test your skill locally by running the skill runner in development mode:
```bash
npm run dev --filter skill-runner
```

---

*For more templates, see the [examples/skills](./examples/skills) directory.*
