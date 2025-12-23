---
id: 04_takeoff_land
title: "Tutorial 04: Takeoff and Land"
sidebar_label: "04: Takeoff & Land"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Tutorial 04: Takeoff and Land

## Overview

This tutorial demonstrates fundamental drone flight operations using MAVROS commands. It covers the complete flight cycle: arming, takeoff to a target altitude, hovering, and landing with automatic disarm detection.
A similar example is also available in the [Offboard hover](05_offbord_hover.md)) example Where we do the same thing but in the manual offbord flight mode.

## Learning Objectives

- Send takeoff command command via MAVROS
- Monitor altitude during takeoff sequence
- Execute landing sequence manually.
- Detect automatic disarm after landing.
- Use our automated controller to handle takeoff/land automatically.

## Prerequisites

- Active TensorFleet VM with MAVROS running
- Simulation restarted (as described in [Preparation](00_preparation.md))
- Understanding of connection, telemetry, and arming from previous tutorials

## Running the Tutorial

After mastering arming/disarming, this tutorial introduces the complete flight cycle. The script handles all necessary steps automatically.

To run the takeoff and land tutorial:

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```bash
bun run src/tutorials/04_takeoff_land.js
```

</TabItem>
<TabItem value="python" label="Python">

```bash
# Coming soon...
```

</TabItem>
</Tabs>

## Expected Output Example

When running the tutorial, you should see output similar to:

<div style={{maxHeight: '400px', overflowY: 'auto'}}>
```
[INFO] Connected to ROS Bridge
[INFO] Target altitude: 3m

[INFO] Drone is not armed. Arming...
[ARM] Sending arm command...
[ARM] Arm command sent successfully
[ARM] Waiting for arm confirmation...
[ARM] Drone is now armed!

[TAKEOFF] Setting GUIDED mode...
[TAKEOFF] GUIDED mode set
[TAKEOFF] Sending takeoff command to 3m...
[TAKEOFF] Takeoff command sent
[TAKEOFF] Monitoring altitude...
[TAKEOFF] Current altitude: 0.5m / 3.0m
[TAKEOFF] Current altitude: 1.2m / 3.0m
[TAKEOFF] Current altitude: 2.1m / 3.0m
[TAKEOFF] Current altitude: 2.8m / 3.0m
[TAKEOFF] Target altitude reached!

[SUCCESS] Takeoff complete! Drone is hovering at altitude.
[INFO] Drone will remain in AUTO.LOITER mode.
[INFO] Waiting 2 seconds before landing...

[INFO] Landing drone...
[LAND] Sending land command...
[LAND] Land command sent
[LAND] Monitoring descent...
[LAND] Current altitude: 2.5m
[LAND] Current altitude: 1.8m
[LAND] Current altitude: 0.9m
[LAND] Current altitude: 0.2m
[LAND] Waiting for disarm...
[LAND] Drone has landed and disarmed!

[SUCCESS] Drone has landed and disarmed!
[EXIT] Closing connection...
```
</div>


## How It Works

The tutorial demonstrates a complete autonomous flight cycle:

1. **Connection**: Establish ROS Bridge connection and wait for telemetry
2. **Arming**: Automatically arm the drone if not already armed
3. **Takeoff**: Set GUIDED mode and send takeoff command
4. **Altitude Hold**: Monitor altitude until target is reached
5. **Landing**: Send land command and monitor descent
6. **Disarm**: Wait for automatic disarm after landing

### MAVLink commands
Mavlink has generic endpoints to send commands to our drone. with optional or mandetory param fields. We usually use [COMMAND_LONG](https://mavlink.io/en/messages/common.html#COMMAND_LONG) to send various commands including the [takeoff command](https://mavlink.io/en/messages/common.html#MAV_CMD_NAV_TAKEOFF). As it wouldn't be very helpful to try to compose these commands manually every time we provide the utility `DroneController.takeoff(altitude)` function to compose and send it.

For landing we can also use the [land command](https://mavlink.io/en/messages/common.html#MAV_CMD_NAV_LAND) or just use the `/mavros/cmd/land` service call.

## Manual takeoff

For the manual takeoff, first we ensure that the drone is armed. After that we call the `takeoff` function which sends the takeoff command. After that we have to wait for the drone to be armed and in the `AUTO.LOITER`. However this is bug prone. so instead we check whether the drone is taking off, landing or in a landed state. If all of these three conditions are false whil the drone is armed `droneState.isArmed()` returns `true`.

When we know we're done taking off we can use the `/mavros/cmd/land` service call to land. This service call is accessible through `DroneController.land()`

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
// First we arm the drone.

// while state.vehicle?.armed is false
while(!await droneState.isArmed()) {
    console.log("[INFO] Drone is not armed. Arming...\n");

    // Arm the drone using DroneController
    
    await droneController.arm();
    console.log("Waiting for arm confirmation...");

    // Use low-latency selective change listener for immediate notification
    await sleep(1500);
}

console.log("[INFO] Manual drone arm check finished\n");

// Takeoff
console.log("[INFO] Initiating takeoff...");
await droneController.takeoff(TARGET_ALTITUDE);

console.log("[INFO] Takeoff command sent, waiting for altitude...");

// This is a combined check. It checks if the drone is armed and is neither landed, landing or taking off.
// Why is this needed? "AUTO.LOITER" flight mode is possible while being on ground.
// We also have a delayed state. So when you send the takeoff request, there is no guarantee that the state we have will reflect that.
while(!await droneState.isAirborne()) {
    console.log("[INFO] waiting for takeoff to finish...");
    await sleep(1500);
}

currentState = await droneState.getState();

console.log(`[INFO] Takeoff sequence finished. armed=${currentState.vehicle.armed}, mode=${currentState.vehicle.mode}, landed=${currentState.extended?.landed_state}\n`);

const relAlt = currentState.altitude?.relative || 0;

console.log("[INFO] Altitude :", relAlt);

console.log("\n[SUCCESS] Takeoff complete! Drone is hovering at altitude.");
```

</TabItem>
<TabItem value="python" label="Python">

```bash
# Coming soon...
```

</TabItem>
</Tabs>

## Automaic takeoff
Using our automatic state manager by passing an `"airborne"` mode to `DroneController.requestAutoState` the drone will automatically arm and takeoff to the target altitude. Then it will hold it's position.
After that we can use landed states available in [Tutorial 03: Arm/Disarm](03_arm.md) to land the drone. `DroneController.requestAutoState` is async so we can evenuse `await` to make sure the operation is fully completed and we aren't in the process of taking off or landing before we execute later stages.

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
// Takeoff
await droneController.requestAutoState({ kind: "airborne", altMeters: TARGET_ALTITUDE });

await sleep(5000);

// Land
await droneController.requestAutoState({ kind: "landed", armed: false });
```

</TabItem>
<TabItem value="python" label="Python">

```bash
# Coming soon...
```

</TabItem>
</Tabs>

## Next Steps

After mastering takeoff and landing, you're ready for:
- OFFBOARD mode and velocity control
- Waypoint navigation
- Mission planning