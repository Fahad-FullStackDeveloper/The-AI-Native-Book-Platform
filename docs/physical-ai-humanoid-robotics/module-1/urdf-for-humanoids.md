# Understanding URDF for Humanoids: A Practical Guide

The Unified Robot Description Format (URDF) is an essential XML file format in ROS used to describe every physical aspect of a robot. For a complex humanoid robot, the URDF is its digital blueprint, defining its shape, how its joints move, and its physical properties for simulation.

This guide provides a practical walkthrough of URDF's core components and shows how to build a simple humanoid model.

## Core URDF Elements

A URDF file is built around three fundamental tags: `<robot>`, `<link>`, and `<joint>`.

### 1. The `<link>` Tag
A **link** is a rigid body part of the robot. For a humanoid, this would be the torso, head, upper arm, etc. Each link has three key properties defined within it:

*   **`<visual>`**: Describes what the link looks like. You define its shape (`<geometry>`), such as a `<box>`, `<cylinder>`, or `<sphere>`, and its appearance (`<material>`), like its color.
*   **`<collision>`**: Describes the physical bounds of the link for collision detection. To improve performance, this is often a simpler version of the visual geometry.
*   **`<inertial>`**: Defines the link's physics properties, including its `<mass>` and its inertia tensor (`<inertia>`). These are crucial for realistic simulation in environments like Gazebo.

### 2. The `<joint>` Tag
A **joint** connects two links and defines how they can move relative to each other. For humanoids, the most common joint types are:

*   **`revolute`**: A hinge joint that rotates along a single axis with defined upper and lower limits (e.g., an elbow or knee).
*   **`continuous`**: A joint that can rotate infinitely along its axis (less common for humanoids).
*   **`fixed`**: A rigid connection between two links that doesn't allow any movement. This is useful for attaching parts that don't move, like a sensor.
*   **`prismatic`**: A sliding joint that moves along an axis (rare in humanoids).

Each joint must specify its `<parent>` and `<child>` links, the `<origin>` (position and orientation) of the joint, and the `<axis>` of motion.

## Example: A Simple Humanoid URDF

Let's build a URDF for a simple humanoid with a torso, head, and one arm. This example demonstrates the basic structure.

```xml
<?xml version="1.0"?>
<robot name="simple_humanoid">

  <!-- Define a reusable color material -->
  <material name="blue">
    <color rgba="0.0 0.0 0.8 1.0"/>
  </material>
  <material name="white">
    <color rgba="1.0 1.0 1.0 1.0"/>
  </material>

  <!-- 1. The Base Link (Torso) -->
  <link name="torso">
    <visual>
      <geometry>
        <box size="0.3 0.5 0.7"/>
      </geometry>
      <material name="blue"/>
    </visual>
    <collision>
      <geometry>
        <box size="0.3 0.5 0.7"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="10"/>
      <inertia ixx="0.4" ixy="0.0" ixz="0.0" iyy="0.4" iyz="0.0" izz="0.2"/>
    </inertial>
  </link>

  <!-- 2. The Head -->
  <link name="head">
    <visual>
      <geometry>
        <sphere radius="0.15"/>
      </geometry>
      <material name="white"/>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.15"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1"/>
      <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.01"/>
    </inertial>
  </link>

  <joint name="neck_joint" type="revolute">
    <parent link="torso"/>
    <child link="head"/>
    <origin xyz="0 0 0.4" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="10" velocity="1"/>
  </joint>

  <!-- 3. The Right Arm (Upper Arm only) -->
  <link name="upper_arm_r">
    <visual>
      <geometry>
        <cylinder length="0.4" radius="0.07"/>
      </geometry>
      <origin xyz="0 0 -0.2" rpy="0 0 0"/>
      <material name="white"/>
    </visual>
    <collision>
      <geometry>
        <cylinder length="0.4" radius="0.07"/>
      </geometry>
       <origin xyz="0 0 -0.2" rpy="0 0 0"/>
    </collision>
    <inertial>
      <mass value="2"/>
      <inertia ixx="0.02" ixy="0.0" ixz="0.0" iyy="0.02" iyz="0.0" izz="0.01"/>
    </inertial>
  </link>

  <joint name="shoulder_r_joint" type="revolute">
    <parent link="torso"/>
    <child link="upper_arm_r"/>
    <origin xyz="0 -0.3 0.25" rpy="0 1.57 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-1.57" upper="1.57" effort="10" velocity="1"/>
  </joint>

</robot>
```

## Simplifying with XACRO

For a full humanoid with dozens of links and joints, writing URDF by hand is tedious and error-prone. **XACRO (XML Macros)** is a scripting language that helps you create simpler, more readable, and reusable URDF files.

With XACRO, you can:
*   Define **properties** (variables) for commonly used values like link lengths or colors.
*   Create **macros** for repeated elements, like an entire arm or leg.
*   Include multiple files together.

### XACRO Example

Here's how we could simplify the arm part of our URDF using XACRO properties and a macro.

```xml
<?xml version="1.0"?>
<robot name="simple_humanoid_xacro" xmlns:xacro="http://www.ros.org/wiki/xacro">

  <!-- Define properties -->
  <xacro:property name="arm_mass" value="2"/>
  <xacro:property name="arm_length" value="0.4"/>
  <xacro:property name="arm_radius" value="0.07"/>

  <!-- Define a macro for a humanoid arm -->
  <xacro:macro name="humanoid_arm" params="prefix parent *origin">
    <link name="${prefix}_upper_arm">
      <visual>
        <geometry>
          <cylinder length="${arm_length}" radius="${arm_radius}"/>
        </geometry>
        <origin xyz="0 0 -${arm_length/2}" rpy="0 0 0"/>
        <material name="white"/>
      </visual>
      <!-- ... collision and inertial tags ... -->
    </link>

    <joint name="${prefix}_shoulder_joint" type="revolute">
      <parent link="${parent}"/>
      <child link="${prefix}_upper_arm"/>
      <xacro:insert_block name="origin"/>
      <axis xyz="0 1 0"/>
      <limit lower="-1.57" upper="1.57" effort="10" velocity="1"/>
    </joint>
  </xacro:macro>

  <!-- ... (torso and head links) ... -->

  <!-- Now, create the right and left arms using the macro -->
  <xacro:humanoid_arm prefix="right" parent="torso">
    <origin xyz="0 -0.3 0.25" rpy="0 1.57 0"/>
  </xacro:humanoid_arm>

  <xacro:humanoid_arm prefix="left" parent="torso">
    <origin xyz="0 0.3 0.25" rpy="0 1.57 0"/>
  </xacro:humanoid_arm>

</robot>
```
You would then convert this `.xacro` file into a final `.urdf` file using the command:
```bash
ros2 run xacro xacro my_robot.xacro > my_robot.urdf
```

## Visualization and Validation
Always check your URDF files to make sure they are correct.
*   **`check_urdf`**: A simple command to parse your URDF file and print out the robot's link and joint structure.
*   **RViz**: The primary ROS 2 visualization tool. You can use it to display your robot model and manually move its joints to verify that everything is connected correctly.
