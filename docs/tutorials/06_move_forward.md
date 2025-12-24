---
id: 06_move_forward
title: "Tutorial 06: Move Forward"
sidebar_label: "06: Move Forward"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Tutorial 06: Move Forward

## Overview

This tutorial demonstrates the use of the velocity_local setpoint in OFFBOARD mode to move the drone in a single direction. This is very similar to [Offboard hover](05_offboard_hover.md) but the velocity will be non zero.

## Learning Objectives

- Use velocity setpoints in OFFBOARD mode for moving in a single direction.
- Use position setpoints in OFFBOARD mode for moving to a specific location.
- Stop movement by returning to zero velocity

## Key Concepts

- **velocity_local**: Commanding movement via velocity vectors in OFFBOARD mode
- **position_local**: Commanding movement to a local position in OFFBOARD mode

## Prerequisites

- Active TensorFleet VM with MAVROS running
- Simulation restarted (as described in [Preparation](00_preparation.md))
- Completed OFFBOARD hover tutorial ([Tutorial 05](05_offboard_hover.md))

## Running the Tutorial

This tutorial moves the drone forward for 5 seconds at 1 m/s, then lands.

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>
```bash
bun run src/tutorials/06_move_forward.js
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
</div>

## How It Works

### Coordinate system
In the `local` frame (North-East-Down) we have:
- **+X**: North
- **+Y**: East
- **+Z**: Down

So if you wanted to move up you would set the z element of the velocity to a negative value. Keep in mind that in the `velocity_local` coordinates, it doesn't matter which direction the dorne is facing. If it needs to rotate the autopilot has to take care of that.

### Manual sequence (With velocity control method)

We can have the drone move in a single direction by setting it's velocity. In this example we will be setting it to a constant value for a couple of seconds.
Keep in mind that it's also possible to use position_local for setpoint publication. But we will be using velocity for demonstration.

Example of movement stages :
```
Time:     0s -----> 5s -----> 6s
Velocity: 1 m/s    1 m/s    0 m/s
Action:   MOVE     MOVE     STOP
```

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
// Takeoff
await manualArmAndTakeoff(droneController, droneState, TARGET_ALTITUDE);

// Velocity setpoint
const moveStart = Date.now();
let setpointInterval = setInterval(async () => {
    // Continuously send OFFBOARD mode command
    await droneController.setMode("OFFBOARD", 0, false); // Silent mode setting

    // Broadcast forward velocity target
    droneController.publishOffboardTarget({
        kind: "velocity_local",
        vx: FORWARD_VELOCITY,
        vy: 0.0,
        vz: 0.0
});
}, 50); // Broadcast at 20Hz as per PX4 requirements

// Wait for OFFBOARD mode to be active
while (!(await droneState.isOffboard())) {
    console.log("[STEP 2] Waiting for OFFBOARD mode to activate...");
    await sleep(500);
}


// Step 3: Maintain forward movement for specified duration


await sleep(MOVE_DURATION * 1000);


// Change the velocity setpoint to start hovering in OFFBOARD mode
// Zero velocity in offboard mode is only useful if we want to change the velocity again, otherwise it's best to switch to a hold position like "AUTO.LOITER"
clearInterval(setpointInterval);
setpointInterval = setInterval(async () => {
    // Continuously send OFFBOARD mode command
    await droneController.setMode("OFFBOARD", 0, false); // Silent mode setting

    // Broadcast zero velocity target to stop
    droneController.publishOffboardTarget({
        kind: "velocity_local",
        vx: 0.0,
        vy: 0.0,
        vz: 0.0
    });
}, 50);
```

</TabItem>
<TabItem value="python" label="Python">

```bash
# Coming soon...
```

</TabItem>
</Tabs>

### Automated sequence

For the automated sequence we will be doing something similar to the manual sequence but we will use the target states and await (if we want to wait)

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
// Arm and takeoff and hold altitude.
await droneController.requestAutoState({
    kind: "airborne",
    altMeters: TARGET_ALTITUDE
});

// Set velocity. don't wait.
droneController.requestAutoState({
kind: "offboard",
target: {
    kind: "velocity_local",
    vx: -FORWARD_VELOCITY,
    vy: 0.0,
    vz: 0.0
}
});

// Wait a while
await sleep(MOVE_DURATION*1000);

// Switch to hold position
await droneController.requestAutoState({
kind: "airborne",
altMeters: TARGET_ALTITUDE
});

// Wait
await sleep(2000);

// Land
await droneController.requestAutoState({
kind: "landed",
armed: false
});
```

</TabItem>
<TabItem value="python" label="Python">

```bash
# Coming soon...
```

</TabItem>
</Tabs>