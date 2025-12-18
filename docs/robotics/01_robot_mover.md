---
id: 01_robot_mover
title: Robot Mover
sidebar_label: "01: Robot Mover"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Robot Mover: Basic Movement Control

This tutorial demonstrates basic robot movement using velocity commands over rosbridge. You'll learn how to publish `geometry_msgs/Twist` messages to control a ground robot.

## Overview

The robot mover script:
- Connects to rosbridge (via TensorFleet proxy or direct)
- Publishes velocity commands on `/cmd_vel_raw`
- Executes a movement sequence: forward, backward, turn left, turn right, stop

## Prerequisites

- Active TensorFleet VM with robot simulation
- Simulation View open in VS Code sidebar
- Dependencies installed (see [Overview](00_overview.md))

## Running the Script

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```bash
bun robot:mover
# or
bun src/robot_mover.js
```

</TabItem>
<TabItem value="python" label="Python">

```bash
uv run python src/robot_mover.py
# or
python src/robot_mover.py
```

</TabItem>
</Tabs>

## Expected Output

```
Connecting to rosbridge...
roslib connection established successfully.
Advertising Twist publisher on '/cmd_vel_raw' ...
Phase: forward (duration 3s, lin=0.2, ang=0)
Phase: stop after forward (duration 1s, lin=0, ang=0)
Phase: backward (duration 3s, lin=-0.2, ang=0)
Phase: stop after backward (duration 1s, lin=0, ang=0)
Phase: turn left (duration 2s, lin=0, ang=0.5)
Phase: stop after left turn (duration 1s, lin=0, ang=0)
Phase: turn right (duration 2s, lin=0, ang=-0.5)
Phase: final stop (duration 1s, lin=0, ang=0)
Movement sequence complete.
Connection closed.
```

## How It Works

### Connection Setup

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
require("dotenv").config();
const ROSLIB = require("roslib");
const { connectToRobot } = require("./lib/robotic_utils");

async function main() {
    const ros = await connectToRobot();
    console.log("roslib connection established successfully.");
    // ... movement code
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import os
import sys
from lib.robotic_utils import connect_to_robot

def main():
    client = connect_to_robot()
    print("roslibpy connection established successfully.")
    # ... movement code
```

</TabItem>
</Tabs>

The `connectToRobot()` / `connect_to_robot()` helper automatically:
- Uses TensorFleet proxy if `TENSORFLEET_BASE_URL` and `TENSORFLEET_JWT` are set
- Falls back to direct rosbridge connection otherwise

### Creating Velocity Messages

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
function makeTwist(linearX, angularZ) {
    return new ROSLIB.Message({
        linear: { x: linearX, y: 0.0, z: 0.0 },
        angular: { x: 0.0, y: 0.0, z: angularZ }
    });
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
def make_twist(linear_x: float, angular_z: float) -> dict:
    """Build a geometry_msgs/Twist-style message."""
    return {
        "linear": {"x": linear_x, "y": 0.0, "z": 0.0},
        "angular": {"x": 0.0, "y": 0.0, "z": angular_z},
    }
```

</TabItem>
</Tabs>

The `Twist` message has two vectors:
- **linear**: Forward/backward (`x`), left/right (`y`), up/down (`z`)
- **angular**: Roll (`x`), pitch (`y`), yaw (`z`)

For ground robots, we typically only use `linear.x` and `angular.z`.

### Publishing Velocity Commands

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
const CMD_VEL_TOPIC = "/cmd_vel_raw";

const cmdVel = new ROSLIB.Topic({
    ros,
    name: CMD_VEL_TOPIC,
    messageType: "geometry_msgs/Twist"
});

// Publish for a duration
function publishFor(ros, topic, ms, linearX, angularZ, label) {
    return new Promise((resolve) => {
        const intervalMs = 50;
        const endTime = Date.now() + ms;
        const msg = makeTwist(linearX, angularZ);

        console.log(`Phase: ${label} (duration ${ms / 1000}s)`);

        const timer = setInterval(() => {
            if (!ros.isConnected || Date.now() >= endTime) {
                clearInterval(timer);
                resolve();
                return;
            }
            topic.publish(msg);
        }, intervalMs);
    });
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import time
import roslibpy

CMD_VEL_TOPIC = "/cmd_vel_raw"

cmd_vel = roslibpy.Topic(client, CMD_VEL_TOPIC, "geometry_msgs/Twist")

def publish_for(client, topic, duration, linear_x, angular_z, label):
    """Publish velocity messages for a specified duration."""
    print(f"Phase: {label} (duration {duration}s)")
    end_time = time.time() + duration
    msg = make_twist(linear_x, angular_z)

    while client.is_connected and time.time() < end_time:
        topic.publish(msg)
        time.sleep(0.05)
```

</TabItem>
</Tabs>

Key points:
- Publish at ~20 Hz (every 50ms) for smooth control
- Check connection status before publishing
- Stop publishing when duration is reached

### Movement Sequence

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
async function runMovement(ros) {
    const cmdVel = new ROSLIB.Topic({
        ros,
        name: CMD_VEL_TOPIC,
        messageType: "geometry_msgs/Twist"
    });

    try {
        // Drive forward
        await publishFor(ros, cmdVel, 3000, LINEAR_SPEED, 0.0, "forward");
        await publishFor(ros, cmdVel, 1000, 0.0, 0.0, "stop");

        // Drive backward
        await publishFor(ros, cmdVel, 3000, -LINEAR_SPEED, 0.0, "backward");
        await publishFor(ros, cmdVel, 1000, 0.0, 0.0, "stop");

        // Turn left
        await publishFor(ros, cmdVel, 2000, 0.0, ANGULAR_SPEED, "turn left");
        await publishFor(ros, cmdVel, 1000, 0.0, 0.0, "stop");

        // Turn right
        await publishFor(ros, cmdVel, 2000, 0.0, -ANGULAR_SPEED, "turn right");
        await publishFor(ros, cmdVel, 1000, 0.0, 0.0, "final stop");

        console.log("Movement sequence complete.");
    } finally {
        cmdVel.unadvertise();
    }
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
def run_movement(client):
    """Execute the movement sequence."""
    cmd_vel = roslibpy.Topic(client, CMD_VEL_TOPIC, "geometry_msgs/Twist")

    try:
        # Drive forward
        publish_for(client, cmd_vel, 3.0, LINEAR_SPEED, 0.0, "forward")
        publish_for(client, cmd_vel, 1.0, 0.0, 0.0, "stop")

        # Drive backward
        publish_for(client, cmd_vel, 3.0, -LINEAR_SPEED, 0.0, "backward")
        publish_for(client, cmd_vel, 1.0, 0.0, 0.0, "stop")

        # Turn left
        publish_for(client, cmd_vel, 2.0, 0.0, ANGULAR_SPEED, "turn left")
        publish_for(client, cmd_vel, 1.0, 0.0, 0.0, "stop")

        # Turn right
        publish_for(client, cmd_vel, 2.0, 0.0, -ANGULAR_SPEED, "turn right")
        publish_for(client, cmd_vel, 1.0, 0.0, 0.0, "final stop")

        print("Movement sequence complete.")
    finally:
        cmd_vel.unadvertise()
```

</TabItem>
</Tabs>

## Configuration

Adjust speeds via environment variables or config file:

| Variable | Default | Description |
|----------|---------|-------------|
| `CMD_VEL_TOPIC` | `/cmd_vel_raw` | Velocity command topic |
| `LINEAR_SPEED` | `0.2` | Forward/backward speed (m/s) |
| `ANGULAR_SPEED` | `0.5` | Turning speed (rad/s) |

## Velocity Reference

| Movement | linear.x | angular.z |
|----------|----------|-----------|
| Forward | `+0.2` | `0` |
| Backward | `-0.2` | `0` |
| Turn Left | `0` | `+0.5` |
| Turn Right | `0` | `-0.5` |
| Forward + Turn | `+0.2` | `±0.3` |
| Stop | `0` | `0` |

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Robot doesn't move | Wrong topic | Check `CMD_VEL_TOPIC` matches your robot |
| Movement is jerky | Publish rate too low | Ensure 20 Hz publish rate |
| Connection fails | VM not running | Start VM from TensorFleet status bar |
| Robot moves wrong direction | Frame convention | Check robot's velocity frame |

## Next Steps

- [Obstacle Avoider](02_obstacle_avoider.md): Add LiDAR-based collision avoidance
- [Vision YOLO](03_vision_yolo.md): Add object detection

---

*The robot mover demonstrates the fundamental pattern for commanding robot movement. This same approach scales to more complex behaviors.*


