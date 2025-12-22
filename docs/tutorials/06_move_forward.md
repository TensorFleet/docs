---
id: 06_move_forward
title: "Tutorial 06: Move Forward"
sidebar_label: "06: Move Forward"
---

# Tutorial 06: Move Forward

## Overview

This tutorial demonstrates velocity-based movement control in OFFBOARD mode. You'll learn how to command the drone to move forward using timed velocity commands - a fundamental building block for autonomous navigation.

## Learning Objectives

- Command forward velocity in OFFBOARD mode
- Understand time-based open-loop control
- Calculate expected travel distance from velocity and time
- Stop movement by returning to zero velocity
- Understand the limitations of open-loop control

## Key Concepts

- **Velocity Control**: Commanding movement via velocity vectors
- **Open-Loop Control**: Time-based movement without position feedback
- **Body vs World Frame**: Velocity reference frames
- **Movement Phases**: Accelerate, cruise, decelerate, stop

## Prerequisites

- Active TensorFleet VM with MAVROS running
- Simulation restarted (as described in [Preparation](00_preparation.md))
- Completed OFFBOARD hover tutorial ([Tutorial 05](05_offboard_hover.md))

## Running the Tutorial

This tutorial moves the drone forward for 5 seconds at 1 m/s, then lands.

```bash
bun run src/tutorials/06_move_forward.js
```

## Expected Output Example

```
[INFO] Connected to ROS Bridge

[ARM] Sending arm command...
[ARM] Drone is now armed!

[TAKEOFF] Setting GUIDED mode...
[TAKEOFF] Sending takeoff command to 3m...
[TAKEOFF] Target altitude reached!

[OFFBOARD] Pre-streaming setpoints...
[OFFBOARD] OFFBOARD mode active!

[MOVE] Moving forward at 1 m/s for 5s
[MOVE] Expected distance: ~5 meters

[MOVE] Stopping...

[MOVE] Movement complete

[LAND] Sending land command...
[LAND] Drone has landed and disarmed!

[SUCCESS] Mission complete!
[EXIT] Closing connection...
```

## How It Works

The tutorial uses simple velocity commands to move forward:

```
Time:     0s -----> 5s -----> 6s
Velocity: 1 m/s    1 m/s    0 m/s
Action:   MOVE     MOVE     STOP
```

## Code Analysis

### Configuration

```javascript
const TARGET_ALTITUDE = 3.0;   // meters
const FORWARD_VELOCITY = 1.0;  // m/s
const MOVE_DURATION = 5.0;     // seconds
const SETPOINT_HZ = 20;
```

### Creating Forward Velocity Message

```javascript
const forwardVel = new ROSLIB.Message({
    header: { frame_id: "map" },
    twist: {
        linear: { x: FORWARD_VELOCITY, y: 0.0, z: 0.0 },
        angular: { x: 0.0, y: 0.0, z: 0.0 }
    }
});
```

The velocity vector:
- `x: 1.0` - Move forward at 1 m/s
- `y: 0.0` - No lateral movement
- `z: 0.0` - Maintain altitude

### Movement Loop

```javascript
console.log(`[MOVE] Moving forward at ${FORWARD_VELOCITY} m/s for ${MOVE_DURATION}s`);
console.log(`[MOVE] Expected distance: ~${FORWARD_VELOCITY * MOVE_DURATION} meters`);

const endTime = Date.now() + MOVE_DURATION * 1000;
const intervalMs = 1000 / SETPOINT_HZ;

while (Date.now() < endTime) {
    velPub.publish(forwardVel);
    await sleep(intervalMs);
}
```

### Stopping

```javascript
console.log("[MOVE] Stopping...\n");
const zeroVel = new ROSLIB.Message({
    header: { frame_id: "map" },
    twist: {
        linear: { x: 0.0, y: 0.0, z: 0.0 },
        angular: { x: 0.0, y: 0.0, z: 0.0 }
    }
});

// Stream zero velocity for 1 second to ensure stop
for (let i = 0; i < SETPOINT_HZ; i++) {
    velPub.publish(zeroVel);
    await sleep(intervalMs);
}
```

## Understanding Velocity Control

### Coordinate System (ENU)

In the `map` frame (East-North-Up):
- **+X**: East (forward in default heading)
- **+Y**: North (left)
- **+Z**: Up

### Velocity Components

| Component | Direction | Example |
|-----------|-----------|---------|
| `linear.x` | Forward/Backward | `1.0` = forward, `-1.0` = backward |
| `linear.y` | Left/Right | `1.0` = left, `-1.0` = right |
| `linear.z` | Up/Down | `1.0` = up, `-1.0` = down |
| `angular.z` | Yaw rotation | `0.5` = turn left, `-0.5` = turn right |

### Example Velocity Commands

```javascript
// Move forward
{ linear: { x: 1.0, y: 0.0, z: 0.0 } }

// Move backward
{ linear: { x: -1.0, y: 0.0, z: 0.0 } }

// Strafe left
{ linear: { x: 0.0, y: 1.0, z: 0.0 } }

// Ascend
{ linear: { x: 0.0, y: 0.0, z: 0.5 } }

// Move forward while turning right
{ linear: { x: 1.0, y: 0.0, z: 0.0 }, angular: { z: -0.3 } }
```

## Open-Loop vs Closed-Loop Control

This tutorial uses **open-loop control**:
- Command velocity for a set time
- No position feedback
- Actual distance may vary due to wind, drift, response time

**Limitations:**
- Cannot guarantee exact position
- Drift accumulates over time
- No obstacle awareness

**When to use:**
- Simple movement tests
- When approximate positioning is acceptable
- As building blocks for more complex control

The next tutorial introduces **closed-loop control** with position feedback.

## Experimenting

Try modifying the constants:

```javascript
// Slower, shorter movement
const FORWARD_VELOCITY = 0.5;  // m/s
const MOVE_DURATION = 3.0;     // seconds

// Faster, longer movement
const FORWARD_VELOCITY = 2.0;  // m/s
const MOVE_DURATION = 10.0;    // seconds
```

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Drone doesn't move | Still in hover mode | Verify OFFBOARD is active |
| Movement is diagonal | Heading not aligned | Use body frame or align yaw first |
| Drone overshoots stop | Momentum | Stream zero velocity longer |
| Altitude changes | Wind/disturbance | Normal - altitude hold maintains approximate height |

## Next Steps

Open-loop velocity control is useful but limited. Next, learn:
- Position-based waypoint navigation
- Closed-loop control with feedback
- Precise positioning using local coordinates

## Navigation

- **Previous**: [Tutorial 05: OFFBOARD Hover](05_offboard_hover.md)
- **Next**: [Tutorial 07: Go to Waypoint](07_goto_waypoint.md)

---

*Velocity control is the foundation of drone movement. Understanding this enables building any autonomous behavior from simple patterns to complex missions.*
