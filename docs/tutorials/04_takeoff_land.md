---
id: 04_takeoff_land
title: "Tutorial 04: Takeoff and Land"
sidebar_label: "04: Takeoff & Land"
---

# Tutorial 04: Takeoff and Land

## Overview

This tutorial demonstrates fundamental drone flight operations using MAVROS commands. It covers the complete flight cycle: arming, takeoff to a target altitude, hovering, and landing with automatic disarm detection.

## Learning Objectives

- Send MAV_CMD_NAV_TAKEOFF command via MAVROS
- Set GUIDED mode before takeoff (required)
- Monitor altitude during takeoff sequence
- Execute landing sequence with AUTO.LAND mode
- Detect automatic disarm after landing

## Key Concepts

- **MAV Commands**: MAVLink protocol commands for drone control
- **GUIDED Mode**: Flight mode required for autonomous takeoff
- **Altitude Monitoring**: Tracking relative altitude during flight
- **Auto-Disarm**: Automatic motor disarm after landing detection

## Prerequisites

- Active TensorFleet VM with MAVROS running
- Simulation restarted (as described in [Preparation](00_preparation.md))
- Understanding of connection, telemetry, and arming from previous tutorials

## Running the Tutorial

After mastering arming/disarming, this tutorial introduces the complete flight cycle. The script handles all necessary steps automatically.

To run the takeoff and land tutorial:

```bash
bun run src/tutorials/04_takeoff_land.js
```

## Expected Output Example

When running the tutorial, you should see output similar to:

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

## How It Works

The tutorial demonstrates a complete autonomous flight cycle:

1. **Connection**: Establish ROS Bridge connection and wait for telemetry
2. **Arming**: Automatically arm the drone if not already armed
3. **Takeoff**: Set GUIDED mode and send takeoff command
4. **Altitude Hold**: Monitor altitude until target is reached
5. **Landing**: Send land command and monitor descent
6. **Disarm**: Wait for automatic disarm after landing

## Code Analysis

### Setup and Auto-Arm

```javascript
const ros = await connectToDrone(rosbridgeUrl);
const { telemetry } = await waitForTelemetry(ros);

// Arm if not already armed
if (!telemetry.state.armed) {
    console.log("[INFO] Drone is not armed. Arming...\n");
    await armDrone(ros, telemetry);
} else {
    console.log("[INFO] Drone already armed");
}
```

The script automatically handles arming if the drone isn't already armed.

### Takeoff Sequence

```javascript
const TARGET_ALTITUDE = 3.0; // meters

await takeoffToAlt(ros, telemetry, TARGET_ALTITUDE);
```

The `takeoffToAlt` utility:
1. Sets GUIDED mode (required for autonomous takeoff)
2. Sends MAV_CMD_NAV_TAKEOFF command
3. Monitors altitude until target is reached
4. Transitions to AUTO.LOITER for stable hover

### Landing Sequence

```javascript
await landDrone(ros, telemetry);
```

The `landDrone` utility:
1. Sends MAV_CMD_NAV_LAND command
2. Monitors altitude during descent
3. Waits for automatic disarm confirmation

## Flight Modes During Tutorial

| Phase | Mode | Description |
|-------|------|-------------|
| Pre-flight | STABILIZE | Default ground mode |
| Takeoff | GUIDED | Autonomous takeoff mode |
| Hover | AUTO.LOITER | Position hold after takeoff |
| Landing | AUTO.LAND | Autonomous landing mode |
| Post-landing | STABILIZE | Auto-disarm triggers |

## Safety Considerations

- **Auto-Arm**: The script arms automatically - ensure area is clear
- **Target Altitude**: Default is 3m - adjust `TARGET_ALTITUDE` for your environment
- **Landing Zone**: Drone lands at current position - ensure clear landing area
- **Auto-Disarm**: Motors automatically disarm after landing detection

## Common Issues

- **Takeoff Fails**: Check GPS lock and pre-arm checks
- **Altitude Not Reached**: Verify telemetry is updating correctly
- **Landing Timeout**: May occur if ground detection is slow
- **No Auto-Disarm**: Flight controller may require manual disarm in some modes

## Next Steps

After mastering takeoff and landing, you're ready for:
- OFFBOARD mode and velocity control
- Waypoint navigation
- Mission planning

## Navigation

- **Previous**: [Tutorial 03: Arm/Disarm](03_arm.md)
- **Next**: [Tutorial 05: OFFBOARD Hover](05_offboard_hover.md)

---

*The takeoff and land sequence is fundamental to all autonomous drone operations. Master this before attempting more complex flight maneuvers.*
