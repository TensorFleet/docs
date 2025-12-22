---
id: 05_offboard_hover
title: "Tutorial 05: OFFBOARD Hover"
sidebar_label: "05: OFFBOARD Hover"
---

# Tutorial 05: OFFBOARD Hover

## Overview

This tutorial introduces OFFBOARD mode - the foundation of programmatic drone control. You'll learn how to enter OFFBOARD mode and maintain a stable hover by streaming velocity setpoints. This is essential for any custom flight behavior beyond basic autonomous commands.

## Learning Objectives

- Understand OFFBOARD mode requirements and safety
- Stream velocity setpoints at the required rate
- Enter and maintain OFFBOARD mode
- Hover in place using zero velocity commands
- Safely exit OFFBOARD mode and land

## Key Concepts

- **OFFBOARD Mode**: External computer control mode for custom flight behavior
- **Setpoint Streaming**: Continuous command stream required to maintain OFFBOARD
- **Velocity Control**: Commanding drone movement via velocity vectors
- **Setpoint Rate**: Minimum frequency required (typically 10-20 Hz)

## Prerequisites

- Active TensorFleet VM with MAVROS running
- Simulation restarted (as described in [Preparation](00_preparation.md))
- Completed takeoff/land tutorial ([Tutorial 04](04_takeoff_land.md))

## Running the Tutorial

This tutorial demonstrates OFFBOARD mode basics. The drone will takeoff, enter OFFBOARD, hover for 10 seconds, then land.

```bash
bun run src/tutorials/05_offboard_hover.js
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
[OFFBOARD] Setting OFFBOARD mode...
[OFFBOARD] OFFBOARD mode active!

[HOVER] Hovering in OFFBOARD for 10s...
[HOVER] Streaming zero velocities to maintain position

[HOVER] Hover complete

[LAND] Sending land command...
[LAND] Drone has landed and disarmed!

[SUCCESS] Mission complete!
[EXIT] Closing connection...
```

## How It Works

OFFBOARD mode requires continuous setpoint streaming. The flight controller will reject OFFBOARD mode or fall back to a failsafe if setpoints stop arriving.

### The OFFBOARD Flow

```
┌─────────────────────────────────────────────────────────┐
│                    OFFBOARD Flow                        │
├─────────────────────────────────────────────────────────┤
│  1. Start streaming setpoints (before mode switch)      │
│  2. Request OFFBOARD mode                               │
│  3. Continue streaming at required rate (20 Hz)         │
│  4. When done: switch to AUTO.LAND or other mode        │
└─────────────────────────────────────────────────────────┘
```

## Code Analysis

### Creating the Velocity Publisher

```javascript
const velPub = new ROSLIB.Topic({
    ros,
    name: "/mavros/setpoint_velocity/cmd_vel",
    messageType: "geometry_msgs/TwistStamped"
});
```

The velocity setpoint topic accepts `TwistStamped` messages with linear and angular velocity components.

### Entering OFFBOARD Mode

```javascript
const SETPOINT_HZ = 20;

// Enter OFFBOARD mode (starts pre-streaming internally)
await enterOffboard(ros, velPub, SETPOINT_HZ);
```

The `enterOffboard` utility:
1. Pre-streams setpoints for ~2 seconds (required before mode switch)
2. Requests OFFBOARD mode via `/mavros/set_mode` service
3. Verifies mode switch was successful

### Hovering with Zero Velocity

```javascript
const HOVER_DURATION = 10.0; // seconds

const zeroVel = new ROSLIB.Message({
    header: { frame_id: "map" },
    twist: {
        linear: { x: 0.0, y: 0.0, z: 0.0 },
        angular: { x: 0.0, y: 0.0, z: 0.0 }
    }
});

const endTime = Date.now() + HOVER_DURATION * 1000;
const intervalMs = 1000 / SETPOINT_HZ;

while (Date.now() < endTime) {
    velPub.publish(zeroVel);
    await sleep(intervalMs);
}
```

Key points:
- **Zero velocity = hover**: The drone maintains position when all velocity components are zero
- **Continuous streaming**: Must publish at `SETPOINT_HZ` rate throughout OFFBOARD
- **Frame ID**: Using `map` frame for world-relative velocities

## Velocity Setpoint Structure

```javascript
{
    header: { frame_id: "map" },
    twist: {
        linear: {
            x: 0.0,  // Forward/backward (m/s)
            y: 0.0,  // Left/right (m/s)
            z: 0.0   // Up/down (m/s)
        },
        angular: {
            x: 0.0,  // Roll rate (rad/s)
            y: 0.0,  // Pitch rate (rad/s)
            z: 0.0   // Yaw rate (rad/s)
        }
    }
}
```

## OFFBOARD Safety

### Failsafe Behavior

If setpoint streaming stops:
1. Flight controller detects timeout (~0.5s)
2. Automatically exits OFFBOARD mode
3. Falls back to position hold or RTL (configurable)

### Best Practices

- **Pre-stream before mode switch**: Always start streaming before requesting OFFBOARD
- **Maintain stream rate**: Never let setpoint rate drop below 10 Hz
- **Clean exit**: Switch to AUTO.LAND rather than stopping setpoints abruptly
- **Monitor mode**: Watch for unexpected mode changes indicating failsafe

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| OFFBOARD rejected | No pre-streaming | Stream setpoints for 2s before mode switch |
| Mode falls back | Stream too slow | Increase setpoint rate to 20 Hz |
| Drone drifts | GPS/position error | Normal behavior - use position control for precision |
| Jerky movement | Rate too low | Ensure consistent timing between publishes |

## Next Steps

Now that you can maintain OFFBOARD hover, you're ready to:
- Command forward movement with velocity control
- Navigate to waypoints with position feedback
- Build complex autonomous behaviors

## Navigation

- **Previous**: [Tutorial 04: Takeoff and Land](04_takeoff_land.md)
- **Next**: [Tutorial 06: Move Forward](06_move_forward.md)

---

*OFFBOARD mode is the gateway to custom drone behavior. Master the setpoint streaming pattern before attempting movement commands.*
