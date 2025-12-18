---
id: 00_overview
title: Robotics Overview
sidebar_label: Overview
---

# Robotics Programming with TensorFleet

Welcome to the TensorFleet robotics documentation! This section covers ground robot control, sensor integration, and autonomous behaviors using both **JavaScript** and **Python**.

## What You'll Learn

- **Robot Movement**: Control ground robots via velocity commands
- **Obstacle Avoidance**: Use LiDAR for autonomous navigation
- **Computer Vision**: Object detection with YOLO

## Language Support

All robotics examples are available in both JavaScript and Python:

| Language | Runtime | ROS Library | Best For |
|----------|---------|-------------|----------|
| JavaScript | Bun / Node.js | roslib | Web integration, rapid prototyping |
| Python | Python 3.8+ | roslibpy | Data science, ML integration |

Both languages connect to your robot via rosbridge WebSocket - no local ROS installation required.

## Quick Start

### Prerequisites

- TensorFleet VS Code Extension installed
- Active TensorFleet VM with a robot simulation
- Simulation View open in the sidebar

### JavaScript Setup

```bash
# Install Bun (recommended)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install
```

### Python Setup

```bash
# Install uv (recommended) or use pip
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment and install dependencies
uv venv
uv pip install -r requirements.txt
```

## Tutorials

| Tutorial | Description | Languages |
|----------|-------------|-----------|
| [Robot Mover](01_robot_mover.md) | Basic velocity control and movement sequences | JS + Python |
| [Obstacle Avoider](02_obstacle_avoider.md) | LiDAR-based autonomous obstacle avoidance | JS + Python |
| [Vision YOLO](03_vision_yolo.md) | Object detection with YOLO on camera feed | JS + Python |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Local Machine                       │
├─────────────────────────────────────────────────────────────┤
│   ┌─────────────┐         ┌─────────────────────────────┐   │
│   │ JavaScript  │         │         Python              │   │
│   │   (Bun)     │         │        (uv/pip)             │   │
│   │             │         │                             │   │
│   │  roslib.js  │         │       roslibpy              │   │
│   └──────┬──────┘         └──────────────┬──────────────┘   │
│          │                               │                   │
│          └───────────┬───────────────────┘                   │
│                      │                                       │
│              WebSocket Connection                            │
│                      │                                       │
└──────────────────────┼───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                   TensorFleet VM                             │
├──────────────────────────────────────────────────────────────┤
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│   │  rosbridge   │◄──▶│    ROS 2     │◄──▶│   Gazebo     │  │
│   │  (port 9091) │    │              │    │  Simulation  │  │
│   └──────────────┘    └──────────────┘    └──────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Key ROS Topics

| Topic | Type | Description |
|-------|------|-------------|
| `/cmd_vel_raw` | `geometry_msgs/Twist` | Velocity commands |
| `/scan` | `sensor_msgs/LaserScan` | LiDAR scan data |
| `/camera/image_raw` | `sensor_msgs/Image` | Camera feed |
| `/camera/image_annotated` | `sensor_msgs/Image` | Annotated output |

## Configuration

Both JavaScript and Python templates support environment variable configuration:

| Variable | Default | Description |
|----------|---------|-------------|
| `CMD_VEL_TOPIC` | `/cmd_vel_raw` | Velocity command topic |
| `SCAN_TOPIC` | `/scan` | LiDAR scan topic |
| `IMAGE_TOPIC` | `/camera/image_raw` | Camera input topic |
| `LINEAR_SPEED` | `0.2` | Forward speed (m/s) |
| `ANGULAR_SPEED` | `0.5` | Turning speed (rad/s) |

## VS Code Panels

Use these TensorFleet panels while developing:

- **Simulation View**: See your robot in Gazebo
- **Image Panel**: View camera feed and detections
- **Teleops Panel**: Manual robot control
- **Raw Messages**: Debug ROS topic data

## Next Steps

Start with the [Robot Mover](01_robot_mover.md) tutorial to learn basic movement control, then progress through obstacle avoidance and vision.

---

*The robotics templates demonstrate the same concepts in both JavaScript and Python, letting you choose the language that best fits your project.*


