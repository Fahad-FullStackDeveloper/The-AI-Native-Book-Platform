# Weekly Breakdown

This 12-week course is structured into four modules, with each module spanning three weeks. This breakdown provides a week-by-week guide to the topics, activities, and learning objectives.

---

### **Module 1: The Robotic Nervous System (ROS 2)**

*   **Objective:** Understand the foundational middleware for modern robotics and learn how to send and receive data between different parts of a robot's software stack.

*   **Week 1: Introduction to ROS 2 & URDF**
    *   **Topics:** What is ROS? Core concepts (Nodes, Topics, Messages). Setting up a ROS 2 workspace.
    *   **Lab Activity:** Write a simple "hello world" publisher and subscriber in Python.
    *   **Reading:** ROS 2 Docs: "Understanding Nodes, Topics, Services, and Actions".

*   **Week 2: Services, Actions, and Launch Files**
    *   **Topics:** Synchronous vs. Asynchronous communication. Building complex applications with launch files.
    *   **Lab Activity:** Create a service that performs a simple calculation and an action that simulates a long-running task.
    *   **Reading:** URDF Tutorials: "Building a Visual Robot Model".

*   **Week 3: URDF for Humanoids & `rclpy`**
    *   **Topics:** Designing a humanoid model with joints and links in URDF. Bridging AI logic to ROS with the `rclpy` (ROS Client Library for Python).
    *   **Lab Activity:** Build a simple humanoid URDF and visualize it in RViz2. Write a Python script that subscribes to a topic and controls a joint.
    *   **Lab 1 Due**

---

### **Module 2: The Digital Twin (Gazebo & Unity)**

*   **Objective:** Learn to create and interact with high-fidelity simulations of robots and their environments.

*   **Week 4: Introduction to Physics Simulation with Gazebo**
    *   **Topics:** What is a physics engine? Gazebo vs. Isaac Sim. Spawning your URDF model in a Gazebo world.
    *   **Lab Activity:** Create a simple world in Gazebo (e.g., a room with a table) and place your humanoid model in it.

*   **Week 5: Simulating Sensors & The World**
    *   **Topics:** Adding simulated sensors to your robot (LiDAR, Depth Camera, IMU). Understanding sensor data.
    *   **Lab Activity:** Attach a simulated depth camera to your robot and visualize the point cloud data in RViz2.

*   **Week 6: Advanced Rendering & Interaction with Unity**
    *   **Topics:** Why use a game engine? Connecting ROS 2 to Unity for photorealistic rendering and interactive UI elements.
    *   **Lab Activity (Optional Bonus):** Create a simple Unity scene and use the ROS-TCP-Connector to subscribe to a topic from your ROS 2 graph.
    *   **Lab 2 Due**

---

### **Module 3: The AI-Robot Brain (NVIDIA Isaac™)**

*   **Objective:** Leverage hardware acceleration and advanced AI tools to give your robot perception and navigation capabilities.

*   **Week 7: Introduction to NVIDIA Isaac Sim**
    *   **Topics:** The Omniverse platform. Differences between Isaac Sim and Gazebo. Generating synthetic data for training AI models.
    *   **Lab Activity:** Import your humanoid URDF into Isaac Sim and set up a basic scene.

*   **Week 8: Visual SLAM with Isaac ROS**
    *   **Topics:** What is SLAM (Simultaneous Localization and Mapping)? Using the Isaac ROS VSLAM package to create a map of an unknown environment.
    *   **Lab Activity:** Run the Isaac ROS VSLAM container and have your robot autonomously map a pre-built Isaac Sim environment.

*   **Week 9: Autonomous Navigation with Nav2**
    *   **Topics:** The Nav2 stack (path planning, obstacle avoidance). Configuring Nav2 for a bipedal robot.
    *   **Lab Activity:** Given a map created in the previous week, command your robot to navigate to a specific point using Nav2.
    *   **Lab 3 Due**

---

### **Module 4: Vision-Language-Action (VLA)**

*   **Objective:** Connect the world of Large Language Models (LLMs) to the physical actions of your robot.

*   **Week 10: Voice-to-Action**
    *   **Topics:** Using speech-to-text models like OpenAI's Whisper to create a natural language interface for your robot.
    *   **Lab Activity:** Write a Python script that uses the Whisper API to transcribe a voice command and publish it to a ROS 2 topic.

*   **Week 11: Cognitive Planning with LLMs**
    *   **Topics:** Using LLMs (e.g., GPT-4) for task decomposition. Translating a high-level command like "get me the water bottle" into a sequence of robot actions.
    *   **Lab Activity:** Create a "behavior tree" in ROS 2 that can be controlled by the output of an LLM.

*   **Week 12: Capstone Project Finale**
    *   **Topics:** Final project integration, debugging, and presentation skills.
    *   **Activity:** Final project presentations and live demos.
    *   **Capstone Project Due**