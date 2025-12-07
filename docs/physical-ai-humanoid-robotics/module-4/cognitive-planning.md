# Cognitive Planning: Using LLMs as a Robot's "Brain"

Cognitive Planning is the process of taking a high-level, abstract goal ("get me a drink") and decomposing it into a sequence of simple, concrete actions a robot can actually execute (`NAVIGATE_TO(fridge)`, `OPEN()`, `PICK(soda_can)`, etc.). This is the bridge between human intent and robot behavior.

Traditionally, this required developers to write complex, brittle state machines or planners. Today, we can leverage the "common sense" reasoning power of Large Language Models (LLMs) to do this planning for us.

## The LLM as a "Common Sense" Task Planner

An LLM's power comes from its training on vast amounts of text, which allows it to understand the implicit steps in human commands. It knows that "get a drink" implies going to a fridge, opening it, finding a drink, and bringing it back. Our job is to give the LLM the right context so it can apply this reasoning to our specific robot.

## The Core Technique: Prompt Engineering

The key to making an LLM act as a reliable task planner is **Prompt Engineering**. The prompt is the instruction we give the LLM, and it needs to contain all the information the LLM needs to create a valid plan. A well-designed prompt has four key parts:

1.  **Set the Context:** Tell the LLM what its role is.
2.  **Define the Goal:** Provide the high-level command from the user.
3.  **Provide the "Tools" (Primitive Actions):** This is the most important part. You must give the LLM a list of the *only* actions your robot knows how to do. This constrains the LLM's output to a set of executable commands.
4.  **Specify the Output Format:** Instruct the LLM to return the plan in a machine-readable format, like JSON.

### Example: A Complete Prompt

```
You are a helpful robot assistant that creates a plan to accomplish a user's goal.
The user's goal is: "Clean up the table and put the trash in the bin."

You have access to the following robot actions (the "tools"):
- NAVIGATE_TO(location): moves the robot to a specific location.
- PICK_UP(object): picks up a specific object.
- PLACE_AT(location): places the held object at a specific location.

The following objects are visible in the room:
- "soda_can" is on the "table".
- "apple_core" is on the "table".
- "trash_bin" is in the "corner".

Generate a plan as a JSON array of actions to achieve the user's goal.

JSON Output:
```

## The Full Execution Pipeline

Putting it all together, the cognitive planning system works as a pipeline:

1.  **Input:** A high-level goal, likely from the NLU stage of a Voice-to-Action pipeline (e.g., `{"goal": "Clean the table"}`).

2.  **LLM Planner Node:** A ROS 2 node receives this goal. It constructs the detailed prompt, including the robot's available primitive actions and any known information about the world state (from a perception system). It then sends this prompt to an LLM API (like OpenAI).

3.  **LLM Output (The Plan):** The LLM processes the prompt and returns a structured, multi-step plan. For the prompt above, the output might be:
    ```json
    [
      { "action": "NAVIGATE_TO", "parameters": { "location": "table" } },
      { "action": "PICK_UP", "parameters": { "object": "soda_can" } },
      { "action": "NAVIGATE_TO", "parameters": { "location": "trash_bin" } },
      { "action": "PLACE_AT", "parameters": { "location": "trash_bin" } },
      { "action": "NAVIGATE_TO", "parameters": { "location": "table" } },
      { "action": "PICK_UP", "parameters": { "object": "apple_core" } },
      { "action": "NAVIGATE_TO", "parameters": { "location": "trash_bin" } },
      { "action": "PLACE_AT", "parameters": { "location": "trash_bin" } }
    ]
    ```

4.  **Plan Executor Node:** A separate ROS 2 node subscribes to the plan. It iterates through the array, executing one step at a time. For each step, it calls the appropriate ROS 2 Action Server (e.g., calling the Nav2 action server for `NAVIGATE_TO`, a MoveIt action server for `PICK_UP`, etc.) and waits for the action to succeed before proceeding to the next step.

## Challenges and the Road Ahead

Using LLMs for task planning is a powerful but new field. Key challenges include:

*   **Error Handling:** What should the robot do if one step of the plan fails? The system needs a "re-planning" mechanism, likely by re-prompting the LLM with the error information.
*   **Safety and Grounding:** How do we ensure the LLM doesn't generate unsafe or nonsensical plans? The plan must be "grounded" in the robot's actual capabilities and environment.
*   **Hallucinations:** The LLM might try to `PICK_UP` an object that doesn't exist. The robot's perception system must be able to validate the steps in the plan.

Solving these challenges is the focus of cutting-edge robotics research, but the fundamental pipeline described here is the foundation for building truly intelligent and autonomous humanoid robots.
