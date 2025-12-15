---
sidebar_position: 2
title: VS Code Extension
description: Onboard to the TensorFleet cockpit inside VS Code.
---

# TensorFleet VS Code Extension

Build, simulate, and operate PX4/ROS 2 robots without leaving VS Code. This guide gets you from install to a project with dashboards and telemetry streaming.

## Install

1. **Prereqs**: VS Code (latest), Node.js 20+ for building from source, and Git.
2. **Get the extension**:
   - Marketplace: search for **"TensorFleet Robots and Drone Environment"**.
   - Local build: clone `vscode-tensorfleet`, run `./build.sh`, then `code --install-extension dist/tensorfleet-*.vsix`.
3. Reload VS Code so the TensorFleet activity bar icon appears.

## Create a workspace

1. Open the folder where you want to work.
2. Press `Cmd/Ctrl+Shift+P` → **TensorFleet: Install Bundled Tools** to download the curated ROS 2, Gazebo, and mission assets.
3. Start a project:
   - Bottom **TensorFleet Tools** panel → **🚀 New Project**, or
   - Command palette → **TensorFleet: Create New Project**.
4. The scaffold includes `config/drone_config.yaml`, example missions, and launch files so the status bars and dashboards light up automatically.

## Operate from the dashboards

- **Open all panels**: `TensorFleet: Open All Dashboards` (or open individual Gazebo, QGroundControl, AI Ops, and ROS 2 panels from the sidebar).
- **Connect to ROS 2/PX4**: `TensorFleet: Connect to ROS2` and `TensorFleet: Start PX4 Telemetry Monitor`.
- **Visualize & teleop**: `TensorFleet: Open Image Panel (Option 3 - React)` and `TensorFleet: Open Teleops Panel (Option 3 - React)`.
- **Project-aware status bars**: the ROS version and drone status items appear when a TensorFleet project marker (e.g., `config/drone_config.yaml` or `src/main.py`) is present.

## AI + MCP (optional)

- Start the MCP server so AI assistants can drive panels and tools: `TensorFleet: Start MCP Server`.
- View configuration to point Cursor/Claude at the server: `TensorFleet: Show MCP Configuration`.
- Stop when you are done: `TensorFleet: Stop MCP Server`.

## Troubleshooting

- Check the **TensorFleet** output channel for messages like `TensorFleet MCP Bridge started`.
- If dashboards do not appear, verify you are inside a TensorFleet project (markers mentioned above) and reload the window.
- For ROS 2 connectivity, make sure the ROS environment is sourced before launching VS Code, or restart after sourcing.
