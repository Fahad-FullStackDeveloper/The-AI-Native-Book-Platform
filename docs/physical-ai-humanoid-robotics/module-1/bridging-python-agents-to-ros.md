# Bridging Python Agents to ROS 2 with `rclpy`

As AI agents become more sophisticated, there's a growing need to connect them to the physical world. ROS 2, the premier framework for robot software, offers a Python client library called `rclpy` that creates a seamless bridge between your Python-based AI agent and the robot's hardware controllers. This allows your AI's "brain" to directly perceive and act in a physical environment.

This tutorial will guide you step-by-step through creating a simple Python-based ROS 2 "agent" that publishes information to the ROS 2 network.

## Prerequisites

Before you begin, ensure you have ROS 2 Foxy Fitzroy installed on your Ubuntu 20.04 system. You will also need to "source" your ROS 2 environment in every new terminal you open.

```bash
source /opt/ros/foxy/setup.bash
```

## Step 1: Create a ROS 2 Workspace and Package

First, we need a dedicated workspace to hold our project and a package within it to contain our agent's code.

1.  **Create a Workspace Directory:**
    ```bash
    mkdir -p ~/ros2_agent_ws/src
    cd ~/ros2_agent_ws/src
    ```

2.  **Create a Python Package:**
    Inside the `src` directory, run the following command to create a new Python package for our agent. We'll name it `py_agent`:
    ```bash
    ros2 pkg create --build-type ament_python py_agent --dependencies rclpy std_msgs
    ```
    This command creates a package named `py_agent`, specifies it's a Python package, and automatically adds `rclpy` and `std_msgs` as dependencies in the `package.xml` file.

## Step 2: Write the Python Agent Node

Now, let's write the core logic for our agent. We'll create a Python file inside our package.

1.  **Navigate to your package and create a file:**
    ```bash
    cd py_agent/py_agent
    touch agent_node.py
    ```

2.  **Add the Agent Code:**
    Open `agent_node.py` in your favorite editor and paste the following code. This code defines a simple agent that periodically publishes a status message.

    ```python
    import rclpy
    from rclpy.node import Node
    from std_msgs.msg import String
    import random

    class AgentNode(Node):
        """
        A simple ROS 2 node representing an AI agent.
        It periodically makes a "decision" and publishes its status.
        """
        def __init__(self):
            # Initialize the Node with the name 'agent_node'
            super().__init__('agent_node')
            self.get_logger().info("AgentNode has been started.")

            # Create a publisher on the 'agent_status' topic
            self.publisher_ = self.create_publisher(String, 'agent_status', 10)

            # Create a timer that calls the 'timer_callback' function every 2 seconds
            timer_period = 2.0  # seconds
            self.timer = self.create_timer(timer_period, self.timer_callback)

            self.agent_id = f"Agent_{random.randint(100, 999)}"
            self.possible_actions = ["analyzing data", "monitoring sensors", "planning next move", "reporting status"]

        def timer_callback(self):
            """
            This method is called by the timer and contains the agent's core logic.
            """
            # Simulate the agent making a decision
            action = random.choice(self.possible_actions)
            
            # Create a String message
            msg = String()
            msg.data = f'{self.agent_id} is currently: {action}'

            # Publish the message and log it to the console
            self.publisher_.publish(msg)
            self.get_logger().info(f'Publishing: "{msg.data}"')

    def main(args=None):
        # Initialize the rclpy library
        rclpy.init(args=args)

        # Create an instance of our agent node
        agent_node = AgentNode()

        # Keep the node running so it can publish messages
        rclpy.spin(agent_node)

        # Clean up and destroy the node when finished
        agent_node.destroy_node()
        rclpy.shutdown()

    if __name__ == '__main__':
        main()
    ```

## Step 3: Configure the Package for Execution

We need to tell ROS 2 how to find and run our Python script.

1.  **Modify `setup.py`:**
    Navigate back to the root of your package (`~/ros2_agent_ws/src/py_agent`) and open `setup.py`. We need to add an "entry point" for our script. Find the `entry_points` dictionary and add the following line inside `'console_scripts'`:

    ```python
    entry_points={
        'console_scripts': [
            'agent_node = py_agent.agent_node:main',
        ],
    },
    ```
    This tells ROS 2 that the command `agent_node` should execute the `main` function from the `agent_node.py` file.

2.  **Fill out `package.xml`:**
    It's good practice to fill out the metadata in your `package.xml` file (also in `~/ros2_agent_ws/src/py_agent`). Add your name as the maintainer, a short description, and choose a license (e.g., Apache-2.0).

## Step 4: Build and Run the Agent

Now we can build our package and run the agent.

1.  **Build the Workspace:**
    Navigate to the root of your workspace (`~/ros2_agent_ws`) and run `colcon build`:
    ```bash
    cd ~/ros2_agent_ws
    colcon build --packages-select py_agent
    ```

2.  **Source the Workspace:**
    After a successful build, you need to source the workspace's setup file to make your new package available in the terminal:
    ```bash
    source install/setup.bash
    ```

3.  **Run the Agent Node:**
    Now you can finally run your agent!
    ```bash
    ros2 run py_agent agent_node
    ```
    You should see the "AgentNode has been started" message, followed by periodic status updates.

## Step 5: Verify Communication

To confirm our agent is communicating correctly, we can listen to the topic it's publishing on. Open a **new terminal**, source your workspace again (`source ~/ros2_agent_ws/install/setup.bash`), and use `ros2 topic echo`:

```bash
ros2 topic echo /agent_status
```

You will now see the live status messages being published by your Python agent node.

You have successfully created a bridge between a Python application and the ROS 2 ecosystem! From here, you can build much more complex agents that subscribe to sensor data, process it, and command a robot's actions.
