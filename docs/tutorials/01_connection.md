---
id: 01_connection
title: "Tutorial 01: Connection & State Monitoring"
sidebar_label: "01: Connection & State Monitoring"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Tutorial 01: Connection & State Monitoring

## Overview

This tutorial demonstrates fundamental concepts for connecting to a drone via ROS Bridge and monitoring its state in real-time. It covers both direct ROS topic subscriptions for raw data access and the use of a managed state model for simplified state management.

## Learning Objectives

- Establish a WebSocket connection to ROS Bridge using `ROSLibBridgeWrapper`
- Subscribe directly to MAVROS ROS topics for low-level state monitoring
- Utilize DroneStateModel for aggregated, managed drone state handling
- Compare raw ROS processing vs. managed state utilities

## Key Concepts

- **ROS**: A robotics communication framework. Data is published on specific topics. And is received by subscribing to the topics. Allows nodes and sensors to communicate with each other. 
- **ROS Bridge**: Enables remote WebSocket-based communication with ROS systems
- **MAVROS**: Mavlink is a very common protocol used to communicate with robotics vehicle controllers. mavlink is built on top of UDP. MAVROS is a library that exposes mavlink to ROS

## Prerequisites

- Active TensorFleet VM with ROS Bridge running
- Simulation restarted (as described in [Preparation](00_preparation.md))

## Running the Tutorial

There are many ways to connect to a drone. The most basic ways are with a ROS Bridge or directly via ROS.
First we will go through the basics of connecting to the VM remotely via ROS bridge.
ROS bridge will use an authenticated websocket connection to connect to the ROS topics of the virtual machine

We already have utilities that connect you to the drone's environment using an authenticated proxy and a ROS bridge library.

Here we have an example of how to connect to a drone and conduct basic telemetry of the states (armed, flight mode, etc.)

To run the 01_connect tutorial example script, use the following command:

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```bash
bun run src/tutorials/01_connect.js
```

</TabItem>
<TabItem value="python" label="Python">

```bash
# Coming soon...
```

</TabItem>
</Tabs>

This will start the tutorial script, which connects to the drone via MAVROS and begins monitoring state changes.

## Expected Output Example

When running the tutorial, you should see output similar to the following (this is the result of a successful connection and state monitoring and only prints again when changes occur):

<div style={{maxHeight: '400px', overflowY: 'auto'}}>

```
[INFO] Listening to drone state...

[INFO] Showing both raw ROS subscription via wrapper and managed DroneStateModel

[DEBUG] DroneStateModel.connect() called
[DEBUG] Subscribing to topics: [
  {
    topic: "/mavros/global_position/raw/fix",
    type: "sensor_msgs/msg/NavSatFix",
  }, {
    topic: "/mavros/global_position/compass_hdg",
    type: "std_msgs/msg/Float64",
  }, {
    topic: "/mavros/state",
    type: "mavros_msgs/msg/State",
  }, {
    topic: "/mavros/extended_state",
    type: "mavros_msgs/msg/ExtendedState",
  }, {
    topic: "/mavros/battery",
    type: "sensor_msgs/msg/BatteryState",
  }, {
    topic: "/mavros/vfr_hud",
    type: "mavros_msgs/msg/VFR_HUD",
  }, {
    topic: "/mavros/local_position/pose",
    type: "geometry_msgs/msg/PoseStamped",
  }, {
    topic: "/mavros/local_position/velocity_local",
    type: "geometry_msgs/msg/TwistStamped",
  }, {
    topic: "/mavros/imu/data",
    type: "sensor_msgs/msg/Imu",
  }, {
    topic: "/mavros/altitude",
    type: "mavros_msgs/msg/Altitude",
  }, {
    topic: "/mavros/home_position/home",
    type: "mavros_msgs/msg/HomePosition",
  }
]
[DEBUG] DroneStateModel.connect() completed
Press Ctrl+C to exit

=== RAW ROS SUBSCRIPTION RECEIVED CHANGED DATA ===
Drone State:
  Connected: true
  Armed:     false
  Mode:      AUTO.LOITER
  Guided:    true

=== MANAGED DRONE STATE MODEL UPDATE ===
vehicle :
 {
  time_boot_ms: 1765832026405,
  connected: true,
  armed: false,
  guided: true,
  manual_input: false,
  mode: "AUTO.LOITER",
  system_status: 3,
}
status:
 {
  time_boot_ms: 1765832026439,
  connected: true,
  gcs_link: true,
  faults: [],
  armable: true,
  arm_reasons: [],
}
=== MANAGED DRONE STATE MODEL UPDATE ===
vehicle :
 {
  time_boot_ms: 1765832028302,
  connected: true,
  armed: false,
  guided: true,
  manual_input: false,
  mode: "AUTO.LOITER",
  system_status: 3,
}
status:
 {
  time_boot_ms: 1765832028358,
  connected: true,
  gcs_link: true,
  faults: [],
  armable: true,
  arm_reasons: [],
}
=== RAW ROS SUBSCRIPTION RECEIVED CHANGED DATA ===
Drone State:
  Connected: true
  Armed:     true
  Mode:      AUTO.TAKEOFF
  Guided:    true

=== MANAGED DRONE STATE MODEL UPDATE ===
vehicle :
 {
  time_boot_ms: 1765832051711,
  connected: true,
  armed: true,
  guided: true,
  manual_input: false,
  mode: "AUTO.TAKEOFF",
  system_status: 4,
}
status:
 {
  time_boot_ms: 1765832051789,
  connected: true,
  gcs_link: true,
  faults: [],
  armable: true,
  arm_reasons: [],
}
=== MANAGED DRONE STATE MODEL UPDATE ===
vehicle :
 {
  time_boot_ms: 1765832052734,
  connected: true,
  armed: true,
  guided: true,
  manual_input: false,
  mode: "AUTO.TAKEOFF",
  system_status: 4,
}
status:
 {
  time_boot_ms: 1765832052799,
  connected: true,
  gcs_link: true,
  faults: [],
  armable: false,
  arm_reasons: [ "not.on.ground" ],
}
=== MANAGED DRONE STATE MODEL UPDATE ===
vehicle :
 {
  time_boot_ms: 1765832056829,
  connected: true,
  armed: true,
  guided: true,
  manual_input: false,
  mode: "AUTO.TAKEOFF",
  system_status: 4,
}
status:
 {
  time_boot_ms: 1765832057647,
  connected: true,
  gcs_link: true,
  faults: [],
  armable: false,
  arm_reasons: [ "not.on.ground" ],
}
=== RAW ROS SUBSCRIPTION RECEIVED CHANGED DATA ===
Drone State:
  Connected: true
  Armed:     true
  Mode:      AUTO.LOITER
  Guided:    true

=== MANAGED DRONE STATE MODEL UPDATE ===
vehicle :
 {
  time_boot_ms: 1765832057848,
  connected: true,
  armed: true,
  guided: true,
  manual_input: false,
  mode: "AUTO.LOITER",
  system_status: 4,
}
status:
 {
  time_boot_ms: 1765832057849,
  connected: true,
  gcs_link: true,
  faults: [],
  armable: false,
  arm_reasons: [ "not.on.ground" ],
}
```

</div>

## How It Works

First we connect to the ROS bridge using our utility class
<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>
```javascript
const bridge = new ROSLibBridgeWrapper();
```
</TabItem>
<TabItem value="python" label="Python">

```python
# Coming soon
```

</TabItem>
</Tabs>

Then we can listen to ROS topics by calling the `.subscribe` function on the object as shown below
<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>
```javascript
const unsubscribeRaw = bridge.subscribe(
  { topic: "/mavros/state", type: "mavros_msgs/State" },
  (msg) => { /*Your code here */ });
```
</TabItem>
<TabItem value="python" label="Python">

```python
# Coming soon
```

</TabItem>
</Tabs>

However this is cumbersome and requires a lot of finetuning and testing.
We already have a utility class that does all the common subscriptions and provides us with a higher level usage and update tracking.
Here is how to use this utility

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>
```javascript
const droneState = new DroneStateModel();
// Connect to the bridge.
droneState.connect(bridge);

// Track status update of the drone (slight position changes will not trigger this)
droneState.onStatusUpdate((state) => {
    console.log("=== MANAGED DRONE STATE MODEL UPDATE ===");
    if (state.vehicle) {
        console.log("vehicle :\n", state.vehicle);
    }

    if (state.status) {
        console.log("status: \n", state.status);
    }
});
```
</TabItem>
<TabItem value="python" label="Python">

```python
# Coming soon
```

</TabItem>
</Tabs>

The `DroneStateModel` automatically manages subscriptions and provides structured state data. So you won't have to look for topic names and handle decoding them and tracking their updates.

Now that we know how to connect to the drone and read it's sensor data we can go over some better examples on how to use this structured sensor data.
