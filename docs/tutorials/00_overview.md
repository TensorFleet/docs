---
id: overview
title: Drone Tutorial Overview
sidebar_label: Overview
slug: /tutorials/overview
---

# Drone Tutorial Overview

This section contains step-by-step tutorials for learning drone programming with TensorFleet using JavaScript.

## Tutorial Index

### Beginner

| Tutorial | Topic | Prerequisites |
|----------|-------|---------------|
| [00: Preparation](00_preparation.md) | Setup & Simulation | None |
| [01: Connection](01_connection.md) | ROS Bridge Connection & State Monitoring | Preparation |
| [02: Telemetry](02_telemetry.md) | Comprehensive Telemetry Collection | Connection |

### Intermediate

| Tutorial | Topic | Prerequisites |
|----------|-------|---------------|
| [03: Arm/Disarm](03_arm.md) | Arm and Disarm the Drone | Telemetry |
| [04: Takeoff & Land](04_takeoff_land.md) | Complete Flight Cycle | Arm/Disarm |
| [05: OFFBOARD Hover](05_offboard_hover.md) | Enter OFFBOARD Mode and Hover | Takeoff/Land |

### Advanced

| Tutorial | Topic | Prerequisites |
|----------|-------|---------------|
| [06: Move Forward](06_move_forward.md) | Velocity-Based Movement Control | OFFBOARD Hover |
| [07: Go to Waypoint](07_goto_waypoint.md) | Position-Based Navigation | Move Forward |

## Learning Path

```
Preparation → Connection → Telemetry → Arm/Disarm
                                           ↓
                                    Takeoff & Land
                                           ↓
                                    OFFBOARD Hover
                                           ↓
                                    Move Forward
                                           ↓
                                    Go to Waypoint
```

## Getting Started

1. Start with [Preparation](00_preparation.md) to set up your environment
2. Follow the tutorials in numerical order
3. Each tutorial includes:
   - Learning objectives
   - Code examples with expected output
   - Detailed explanations
   - Common troubleshooting tips

## Prerequisites

- TensorFleet VS Code Extension installed
- Active TensorFleet VM
- Basic JavaScript knowledge
- Bun runtime (recommended) or Node.js 14+

## Running Tutorial Scripts

All tutorials have corresponding scripts you can run:

```bash
# Beginner
bun run src/tutorials/01_connect.js
bun run src/tutorials/02_telemetry.js
bun run src/tutorials/03_arm.js

# Intermediate
bun run src/tutorials/04_takeoff_land.js
bun run src/tutorials/05_offboard_hover.js

# Advanced
bun run src/tutorials/06_move_forward.js
bun run src/tutorials/07_goto_waypoint.js
```

## Also See

- [Robotics Tutorials](../robotics/00_overview.md) - Ground robot control with JS + Python
- [VS Code Extension](../vscode-extension.md) - TensorFleet extension features

## Navigation

- **Main Index**: [All Tutorials](../tutorial.md)
- **Next**: [Preparation Tutorial](00_preparation.md)

---

*Follow the tutorials in order for the best learning experience. Each builds on concepts from previous tutorials.*
