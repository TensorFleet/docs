---
sidebar_position: 3
title: example-easy-drone-python
description: A minimal project that shows the Easy Drone SDK in action.
---

# example-easy-drone-python

This example mirrors how a customer would consume the `easy-drone` package directly from GitHub. It includes tiny publisher/subscriber samples plus Gazebo topic discovery.

## Quick start

```bash
git clone https://github.com/TensorFleet/example-easy-drone-python.git
cd example-easy-drone-python

# Create and activate a venv
python3 -m venv venv
source venv/bin/activate   # Windows: venv\\Scripts\\activate

# Install the SDK from GitHub
pip install -r requirements.txt
```

## Run the examples

List topics on your network:

```bash
python examples/topic_list.py
```

Subscriber (terminal 1):

```bash
python examples/simple_subscriber.py
```

Publisher (terminal 2):

```bash
python examples/simple_publisher.py
```

Bridge directly to a Gazebo publisher (helpful when discovery is blocked by Docker or firewalls):

```bash
export GZ_PUBLISHER_ADDRESS=tcp://172.17.0.1:45943
python examples/simple_subscriber.py /your/gz/topic
```

Switch transport backends:

```bash
# Default: ZeroMQ
python examples/simple_publisher.py

# Zenoh backend
export GZ_TRANSPORT_IMPLEMENTATION=zenoh
pip install 'easy-drone[zenoh] @ git+https://github.com/TensorFleet/easy-drone-python.git'
python examples/simple_publisher.py
```

## Troubleshooting

- No topics? Make sure a Gazebo sim or another publisher is running and that UDP multicast (port 11317) is allowed.
- Messages not arriving? Use `GZ_PUBLISHER_ADDRESS` to bypass discovery or start the subscriber before the publisher.
- Reinstall the SDK if imports fail: `pip install --no-cache-dir git+https://github.com/TensorFleet/easy-drone-python.git`.
