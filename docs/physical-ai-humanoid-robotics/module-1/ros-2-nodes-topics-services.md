# ROS 2 Nodes, Topics, and Services: The Core Communication System

ROS 2 (Robot Operating System 2) is a powerful, flexible framework for building robot software. At its heart is a communication system that allows different parts of your robot's software to exchange information seamlessly. Understanding the core concepts of Nodes, Topics, and Services is the first and most crucial step to mastering ROS 2.

## 1. ROS 2 Nodes: The Building Blocks of Your Robot's Brain

Think of a node as a small, specialized program responsible for a single purpose. A complete robotics system is built from many nodes working together. For example, you might have:

*   A **`camera_driver_node`** that captures images from a camera.
*   An **`image_processing_node`** that detects objects in those images.
*   A **`motor_controller_node`** that drives the robot's wheels.
*   A **`navigation_node`** that plans paths to a destination.

This modular approach is a cornerstone of ROS 2. It makes your system easier to debug, test, and reuse across different projects. A single executable file can contain one or more nodes.

### Interacting with Nodes (Command Line)

You can use the `ros2` command-line tool to get information about your running nodes.

*   **Launch a Node:** To run a node, you use `ros2 run`:
    ```bash
    ros2 run <package_name> <executable_name>
    ```
    For example, to run the `turtlesim_node` from the `turtlesim` package:
    ```bash
    ros2 run turtlesim turtlesim_node
    ```

*   **List Running Nodes:** To see all the nodes currently running on your system, open a new terminal and enter:
    ```bash
    ros2 node list
    ```
    You will see the names of all active nodes, like `/turtlesim`.

*   **Get Node Information:** To inspect a specific node and see its connections (like its publishers, subscribers, and services), use `ros2 node info`:
    ```bash
    ros2 node info /turtlesim
    ```

## 2. ROS 2 Topics: The Data Stream

Topics are the primary mechanism for continuous, one-way data communication in ROS 2. They work on a **publish-subscribe** model.

*   A **Publisher** node sends data (called "messages") to a topic.
*   A **Subscriber** node receives that data by subscribing to the same topic.

Multiple nodes can publish to or subscribe to the same topic. This creates a decoupled system where nodes don't need to know about each other directly; they only need to know the name and type of the topic.

For example, the `/camera_driver_node` would **publish** raw image messages to an `/image_raw` topic. The `/image_processing_node` would **subscribe** to `/image_raw` to receive the images for processing.

### Message Types

Every topic has a specific **message type**. This is the data structure that all messages on that topic must follow. For example, an image topic might use the `sensor_msgs/msg/Image` type, while a robot's velocity command might use `geometry_msgs/msg/Twist`.

### Interacting with Topics (Command Line)

*   **List Active Topics:**
    ```bash
    ros2 topic list
    ```
    This shows all topics currently being published or subscribed to. You can add `-t` to also see the message type for each topic.

*   **Echo Topic Content:** To see the data being published on a topic in real-time, use `ros2 topic echo`:
    ```bash
    ros2 topic echo /turtle1/cmd_vel
    ```

*   **Get Topic Information:** To see how many publishers and subscribers a topic has, use `ros2 topic info`:
    ```bash
    ros2 topic info /turtle1/cmd_vel
    ```
*   **Publish a Message Manually:** You can even publish a message directly from the command line, which is great for testing:
    ```bash
    ros2 topic pub --once /turtle1/cmd_vel geometry_msgs/msg/Twist "{linear: {x: 2.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 1.8}}"
    ```

## 3. ROS 2 Services: Request and Reply

While topics are for continuous data streams, **services** are used for synchronous, two-way communication. This is a **request-reply** model, similar to calling a function in a program.

*   A **Service Server** node advertises a service and waits for requests.
*   A **Service Client** node calls the service with a request message.
*   The server processes the request and sends a response message back to the client.

This is useful for actions that need to be triggered and confirmed, such as:
*   Requesting a robot to move to a specific named location.
*   Resetting a simulation.
*   Querying the current state of a sensor.

### Service Types

Similar to topics, services have a **service type** defined in a `.srv` file. This file specifies the structure of both the request and the response.

### Interacting with Services (Command Line)

*   **List Active Services:**
    ```bash
    ros2 service list
    ```
    You can add `-t` to see the service types.

*   **Find Service by Type:**
    ```bash
s   ros2 service find std_srvs/srv/Empty
    ```

*   **Call a Service:** You can call a service from the command line and see the response:
    ```bash
    ros2 service call /clear std_srvs/srv/Empty
    ```

---

By understanding and combining these three core concepts—Nodes, Topics, and Services—you can start to build complex and robust robotic applications with ROS 2.
