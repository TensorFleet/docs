---
sidebar_position: 4
title: easy-drone library
description: Pure-Python Gazebo transport for robotics and drone messaging.
---

# easy-drone (Python)

`easy-drone` is a pure-Python implementation of Gazebo Transport with built-in discovery, ZeroMQ transport, and optional Zenoh support. It ships 200+ protobuf message types so you can publish and subscribe without compiling C++.

## Install

```bash
git clone https://github.com/TensorFleet/easy-drone-python.git
cd easy-drone-python

# Recommended
python3 -m venv venv && source venv/bin/activate
pip install -e .

# Optional extras
pip install -e .[zenoh]   # Zenoh backend
pip install -e .[yolo]    # YOLO-based perception examples
pip install -e .[all]     # Everything
```

To consume directly from GitHub without cloning:

```bash
pip install --no-cache-dir git+https://github.com/TensorFleet/easy-drone-python.git
```

## Publish and subscribe

```python
from gz_transport import Node
from gz.msgs.stringmsg_pb2 import StringMsg

node = Node()

# Publisher
pub = node.advertise("/chatter", StringMsg)
msg = StringMsg()
msg.data = "Hello TensorFleet"
pub.publish(msg)

# Subscriber
def callback(message):
    print(f"Received: {message.data}")

node.subscribe(StringMsg, "/chatter", callback)
```

## Configure transport

- **Default backend**: ZeroMQ — no extra config required.
- **Zenoh backend**: `export GZ_TRANSPORT_IMPLEMENTATION=zenoh` (install with `[zenoh]`).
- **Discovery override**: `GZ_PUBLISHER_ADDRESS=tcp://<ip>:<port>` to bypass multicast discovery when running inside Docker or across networks.

## What’s inside

- Pub/sub messaging with automatic discovery
- Topic listing utilities (`Node.topic_list()`)
- Gazebo-compatible protobuf messages bundled with the package
- Example scripts for ZeroMQ and Zenoh transports

## Tips

- Start subscribers before publishers to give discovery time to handshake.
- If topics vanish after a few seconds, check multicast/firewall settings or pin the publisher with `GZ_PUBLISHER_ADDRESS`.
- Use `Node(verbose=True)` while developing to see discovery logs.
