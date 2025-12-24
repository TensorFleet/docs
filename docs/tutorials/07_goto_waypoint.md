---
id: 07_goto_waypoint
title: "Tutorial 07: Go to Waypoint"
sidebar_label: "07: Go to Waypoint"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Tutorial 07: Go to Waypoint

## Overview

This tutorial demonstrates going to a desired position using 
- Closed-loop `velocity_local` setpoint with positional feedback.
- `position_local` isntead of `velocity_local` to order the drone to go to a specific position. The flight controller will handle the accelerations. This is useful if you want to go towards a position that's far away so you keep going towards it, or if you want to hold at that position.


## Learning Objectives

- Calculate velocity vectors toward a target position
- Use proportional control for smooth approach
- Detect waypoint arrival within a radius

## Key Concepts

- **Closed-Loop Control**: Using sensor feedback to adjust outputs.
- **Proportional Control**: Velocity proportional to distance from target
- **Waypoint Navigation**: Moving to specific coordinates
- **Arrival Detection**: Determining when target is reached using a basic radius check

## Prerequisites

- Active TensorFleet VM with MAVROS running
- Simulation restarted (as described in [Preparation](00_preparation.md))
- Completed velocity control tutorial ([Tutorial 06](06_move_forward.md))

## Running the Tutorial

This tutorial navigates to a waypoint offset from the takeoff position, then lands.

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>
```bash
bun run src/tutorials/07_goto_waypoint.js
```
</TabItem>
<TabItem value="python" label="Python">

```bash
# Coming soon...
```

</TabItem>
</Tabs>

## Expected Output Example

<div style={{maxHeight: '400px', overflowY: 'auto'}}>
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
</div>

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


## Manual sequence, closed-loop control

In here we can see the closed loop running which directs the drone towards a desired point `target`.
We compute the distance from the target point. and the velocity in the direction of the target with the `Math.min(MAX_VELOCITY, distance * 0.5)` formula.
During each poll we perform a distance check. If we reach the target point we perform a zero velocity hover instead.

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>
```javascript
let setpointInterval = setInterval(async () => {
    // Continuously send OFFBOARD mode command
    await droneController.setMode("OFFBOARD", 0, false); // Silent mode setting

    if (!arrived) {
      // Get current position
      const currentState = await droneState.getState();
      const pos = currentState.local?.position;
      if (!pos) {
        console.log("Pose not defined");
        return;
      }

      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check if arrived at waypoint
      if (distance < WAYPOINT_RADIUS) {
        console.log("\n[NAV] Arrived at waypoint!\n");
        arrived = true;
        // Broadcast zero velocity to stop
        droneController.publishOffboardTarget({
          kind: "velocity_local",
          vx: 0.0,
          vy: 0.0,
          vz: 0.0
        });
        return;
      }

      // Calculate velocity (proportional control)
      const speed = Math.min(MAX_VELOCITY, distance * 0.5);
      const vx = (dx / distance) * speed;
      const vy = (dy / distance) * speed;

      // Broadcast velocity target
      droneController.publishOffboardTarget({
        kind: "velocity_local",
        vx: vx,
        vy: vy,
        vz: 0.0
      });

      // Log progress occasionally
      const now = Date.now();
      if (now - lastLogTime > 2000) {
        console.log(`[NAV] Distance to target: ${distance.toFixed(2)}m, velocity: (${vx.toFixed(2)}, ${vy.toFixed(2)})`);
        lastLogTime = now;
      }
    } else {
      // Already arrived, broadcast zero velocity
      droneController.publishOffboardTarget({
        kind: "velocity_local",
        vx: 0.0,
        vy: 0.0,
        vz: 0.0
      });
    }
  }, 50); // Broadcast at 20Hz as per PX4 requirements
```
</TabItem>
<TabItem value="python" label="Python">

```bash
# Coming soon...
```

</TabItem>
</Tabs>

## Automated sequence using `position_local`

We can also use the `position_local` setpoint type to ask the drone's autopilot to go to a specific point. It will handle the acceleration and deacceleration automatically. Keep in mind that our utility `DroneController` isn't doing this but the actual flight controller handles the acceleration.

If we pass a `position_local` to `publishOffboardTarget` during OFFBOARD the drone's flight controller will go towards the target point to hover at that point.
If the point is far enough, we can use it for "go towards" instead. In which case we let the flight controller choose which speed it wants to go with.

For an easier use we can call `requestAutoState` to handle the continous call of the `publishOffboardTarget`.


<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>
```javascript
await droneController.requestAutoState({
    kind: "offboard",
    target: {
      kind: "position_local",
      x: target.x,
      y: target.y,
      z: target.z
    }
  });
```
</TabItem>
<TabItem value="python" label="Python">

```bash
# Coming soon...
```

</TabItem>
</Tabs>