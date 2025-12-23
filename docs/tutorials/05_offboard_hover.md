---
id: 05_offboard_hover
title: "Tutorial 05: OFFBOARD Hover"
sidebar_label: "05: OFFBOARD Hover"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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
- **Setpoint Streaming**: Continuous command stream required to enter and maintain OFFBOARD
- **Velocity Control**: Commanding drone movement via velocity vectors
- **Setpoint Rate**: Minimum frequency required (typically 2Hz)

## Prerequisites

- Active TensorFleet VM with MAVROS running
- Simulation restarted (as described in [Preparation](00_preparation.md))
- Completed takeoff/land tutorial ([Tutorial 04](04_takeoff_land.md))

## Running the Tutorial

This tutorial demonstrates OFFBOARD mode basics. The drone will takeoff, enter OFFBOARD, hover for 10 seconds, then land.

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```bash
bun run src/tutorials/05_offboard_hover.js
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
</div>

## How It Works

OFFBOARD mode requires continuous setpoint streaming. The flight controller will reject OFFBOARD mode or fall back to a failsafe if setpoints stop arriving.
Also, You will need to start the setpoint streams even before you try to enter OFFBOARD mode.

### The OFFBOARD Flow

Steps of a common offboard flow :

1. Start streaming setpoints (before mode switch)
2. Request OFFBOARD mode
3. Continue streaming at required rate (20 Hz)
4. When done: switch to AUTO.LAND or other mode

However we can simplify this by always requesting to enter offbord mode :

1. start sending setpoint AND set mode.
2. wait till offbord mode is detected.
3. Continue streaming at required rate (20 Hz)
4. When done: switch to AUTO.LAND or other mode

### `OffboardTarget`
This is the type we have defined to describe the setpoint type that we pass to the publication function. We publish the point on the ROS topic which [mavros has subscribed to](https://wiki.ros.org/mavros#Subscribed_Topics). Then mavros will forward it with mavlink commands.

The main topics which we can publish to are 
- `/mavros/setpoint_position/local` : Position + yaw
- `/mavros/setpoint_velocity/cmd_vel` : Velocity + yaw rate
- `/mavros/setpoint_raw/attitude` : Attitude (orientation) + thrust

There are also other topics which we won't be using.

The code below shows the definition of `OffboardTarget` and it's usage.

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
export type TargetAutoState =
  | null
  | { kind: "landed"; armed: boolean | null }
  | { kind: "airborne"; altMeters: number; yawRad?: number }
  | { kind: "offboard"; target: OffboardTarget}

export type OffboardTarget =
  | { kind: "position_local"; x: number; y: number; z: number; yawRad?: number }
  | { kind: "velocity_local"; vx: number; vy: number; vz: number; yawRate?: number }
  | {
      kind: "raw_local";
      coordinate_frame: number;
      type_mask: number;
      position?: { x: number; y: number; z: number };
      velocity?: { x: number; y: number; z: number };
      acceleration_or_force?: { x: number; y: number; z: number };
      yaw?: number;
      yaw_rate?: number;
    }
  | {
      kind: "raw_attitude";
      type_mask: number;
      orientation?: { x: number; y: number; z: number; w: number };
      body_rate?: { x: number; y: number; z: number };
      thrust?: number;
    }

// Manual Usage :
droneController.publishOffboardTarget({
    kind: "velocity_local",
    vx: 0.0,
    vy: 0.0,
    vz: 0.0
});


// Automated state manager target (await behavior depends on target type) :
await droneController.requestAutoState({
    kind: "offboard",
    target: {
    kind: "velocity_local",
    vx: 0.0,
    vy: 0.0,
    vz: 0.0
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

### Manual offboard hover

First we arm the drone and takeoff. After that's done we follow the simplified offboard flow. by using `setInterval` with a 20hz frequency.
Inside we call `droneController.setMode` which internally uses the `/mavros/set_mode` service call to request the manual change the flight mode of the drone.

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
let setpointInterval = setInterval(async () => {
    // Continuously send OFFBOARD mode command
    await droneController.setMode("OFFBOARD", 0, false); // Silent mode setting

    // Broadcast zero velocity target
    droneController.publishOffboardTarget({
        kind: "velocity_local",
        vx: 0.0,
        vy: 0.0,
        vz: 0.0
    });
}, 50); // Broadcast at 20Hz as per PX4 requirements

// Wait for OFFBOARD mode to be active
while (!(await droneState.isOffboard())) {
    console.log("[STEP 2] Waiting for OFFBOARD mode to activate...");
    await sleep(500);
}

// Now we just wait till we want to stop the setpointInterval and land.
```

</TabItem>
<TabItem value="python" label="Python">

```bash
# Coming soon...
```

</TabItem>
</Tabs>

### Automated offbord hover

If we leverage the automated state manager, most of the boilerplate is hidden and we just neet to set the target using `requestAutoState` to an offboard target type.

We don't even need to handle the arm manually. It's handled automatically by `DroneController`.

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript

// Step 1 : We put the drone mid air in `AUTO.LOITER` mode.
await droneController.requestAutoState({ kind: "airborne", altMeters: 6.0 });

// Step 2: Enter OFFBOARD mode by setting zero velocity target (hover)
console.log("[STEP 2] Entering OFFBOARD mode with zero velocity (hover)...");
await droneController.requestAutoState({
    kind: "offboard",
    target: {
        kind: "velocity_local",
        vx: 0.0,
        vy: 0.0,
        vz: 0.0
    }
});

// Drone will stay in offboard mode with continuous zero velocity setpoints until we change the auto state target. 
```

</TabItem>
<TabItem value="python" label="Python">

```bash
# Coming soon...
```

</TabItem>
</Tabs>

## OFFBOARD Safety

### Failsafe Behavior

If setpoint streaming stops:
1. Flight controller detects timeout (~0.5s)
2. Automatically exits `OFFBOARD` mode and enters `POSCTL` mode. And because manual drone controls are not sent for `POSCTL` drone will automatically land for safety reasons.

### Best Practices

- **Pre-stream before mode switch**: Always start streaming before requesting OFFBOARD
- **Maintain stream rate**: Never let setpoint rate drop below 10 Hz
- **Clean exit**: Switch to `AUTO.LOITER` rather than stopping setpoints abruptly
- **Monitor mode**: Watch for unexpected mode changes indicating failsafe

## Next Steps

Now that you can maintain OFFBOARD hover, you're ready to:
- Command forward movement with velocity control or target position requests.
- Navigate to waypoints with position feedback