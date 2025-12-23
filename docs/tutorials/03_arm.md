---
id: 03_arm
title: "Tutorial 03: Arm / Disarm the Drone"
sidebar_label: "03: Arm / Disarm"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Tutorial 03: Arm / Disarm the Drone

## Overview

This tutorial demonstrates fundamental drone safety and control operations using MAVROS services. It showcases the use of our ROSLibBridgeWrapper and DroneController from tensorfleet-util to safely arm and disarm the drone, with proper state monitoring and error handling.

## Learning Objectives

- Utilize DroneController for high-level arm/disarm operations
- Monitor drone state changes during arming/disarming
- Understand MAVROS service calls
- Learn about basics of arming and disarming a drone
- Understand safety mechanisms that prevent unsafe disarming

## Key Concepts

- **MAVROS Services**: ROS service calls for drone control commands.
- **Arming State**: When armed, a drone's motors are on. When disarmed the motors are off and you cannot move the drone.
- **Service Calls**: Synchronous communication pattern that are used to execute code in other ROS nodes.
- **Safety Mechanisms**: Built-in protections against unsafe operations. For example shutting down the drone mid-air.
- **Automatic Transitions**: How requesting a takeoff can modify the vehicle's flight mode.
- **DroneController**: Our automatic utility that reads `DroneStateModel` and forwards ROS service calls based on our desired results.
- **ROS param sets**: Each ROS node can have specific service calls to set configuration parameters on it. we use this to configure heartbeat signal frequency and type on the mavros node.

## Prerequisites

- Active TensorFleet VM with MAVROS running
- Simulation restarted (as described in [Preparation](00_preparation.md))
- Understanding of connection and telemetry from [Tutorial 01](01_connection.md) and [Tutorial 02](02_telemetry.md)

## Running the Tutorial

After learning about connection and telemetry monitoring, this tutorial introduces drone control operations. The arm/disarm functionality is fundamental to safe drone operation and must be mastered before attempting flight control.

To run the arm/disarm tutorial, use the following bun command:

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```bash
bun run src/tutorials/03_arm.js
```

</TabItem>
<TabItem value="python" label="Python">

```bash
# Coming soon...
```

</TabItem>
</Tabs>

This will connect to the drone, Arm it if not armed and then disarm.
This will be done twice to demonstrate the difference between manually arming the drone or using our managed state.

## Expected Output Example
When running the tutorial, you should see output similar to the following:
<div style={{maxHeight: '400px', overflowY: 'auto'}}>

```
[INFO] Connected to ROS Bridge - initializing drone control...

[INFO] Waiting for drone state...
[INFO] Drone connected. Current state: armed=false, mode=STABILIZE

[INFO] Drone is currently disarmed. Arming...

[SUCCESS] Drone arm command sent successfully!
Waiting for arm confirmation...
[SUCCESS] Drone is now armed!

[INFO] Arming/Disarming operation completed successfully!

[EXIT] Disconnected from drone state monitoring.
```

</div>

## Understanding Arming

Arming a drone enables its motors and prepares it for flight. This is a critical safety mechanism that prevents accidental motor activation. The drone will only respond to flight commands when armed.
To arm the drone you need to make a service call to `/mavros/cmd/arming`. This is done by calling `DroneConroller.arm()` 

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
async mavrosArmDisarm(value: boolean): Promise<RosTypes.CommandBool_Response> {
    const req: RosTypes.CommandBool_Request = { value };
    return await this.ros2Bridge.callService<RosTypes.CommandBool_Response>("/mavros/cmd/arming", req);
}

async arm(): Promise<void> {
    await this._requireConnected();

    if (await this.model.isArmed()) {
        console.log("[DRONE_CONTROLLER] Drone already armed. Skipping arm command");
        return;
    }

    console.log("[DRONE_CONTROLLER] Sending arm command...");

    // Workaround. arm might fail due to unsupported state for arm.
    if (await this.model.isLanded()) {
        console.log("[DRONE_CONTROLLER] Is in landed state while trying to arm. Switching vehicle mode to AUTO.LOITER");
        await this.setMode("AUTO.LOITER");  
    }

    const result = await this.mavrosArmDisarm(true);
    console.log("[DRONE_CONTROLLER] Arm command result:", result);
}

async disarm(): Promise<void> {
    await this._requireConnected();
    console.log("[DRONE_CONTROLLER] Sending disarm command...");
    const result = await this.mavrosArmDisarm(false);
    console.log("[DRONE_CONTROLLER] Disarm command result:", result);
}
```

</TabItem>
<TabItem value="python" label="Python">

```bash
# Coming soon...
```

</TabItem>
</Tabs>

## Key Safety Concepts

### Manual vs Automatic Arming

**Manual Arming**: You explicitly call `droneController.arm()` before flight operations. It can fail if the drone is airborne.

**Automatic Arming**: You set your requested state. The `DroneController` internals will take care of any ongoing issues to arm or disarm the drone

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
// How to arm/disarm :
await droneController.requestAutoState({ kind: "landed", armed: true });

// Function signature
public async requestAutoState(state: TargetAutoState): Promise<void> { ... }

// TargetAutoState definition
export type TargetAutoState =
  | null
  | { kind: "landed"; armed: boolean | null } // Ask the drone to be landed. Either armed or disarmed.
  | { kind: "airborne"; altMeters: number; yawRad?: number } // Ask the drone to hold it's position at a specific altitude and angle.
  | { kind: "offboard"; target: OffboardTarget} // We will go over this in later tutorials.
```

</TabItem>
<TabItem value="python" label="Python">

```bash
# Coming soon...
```

</TabItem>
</Tabs>

in here, we set our target state to landed and armed or disarmed. If the drone is not landed then it is requested to be armed and the 'armed' condition will be omitted.
Our state manager will take care of handling all ROS service calls based on the current state of the drone. `requestAutoState` is an async function and will resolve when the state of the drone is in the desired state.


### When Drones Auto-Disarm

Drones typically disarm automatically after landing to prevent:
- Accidental motor activation on the ground
- Battery drain from idle motors
- Safety risks during handling

When you request `{ kind: "landed", armed: true }` you actually force the controller to keep the drone armed. This can be useful if you want a faster takeoff and response time.

## Safety Mechanisms

Flight controllers include multiple safety features:

- **Airborne Protection**: Cannot disarm while flying (prevents crashes)
- **Pre-Arm Checks**: Validates GPS, battery, sensors before arming. Even ground control connection will be validated here. We use mavros so we already configure mavros to act as the ground control for our drone. Had we not done that then the arm would fail. We do this by using ros param sets 
    - setting `/mavros/sys.heartbeat_mav_type` to `GCS`
    - setting `/mavros/sys.heartbeat_rate` to `2.0`
    
- **Emergency Protocols**: Automatic failsafe responses

## Code Walkthrough

### Setup Phase

```javascript
// Connect to ROS Bridge
const bridge = new ROSLibBridgeWrapper();
await bridge.waitForConnection();

// Monitor drone state
const droneState = new DroneStateModel();
droneState.connect(bridge);

// Control the drone
const droneController = new DroneController(droneState, bridge);
```

### Arming Operation

```javascript
// Check current state
const state = droneState.getState();
if (!state.vehicle?.armed) {
    // Arm the drone
    await droneController.arm();

    // Wait for confirmation using low-latency listener
    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Timeout")), 5000);

        // Listen for vehicle state changes (armed, mode, etc.)
        const unsubscribe = droneState.onSectionChange('vehicle', (oldVal, newVal) => {
            if (newVal.armed && !oldVal.armed) {
                clearTimeout(timeout);
                unsubscribe();
                resolve();
            }
        });
    });
}
```

### Low-Latency State Monitoring

Instead of polling every 100ms, this tutorial uses the new `onSectionChange()` API:

- **`onSectionChange(section, listener)`**: Registers a listener for changes in a specific state section
- **Immediate notifications**: Fires when ROS messages update state, not on a timer
- **Selective listening**: Only listens to relevant state sections (excludes time updates)
- **Automatic cleanup**: Listeners are unsubscribed when no longer needed

The code waits for state confirmation because:
- Commands are sent asynchronously
- Network delays may occur 
- Verifies the flight controller accepted the command
- Provides immediate feedback when we receive new states from mavros.

## Next Steps

Once you understand arming/disarming, you're ready for:
- Takeoff and landing operations
- Flight control commands
- Mission planning

## Important Safety Notes

- **Never attempt to disarm while airborne** - this will be rejected by safety mechanisms
- **Be aware of automatic disarming** after landing