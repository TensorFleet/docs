---
id: 02_obstacle_avoider
title: Obstacle Avoider
sidebar_label: "02: Obstacle Avoider"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Obstacle Avoider: LiDAR-Based Navigation

This tutorial demonstrates autonomous obstacle avoidance using LiDAR sensor data. The robot moves forward by default and intelligently maneuvers around obstacles.

## Overview

The obstacle avoider:
- Subscribes to LiDAR scan data (`/scan`)
- Analyzes surroundings to detect obstacles
- Chooses optimal escape maneuvers (turn left, turn right, or back up)
- Resumes forward movement when path is clear

## Prerequisites

- Active TensorFleet VM with robot + LiDAR simulation
- Simulation View open in VS Code sidebar
- Completed [Robot Mover](01_robot_mover.md) tutorial

## Running the Script

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```bash
bun robot:obstacle
# or
bun src/obstacle_avoider.js
```

</TabItem>
<TabItem value="python" label="Python">

```bash
uv run python src/obstacle_avoider.py
# or
python src/obstacle_avoider.py
```

</TabItem>
</Tabs>

## Expected Output

```
Connected to rosbridge.
Obstacle avoider initialized:
  - Obstacle distance threshold: 0.5 m
  - Clear distance required: 1.0 m
  - Linear speed: 3.0 m/s
  - Angular speed: 4.0 rad/s

Starting obstacle avoidance...
Robot will move forward and avoid obstacles.
Press Ctrl+C to stop.

Path clear at 2.45 m. Rolling forward (path wide open).
Obstacle at 0.48 m. Turning LEFT (opening left (1.23 vs 0.87)).
Path clear at 1.12 m. Rolling forward (cautious advance).
Obstacle at 0.35 m. Backing up (escape: too close).
Path clear at 1.56 m. Rolling forward (path wide open).
```

## How It Works

### State Machine

The avoider operates as a state machine with four states:

```
┌────────────────────────────────────────────────────────────┐
│                    State Machine                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│     ┌──────────┐    obstacle     ┌──────────────┐         │
│     │ FORWARD  │ ──────────────▶ │ TURNING_LEFT │         │
│     │          │ ◀────────────── │              │         │
│     └────┬─────┘    path clear   └──────────────┘         │
│          │                                                 │
│          │ obstacle              ┌───────────────┐        │
│          └─────────────────────▶ │ TURNING_RIGHT │        │
│          ◀───────────────────── │               │        │
│               path clear         └───────────────┘        │
│                                                            │
│          │ boxed in              ┌───────────────┐        │
│          └─────────────────────▶ │  BACKING_UP   │        │
│          ◀───────────────────── │               │        │
│               space available    └───────────────┘        │
└────────────────────────────────────────────────────────────┘
```

### Initialization

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
class ObstacleAvoider {
    constructor(ros) {
        this.ros = ros;
        this.obstacleDistance = OBSTACLE_DISTANCE;  // 0.5m
        this.clearDistance = CLEAR_DISTANCE;        // 1.0m
        this.linearSpeed = LINEAR_SPEED;            // 3.0 m/s
        this.angularSpeed = ANGULAR_SPEED;          // 4.0 rad/s

        // Publisher for velocity commands
        this.cmdVelPub = new ROSLIB.Topic({
            ros,
            name: CMD_VEL_TOPIC,
            messageType: "geometry_msgs/Twist"
        });

        // Subscriber for LiDAR data
        this.scanSub = new ROSLIB.Topic({
            ros,
            name: SCAN_TOPIC,
            messageType: "sensor_msgs/LaserScan"
        });

        this.latestScan = null;
        this.state = "FORWARD";

        this.scanSub.subscribe((msg) => {
            this.latestScan = msg;
        });
    }
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
class ObstacleAvoider:
    def __init__(self, client):
        self.client = client
        self.obstacle_distance = OBSTACLE_DISTANCE  # 0.5m
        self.clear_distance = CLEAR_DISTANCE        # 1.0m
        self.linear_speed = LINEAR_SPEED            # 3.0 m/s
        self.angular_speed = ANGULAR_SPEED          # 4.0 rad/s

        # Publisher for velocity commands
        self.cmd_vel_pub = roslibpy.Topic(
            client, CMD_VEL_TOPIC, "geometry_msgs/Twist"
        )

        # Subscriber for LiDAR data
        self.scan_sub = roslibpy.Topic(
            client, SCAN_TOPIC, "sensor_msgs/LaserScan"
        )
        self.scan_sub.subscribe(self.on_scan)

        self.latest_scan = None
        self.state = "FORWARD"

    def on_scan(self, message):
        self.latest_scan = message
```

</TabItem>
</Tabs>

### LiDAR Data Analysis

The avoider divides the LiDAR scan into sectors and analyzes each:

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
analyzeSurroundings() {
    const scan = this.latestScan;
    const ranges = scan.ranges;
    const totalPoints = ranges.length;
    
    const quarter = Math.floor(totalPoints / 4);
    const eighth = Math.floor(totalPoints / 8);

    // Analyze different sectors
    const sectors = {
        front: this.getArcStats(ranges, 0, 70),
        frontLeft: this.getArcStats(ranges, eighth, 70),
        frontRight: this.getArcStats(ranges, totalPoints - eighth, 70),
        left: this.getArcStats(ranges, quarter, 70),
        right: this.getArcStats(ranges, quarter * 3, 70),
        back: this.getArcStats(ranges, quarter * 2, 80)
    };

    const frontDist = sectors.front.min;

    // Decision logic
    if (frontDist >= this.clearDistance) {
        return { action: "FORWARD", reason: "path wide open" };
    }

    if (frontDist > this.obstacleDistance) {
        return { action: "FORWARD", reason: "cautious advance" };
    }

    // Choose best escape direction
    const leftScore = this.scoreDirection(sectors.frontLeft, sectors.left);
    const rightScore = this.scoreDirection(sectors.frontRight, sectors.right);

    if (leftScore > rightScore) {
        return { action: "TURN_LEFT", reason: "opening left" };
    } else {
        return { action: "TURN_RIGHT", reason: "opening right" };
    }
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
def analyze_surroundings(self):
    scan = self.latest_scan
    ranges = scan.get("ranges", [])
    total_points = len(ranges)
    
    quarter = max(1, total_points // 4)
    eighth = max(1, total_points // 8)

    # Analyze different sectors
    sectors = {
        "front": self._get_arc_stats(ranges, 0, 70),
        "front_left": self._get_arc_stats(ranges, eighth, 70),
        "front_right": self._get_arc_stats(ranges, total_points - eighth, 70),
        "left": self._get_arc_stats(ranges, quarter, 70),
        "right": self._get_arc_stats(ranges, quarter * 3, 70),
        "back": self._get_arc_stats(ranges, quarter * 2, 80),
    }

    front_dist = sectors["front"]["min"]

    # Decision logic
    if front_dist >= self.clear_distance:
        return {"action": "FORWARD", "reason": "path wide open"}

    if front_dist > self.obstacle_distance:
        return {"action": "FORWARD", "reason": "cautious advance"}

    # Choose best escape direction
    left_score = self._score_direction(sectors["front_left"], sectors["left"])
    right_score = self._score_direction(sectors["front_right"], sectors["right"])

    if left_score > right_score:
        return {"action": "TURN_LEFT", "reason": "opening left"}
    else:
        return {"action": "TURN_RIGHT", "reason": "opening right"}
```

</TabItem>
</Tabs>

### Main Control Loop

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
loop() {
    if (!this.running || !this.ros.isConnected) return;

    if (!this.latestScan) {
        console.log("Waiting for LiDAR data...");
        this.publishVelocity(0.0, 0.0);
        return;
    }

    const decision = this.analyzeSurroundings();
    const { action, frontDist, linear, angular, reason } = decision;

    if (action === "FORWARD") {
        this.state = "FORWARD";
        this.publishVelocity(linear, 0.0);
    } else if (action === "TURN_LEFT") {
        this.state = "TURNING_LEFT";
        this.publishVelocity(0.0, this.angularSpeed);
    } else if (action === "TURN_RIGHT") {
        this.state = "TURNING_RIGHT";
        this.publishVelocity(0.0, -this.angularSpeed);
    } else if (action === "BACK_UP") {
        this.state = "BACKING_UP";
        this.publishVelocity(-this.linearSpeed * 0.7, 0.0);
    }
}

start() {
    this.running = true;
    this.loopTimer = setInterval(() => this.loop(), 50);  // 20 Hz
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
def loop(self):
    if not self.running or not self.client.is_connected:
        return

    if not self.latest_scan:
        print("Waiting for LiDAR data...")
        self.publish_velocity(0.0, 0.0)
        return

    decision = self.analyze_surroundings()
    action = decision["action"]
    reason = decision["reason"]

    if action == "FORWARD":
        self.state = "FORWARD"
        self.publish_velocity(decision["linear"], 0.0)
    elif action == "TURN_LEFT":
        self.state = "TURNING_LEFT"
        self.publish_velocity(0.0, self.angular_speed)
    elif action == "TURN_RIGHT":
        self.state = "TURNING_RIGHT"
        self.publish_velocity(0.0, -self.angular_speed)
    elif action == "BACK_UP":
        self.state = "BACKING_UP"
        self.publish_velocity(-self.linear_speed * 0.7, 0.0)

def run(self):
    self.running = True
    while self.running and self.client.is_connected:
        self.loop()
        time.sleep(0.05)  # 20 Hz
```

</TabItem>
</Tabs>

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `OBSTACLE_DISTANCE` | `0.5` | Distance to trigger avoidance (m) |
| `CLEAR_DISTANCE` | `1.0` | Distance considered "clear" (m) |
| `LINEAR_SPEED` | `3.0` | Forward speed (m/s) |
| `ANGULAR_SPEED` | `4.0` | Turning speed (rad/s) |
| `SCAN_TOPIC` | `/scan` | LiDAR topic |
| `CMD_VEL_TOPIC` | `/cmd_vel_raw` | Velocity command topic |

## Understanding LiDAR Data

The `sensor_msgs/LaserScan` message contains:

| Field | Description |
|-------|-------------|
| `ranges[]` | Array of distance measurements |
| `angle_min` | Start angle of scan (radians) |
| `angle_max` | End angle of scan (radians) |
| `angle_increment` | Angular step between readings |
| `range_min` | Minimum valid range |
| `range_max` | Maximum valid range |

Typically, index 0 is straight ahead, with indices wrapping around 360°.

## Scoring Algorithm

The direction scoring considers:
- **Minimum distance** in that sector (65% weight)
- **Average distance** in that sector (25% weight)
- **Wider area average** for that direction (10% weight)
- **Turn preference bias** to avoid oscillation

```javascript
scoreDirection(primaryStats, secondaryStats, label) {
    const minScore = primaryStats.min;
    const avgScore = primaryStats.avg;
    const farAvg = secondaryStats.avg;
    
    const base = minScore * 0.65 + avgScore * 0.25 + farAvg * 0.1;
    const preferenceBoost = (label === this.turnPreference) ? 0.05 : 0;
    
    return base + preferenceBoost;
}
```

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Robot spins in place | Oscillating between left/right | Increase turn preference bias |
| Robot gets stuck | Boxed in on all sides | Ensure backup behavior triggers |
| No LiDAR data | Topic mismatch | Verify `SCAN_TOPIC` matches simulation |
| Jerky movement | Loop rate too slow | Ensure 20 Hz control loop |

## Next Steps

- [Vision YOLO](03_vision_yolo.md): Add camera-based object detection
- Combine obstacle avoidance with waypoint navigation

---

*The obstacle avoider demonstrates reactive navigation - responding to sensor data in real-time. This pattern is foundational for autonomous robot behavior.*


