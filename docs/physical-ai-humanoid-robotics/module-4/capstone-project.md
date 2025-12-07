# Capstone Project: The Autonomous Humanoid Helper

This is the culmination of everything you have learned. The capstone project challenges you to integrate all the modules of this course—from ROS 2 basics to advanced AI planning—into a single, intelligent system. Your task is to build and program a simulated humanoid robot that acts as a helpful autonomous assistant.

## The Vision: An AI-Powered Assistant

The goal is to move beyond simple, pre-programmed robotics. You will create a robot that can perceive its environment, understand natural language, reason about a task, and execute a multi-step plan to help a human user. This project is your chance to build a true, end-to-end Vision-Language-Action (VLA) system.

## The Scenario

Your robot is in a simulated room (e.g., a living room or office environment in Isaac Sim). The room contains various objects on different surfaces. The user will give a voice command to the robot, such as:

**"Could you please find the soda can and bring it to me?"**

The robot must then autonomously perform the entire sequence of actions to fulfill the request.

## Core Technical Requirements

Your final project will be graded on the successful implementation and integration of the following five components. Your system must:

1.  **Implement a Voice-to-Action Pipeline:**
    *   The system must capture a spoken command from the user.
    *   It must use **Whisper** to accurately transcribe the speech to text.
    *   It must use an **LLM** to perform Natural Language Understanding (NLU), extracting the user's core intent and parameters (e.g., action: `FETCH`, object: `soda can`).

2.  **Perform Cognitive Planning:**
    *   The system must use another call to an **LLM** to act as a task planner.
    *   Given the user's intent, the LLM must generate a logical, multi-step plan composed of the robot's known primitive actions (e.g., `NAVIGATE`, `PICK`, `PLACE`).

3.  **Achieve Autonomous Navigation:**
    *   The robot must use the **Nav2** stack to navigate from its starting point to the object's location and then to the delivery location.
    *   It must successfully generate a global plan and use its local planner to avoid any unexpected obstacles.

4.  **Demonstrate AI-Powered Perception:**
    *   The robot must use its simulated camera to find and identify the target object.
    *   This requires using a perception model (e.g., a fine-tuned object detector) running as a hardware-accelerated **Isaac ROS** node to process the camera feed and locate the object in the scene.

5.  **Execute Manipulation Tasks:**
    *   Once the object is identified, the robot must use a motion planner (like MoveIt) to calculate a valid trajectory for its arm.
    *   It must successfully pick up the object and later place it at the target destination.

## The "Digital Twin" Workflow in Action

To build this project, you will follow the sim-to-real workflow that is central to modern AI robotics:

1.  **Simulation First:** Your entire project will be developed and demonstrated within **NVIDIA Isaac Sim**. This allows for rapid testing and iteration without the need for physical hardware.

2.  **Synthetic Data and Training:** You will use Isaac Sim's synthetic data generation capabilities to create a small, labeled dataset of the target objects in your scene. You will use this dataset to train or fine-tune a simple object detection model.

3.  **Accelerated Deployment:** The trained perception model will be deployed using an **Isaac ROS** node (e.g., `isaac_ros_object_detection`) to take advantage of GPU acceleration.

4.  **ROS 2 Integration:** All the components—voice processing, planning, navigation, and manipulation—will be integrated as a cohesive system of ROS 2 nodes and action servers.

## Stretch Goals (For the Ambitious)

Looking to push your project to the next level? Try implementing one or more of the following:

*   **Multi-Command Understanding:** Handle more complex commands like, "Pick up the can and the apple, and throw them in the trash."
*   **Dynamic Replanning:** If a step in the plan fails (e.g., the robot fails to grasp the object), the system should detect the failure, and re-prompt the LLM to generate a new plan to recover from the error.
*   **Vision-Grounded NLU:** Instead of just telling the LLM what you see, feed a description of the scene from your perception system directly into the LLM's context for more "grounded" planning.
*   **Real-World Deployment:** If you have access to a physical robot, attempt to deploy your system outside of the simulation.
