---
id: 07_goto_waypoint
title: "Tutorial 07: Go to Waypoint"
sidebar_label: "07: Go to Waypoint"
---

# Tutorial 07: Go to Waypoint

## Overview

This tutorial demonstrates closed-loop position control - navigating to a specific waypoint using position feedback. Unlike open-loop velocity control, this approach continuously adjusts velocity based on the drone's current position, enabling precise navigation.

## Learning Objectives

- Implement closed-loop position control
- Calculate velocity vectors toward a target position
- Use proportional control for smooth approach
- Detect waypoint arrival within a radius
- Understand the advantages of feedback control

## Key Concepts

- **Closed-Loop Control**: Using sensor feedback to adjust commands
- **Proportional Control**: Velocity proportional to distance from target
- **Waypoint Navigation**: Moving to specific coordinates
- **Arrival Detection**: Determining when target is reached

## Prerequisites

- Active TensorFleet VM with MAVROS running
- Simulation restarted (as described in [Preparation](00_preparation.md))
- Completed velocity control tutorial ([Tutorial 06](06_move_forward.md))

## Running the Tutorial

This tutorial navigates to a waypoint offset from the takeoff position, then lands.

```bash
bun run src/tutorials/07_goto_waypoint.js
```

## Expected Output Example

```
[INFO] Connected to ROS Bridge

[ARM] Sending arm command...
[ARM] Drone is now armed!

[TAKEOFF] Setting GUIDED mode...
[TAKEOFF] Sending takeoff command to 3m...
[TAKEOFF] Target altitude reached!

[WAYPOINT] Home: (0.05, -0.02)
[WAYPOINT] Target: (5.05, 4.98)

[OFFBOARD] Pre-streaming setpoints...
[OFFBOARD] OFFBOARD mode active!

[NAV] Navigating to waypoint...

[NAV] Distance to target: 7.07m
[NAV] Distance to target: 6.52m
[NAV] Distance to target: 5.89m
[NAV] Distance to target: 5.21m
[NAV] Distance to target: 4.48m
[NAV] Distance to target: 3.72m
[NAV] Distance to target: 2.95m
[NAV] Distance to target: 2.18m
[NAV] Distance to target: 1.42m
[NAV] Distance to target: 0.71m

[NAV] Arrived at waypoint!

[LAND] Sending land command...
[LAND] Drone has landed and disarmed!

[SUCCESS] Mission complete!
[EXIT] Closing connection...
```

## How It Works

The control loop continuously:
1. Reads current position from telemetry
2. Calculates distance and direction to target
3. Computes velocity command (proportional to distance)
4. Publishes velocity setpoint
5. Repeats until within arrival radius

```
┌──────────────────────────────────────────────────────────┐
│                 Closed-Loop Control                      │
│                                                          │
│   ┌─────────┐    ┌──────────┐    ┌─────────────────┐    │
│   │ Target  │───▶│ Calculate│───▶│ Velocity Command│    │
│   │ Position│    │ Error    │    │ (proportional)  │    │
│   └─────────┘    └──────────┘    └────────┬────────┘    │
│                       ▲                    │             │
│                       │                    ▼             │
│                  ┌────┴─────┐        ┌──────────┐       │
│                  │ Current  │◀───────│  Drone   │       │
│                  │ Position │        │          │       │
│                  └──────────┘        └──────────┘       │
└──────────────────────────────────────────────────────────┘
```

## Code Analysis

### Configuration

```javascript
const TARGET_ALTITUDE = 3.0;    // meters
const WAYPOINT_OFFSET_X = 5.0;  // meters forward
const WAYPOINT_OFFSET_Y = 5.0;  // meters right
const WAYPOINT_RADIUS = 1.0;    // arrival threshold
const MAX_VELOCITY = 2.0;       // m/s speed limit
const SETPOINT_HZ = 20;
```

### Recording Home and Calculating Target

```javascript
// Record home position after takeoff
const home = {
    x: telemetry.pose.pose.position.x,
    y: telemetry.pose.pose.position.y
};

// Calculate target position (offset from home)
const target = {
    x: home.x + WAYPOINT_OFFSET_X,
    y: home.y + WAYPOINT_OFFSET_Y
};

console.log(`[WAYPOINT] Home: (${home.x.toFixed(2)}, ${home.y.toFixed(2)})`);
console.log(`[WAYPOINT] Target: (${target.x.toFixed(2)}, ${target.y.toFixed(2)})`);
```

### Navigation Loop with Proportional Control

```javascript
let arrived = false;

while (!arrived) {
    // Get current position
    const pos = telemetry.pose.pose.position;
    
    // Calculate error (distance to target)
    const dx = target.x - pos.x;
    const dy = target.y - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    console.log(`[NAV] Distance to target: ${distance.toFixed(2)}m`);

    // Check arrival
    if (distance < WAYPOINT_RADIUS) {
        console.log("\n[NAV] Arrived at waypoint!\n");
        arrived = true;
        break;
    }

    // Proportional control: velocity proportional to distance
    // Speed = min(MAX_VELOCITY, distance * 0.5)
    const speed = Math.min(MAX_VELOCITY, distance * 0.5);
    
    // Unit vector toward target, scaled by speed
    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;

    // Publish velocity command
    const vel = new ROSLIB.Message({
        header: { frame_id: "map" },
        twist: {
            linear: { x: vx, y: vy, z: 0.0 },
            angular: { x: 0.0, y: 0.0, z: 0.0 }
        }
    });

    velPub.publish(vel);
    await sleep(intervalMs);
}
```

## Understanding Proportional Control

### The Control Law

```
velocity = K_p * error
```

Where:
- `velocity` = commanded speed
- `K_p` = proportional gain (0.5 in this tutorial)
- `error` = distance to target

### Behavior

| Distance | Calculated Speed | Actual Speed |
|----------|-----------------|--------------|
| 10m | 5.0 m/s | 2.0 m/s (capped) |
| 4m | 2.0 m/s | 2.0 m/s |
| 2m | 1.0 m/s | 1.0 m/s |
| 0.5m | 0.25 m/s | 0.25 m/s |

**Benefits:**
- Fast approach when far away
- Smooth deceleration near target
- No overshoot (if tuned correctly)

### Tuning Parameters

```javascript
// Aggressive (fast but may overshoot)
const speed = Math.min(3.0, distance * 1.0);

// Conservative (slow but precise)
const speed = Math.min(1.0, distance * 0.3);

// Default (balanced)
const speed = Math.min(2.0, distance * 0.5);
```

## Waypoint Arrival Detection

```javascript
const WAYPOINT_RADIUS = 1.0; // meters

if (distance < WAYPOINT_RADIUS) {
    arrived = true;
}
```

The arrival radius accounts for:
- Position sensor noise
- Control loop latency
- Acceptable positioning tolerance

**Smaller radius** = More precise but harder to achieve  
**Larger radius** = Easier to achieve but less precise

## Extending to Multiple Waypoints

```javascript
const waypoints = [
    { x: 5, y: 0 },
    { x: 5, y: 5 },
    { x: 0, y: 5 },
    { x: 0, y: 0 }  // Return to start
];

for (const waypoint of waypoints) {
    await navigateToWaypoint(waypoint);
    console.log(`Reached waypoint (${waypoint.x}, ${waypoint.y})`);
}
```

## Comparison: Open-Loop vs Closed-Loop

| Aspect | Open-Loop (Tutorial 06) | Closed-Loop (Tutorial 07) |
|--------|------------------------|---------------------------|
| Control | Time-based velocity | Position feedback |
| Precision | Low (drift accumulates) | High (corrects errors) |
| Complexity | Simple | Moderate |
| Use Case | Simple movements | Precise navigation |
| Handles Disturbances | No | Yes |

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Never arrives | Radius too small | Increase `WAYPOINT_RADIUS` |
| Overshoots | Gain too high | Reduce proportional gain |
| Oscillates | Gain too high | Reduce gain, add damping |
| Slow approach | Max velocity too low | Increase `MAX_VELOCITY` |
| Position jumps | Telemetry issues | Add position filtering |

## Next Steps

With waypoint navigation mastered, you can build:
- Multi-waypoint missions
- Path following algorithms
- Obstacle avoidance integration
- Mission planning systems

## Navigation

- **Previous**: [Tutorial 06: Move Forward](06_move_forward.md)
- **Next**: Explore [Robotics Examples](../robotics/00_overview.md) or build your own missions!

---

*Closed-loop control is the foundation of reliable autonomous navigation. The proportional control pattern demonstrated here extends to more sophisticated controllers (PID, MPC) used in production systems.*

