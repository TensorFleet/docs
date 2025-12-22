---
id: 02_telemetry
title: "Tutorial 02: Comprehensive Telemetry Monitoring"
sidebar_label: "02: Telemetry Monitoring"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Tutorial 02: Comprehensive Telemetry Monitoring

## Overview

This tutorial demonstrates advanced telemetry data collection and processing using MAVROS ROS topics. It showcases both raw ROS topic subscriptions for fine-grained control and the managed `DroneStateModel` for simplified, aggregated state handling. You'll learn about key telemetry sources, data formats, and real-time monitoring techniques essential for drone applications.

## Learning Objectives

- Subscribe to multiple MAVROS ROS topics for comprehensive telemetry data
- Process raw ROS messages from state, position, GPS, altitude, and battery topics
- Utilize `DroneStateModel` for unified, managed telemetry aggregation
- Understand MAVROS data structures and update frequencies
- Compare raw vs. managed telemetry processing approaches
- Monitor critical flight parameters in real-time

## Key Concepts

- **MAVROS Telemetry**: MAVLink protocol extension providing drone sensor and state data via ROS
- **ROS Topics**: Publish-subscribe messaging system for real-time data distribution
- **Data Aggregation**: Combining multiple raw topics into a coherent state representation
- **Coordinate Systems**: Understanding local (ENU) vs global (GPS) positioning

## Prerequisites

- Active TensorFleet VM with MAVROS running
- Simulation restarted (as described in [Preparation](00_preparation.md))
- Understanding of basic ROS Bridge connection from [Tutorial 01](01_connection.md)

## Running the Tutorial

After understanding basic connection and state monitoring from [Tutorial 01](01_connection.md), the telemetry tutorial builds upon this foundation by demonstrating comprehensive data collection from the drone's sensors and systems.

To run the telemetry tutorial example script, use the following bun command:

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```bash
bun run src/tutorials/02_telemetry.js
```

</TabItem>
<TabItem value="python" label="Python">

```bash
# Coming soon...
```

</TabItem>
</Tabs>

This will start the telemetry monitoring script, which connects to multiple MAVROS topics and begins collecting comprehensive flight data.

## Expected Output Example

When running the tutorial, you should see output similar to the following (this is the result of successful telemetry collection and displays both raw topic data and managed state model data):

<div style={{maxHeight: '400px', overflowY: 'auto'}}>

```
[INFO] Connected to ROS Bridge - monitoring comprehensive telemetry...

[INFO] Demonstrating both raw MAVROS topic subscriptions and managed DroneStateModel

Press Ctrl+C to exit

=== COMPREHENSIVE DRONE TELEMETRY ===

RAW MAVROS TOPIC DATA:
----------------------
Vehicle State (/mavros/state):
  Connected: true
  Armed:     false
  Mode:      AUTO.LOITER
  Guided:    true

Local Position (/mavros/local_position/pose) - ENU coordinates:
  East (X):  -0.01 m
  North (Y): -0.05 m
  Up (Z):    0.01 m

GPS Position (/mavros/global_position/raw/fix):
  Latitude:  47.3979707°
  Longitude: 8.5461639°
  Altitude:  47.39 m

Altitude Breakdown (/mavros/altitude):
  Above Mean Sea Level: 0.25 m
  Relative to Home:     0.03 m
  Above Ground Level:   undefined m

Battery Status (/mavros/battery):
  Voltage:    16.20 V
  Current:    1.00 A
  Percentage: 1%

MANAGED STATE MODEL (Aggregated Data):
---------------------------------------
Vehicle State:
  Connected: true
  Armed:     false
  Mode:      AUTO.LOITER
  Guided:    true

Local Position (ENU):
  East:  -0.01 m
  North: -0.05 m
  Up:    0.01 m

Global Position:
  Lat: 47.3979707°
  Lon: 8.5461639°
  Alt: 47.39 m

Altitude:
  AMSL:     0.25 m
  Relative: 0.03 m

Battery:
  Voltage:    16.20 V
  Percentage: 1%
```
</div>

## How It Works

In this example we cover two approaches to collect data:

1. **Raw MAVROS Topic Subscriptions**: Direct subscriptions to individual ROS topics provide fine-grained access to specific sensor data. This approach gives you complete control over data processing and allows for custom filtering, transformation, or analysis of individual data streams.

2. **Managed State Model Aggregation**: The `DroneStateModel` automatically subscribes to all relevant telemetry topics and combines them into a unified state representation. This simplifies development by handling topic management, data synchronization, and providing a consistent interface for accessing drone telemetry.

## Key MAVROS Topics Covered

- **`/mavros/state`**: Core vehicle state including connection, arming, mode, and guidance status
- **`/mavros/local_position/pose`**: Local position in ENU (East-North-Up) coordinates relative to the home position
- **`/mavros/global_position/raw/fix`**: Global GPS position with latitude, longitude, and altitude
- **`/mavros/altitude`**: Comprehensive altitude information including AMSL, relative, and AGL measurements
- **`/mavros/battery`**: Battery status including voltage, current draw, and charge percentage
- **`/mavros/vfr_hud`**: Virtual flight instrument data including airspeed, groundspeed, heading, throttle, and climb rate

## Understanding Coordinate Systems

Please note that the local Cartesian coordinate frame is not Z-up. In this frame, the Z axis points downward.

- **NED (North-East-Down)**: A local coordinate system where X points North, Y points East, and Z points Down. Positions are relative to the local origin (e.g., home/takeoff position).
- **GPS/WGS84**: A global coordinate system defined by latitude, longitude, and altitude above mean sea level.

## Code Analysis

### Connection and Setup

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
// Establish ROS Bridge connection using our wrapper
const bridge = new ROSLibBridgeWrapper();
await bridge.waitForConnection();

// Raw telemetry data storage
let rawTelemetry = {
    state: null,
    pose: null,
    fix: null,
    altitude: null,
    battery: null,
    vfr_hud: null,
};
```

</TabItem>
<TabItem value="python" label="Python">

```python
# Coming soon...
```

</TabItem>
</Tabs>

The tutorial sets up both raw data storage and connection to the ROS Bridge.

### Raw Topic Subscriptions
<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
// Subscribe to vehicle state (/mavros/state)
rawSubscriptions.push(
    bridge.subscribe(
        { topic: "/mavros/state", type: "mavros_msgs/State" },
        (msg) => {
            rawTelemetry.state = msg;
        }
    )
);
```

</TabItem>
<TabItem value="python" label="Python">

```python
# Coming soon...
```

</TabItem>
</Tabs>

Each telemetry source is subscribed to individually, giving direct access to raw MAVROS messages.

### Managed State Model

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
// Initialize managed state model for comparison
const droneState = new DroneStateModel();
droneState.connect(bridge);

// Variables to track managed state for display
let managedState = {};

droneState.onUpdate((state) => {
    managedState = state;
});
```

</TabItem>
<TabItem value="python" label="Python">

```python
# Coming soon...
```

</TabItem>
</Tabs>

The `DroneStateModel` handles all subscriptions internally and provides aggregated state updates.
the `state` variable is a `DroneState` variable. It contains the vehicle state, global position, local position and more

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
export type DroneState = {
  local_position_ned?: {
    time_boot_ms: number;
    x: number; y: number; z: number;
    vx: number; vy: number; vz: number;
  };

  /** Computed Yaw (rad)*/
  yaw?: number;

  global_position_int?: {
    time_boot_ms: number;
    lat: number; lon: number; alt: number;
    relative_alt: number;
    vx: number; vy: number; vz: number;
    hdg: number; // deg
  };

  /** Connection/mode/arming state. */
  vehicle?: {
    time_boot_ms: number;
    connected: boolean;
    armed: boolean;
    guided: boolean;
    manual_input: boolean;
    mode: string;
    system_status?: number;
  };

  /** Landed/VTOL state. */
  extended?: {
    time_boot_ms: number;
    landed_state?: number;
    vtol_state?: number;
  };

```

</TabItem>
<TabItem value="python" label="Python">

```python
# Coming soon...
```

</TabItem>
</Tabs>


### Display Logic

The example displays both raw and managed data side-by-side, updating every second to show real-time telemetry changes. We usage the same mechanism to draw a map for mission control.