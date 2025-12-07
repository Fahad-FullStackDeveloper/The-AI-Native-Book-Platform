# Voice-to-Action: A Practical Guide

A true "Autonomous Humanoid" should be able to interact with us naturally. The Voice-to-Action (VLA) pipeline is what makes this possible, allowing a robot to understand a spoken command and translate it into a physical action.

This guide breaks down the three core stages of a modern VLA pipeline, using state-of-the-art AI models like OpenAI's Whisper and a Large Language Model (LLM).

## The Voice-to-Action Pipeline: A Three-Stage Breakdown

Think of the pipeline as an assembly line for meaning. It starts with raw audio and ends with a specific robot command.

### Stage 1: Speech-to-Text (STT) with Whisper

The first step is to convert spoken language into written text. This is a classic Automatic Speech Recognition (ASR) task.

*   **Tool:** We use **OpenAI's Whisper**. Its high accuracy across diverse accents and noisy environments makes it the ideal choice.
*   **Process:**
    1.  A ROS 2 node (`audio_capture_node`) continuously listens to a microphone feed.
    2.  When it detects sound, it captures an audio snippet.
    3.  This audio is sent to another node (`whisper_stt_node`) which runs the Whisper model (either locally or by calling the OpenAI API).
    4.  The output from Whisper is the transcribed text, for example: `"go to the kitchen"`.
    5.  This text is then published as a `std_msgs/String` to a ROS 2 topic, like `/transcribed_text`.

### Stage 2: Natural Language Understanding (NLU) with an LLM

A plain text string isn't enough for a robot; it needs structure. The NLU stage is responsible for extracting the user's *intent* from the text.

*   **Tool:** A powerful **Large Language Model (LLM)** like GPT-3.5 or GPT-4.
*   **Process:**
    1.  A ROS 2 node (`llm_nlu_node`) subscribes to the `/transcribed_text` topic.
    2.  When it receives the text, it wraps it in a carefully crafted **prompt** and sends it to the LLM. The prompt acts as an instruction for the LLM.
    3.  **Example Prompt:**
        ```
        You are a helpful robot assistant. Analyze the following user command and extract the core action and its parameters into a JSON object. The valid actions are "NAVIGATE", "PICKUP", and "GREET".

        User command: "go to the kitchen"

        JSON output:
        ```
    4.  The LLM processes this and returns a structured JSON object. For the example above, the output would be:
        ```json
        {
          "action": "NAVIGATE",
          "parameters": {
            "location": "kitchen"
          }
        }
        ```
    5.  This structured JSON string is then published to a new ROS 2 topic, like `/structured_command`.

### Stage 3: Action Dispatching

The final stage takes the structured command and makes the robot *do* something.

*   **Tool:** A custom Python ROS 2 node (`action_dispatcher_node`).
*   **Process:**
    1.  The `action_dispatcher_node` subscribes to the `/structured_command` topic.
    2.  When it receives a JSON command, it parses the `action` field.
    3.  Using a simple `if/elif/else` structure or a dictionary lookup, it maps the action name to a specific ROS 2 Action Client.
    4.  If the action was `"NAVIGATE"`, it would activate its Action Client for the Nav2 stack (`/navigate_to_pose`) and send the `location` parameter as a goal.
    5.  If the action was `"PICKUP"`, it would activate its Action Client for the robot's manipulator (`/pickup_object`).

## Reference ROS 2 Architecture

This entire pipeline can be visualized as a chain of ROS 2 nodes passing messages to each other:

`Microphone` -> **`AudioCaptureNode`** -> `/audio_stream` -> **`WhisperSTTNode`** -> `/transcribed_text` -> **`LLM_NLU_Node`** -> `/structured_command` -> **`ActionDispatcherNode`** -> ROS 2 Action Calls to (`/navigate_to_pose`, `/pickup_object`, etc.)

---
This "Language-Action" system is a core component of modern embodied AI. By integrating vision, you can expand its capabilities even further, allowing for commands like "pick up the red can on the table," creating a true Vision-Language-Action (VLA) system.
