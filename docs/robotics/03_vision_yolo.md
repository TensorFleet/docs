---
id: 03_vision_yolo
title: Vision YOLO
sidebar_label: "03: Vision YOLO"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Vision YOLO: Object Detection

This tutorial demonstrates real-time object detection using YOLO on your robot's camera feed. Detected objects are annotated with bounding boxes and republished for visualization.

## Overview

The vision YOLO script:
- Subscribes to camera images (`/camera/image_raw`)
- Runs YOLO object detection (CPU-only, no GPU required)
- Draws bounding boxes and labels on detected objects
- Publishes annotated images to `/camera/image_annotated`

## Prerequisites

- Active TensorFleet VM with robot + camera simulation
- Image Panel open in VS Code sidebar
- Additional dependencies for vision processing

### Additional Dependencies

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

The JavaScript version uses ONNX Runtime for inference:

```bash
# Dependencies included in package.json
bun install
```

</TabItem>
<TabItem value="python" label="Python">

```bash
# Install vision dependencies
uv pip install ultralytics opencv-python numpy
# or
pip install ultralytics opencv-python numpy
```

</TabItem>
</Tabs>

## Running the Script

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```bash
bun robot:vision
# or
bun src/vision_yolo.js
```

</TabItem>
<TabItem value="python" label="Python">

```bash
uv run python src/vision_yolo.py
# or
python src/vision_yolo.py
```

</TabItem>
</Tabs>

## Viewing Detection Output

1. Open the **Image Panel** from the TensorFleet sidebar
2. In the dropdown, select `/camera/image_raw` to see the raw camera feed
3. Run the vision script
4. Switch to `/camera/image_annotated` to see detections with bounding boxes

## Expected Output

```
Connected to rosbridge.
Subscribing to '/camera/image_raw' (sensor_msgs/Image) and republishing to '/camera/image_annotated'.
Waiting for images...
Received image message on '/camera/image_raw'.
Running YOLO inference on image ...
YOLO inference finished.
Processed image 1 (640x480), published to /camera/image_annotated
Image #1: 3 detections from YOLO (first: { classId: 0, label: 'person', score: 0.89 })
```

## How It Works

### Image Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                    Vision Pipeline                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  /camera/image_raw    ┌──────────────┐    /camera/image_     │
│  ─────────────────▶   │ YOLO Model   │    annotated          │
│  (sensor_msgs/Image)  │              │ ─────────────────▶    │
│                       │  - Decode    │ (sensor_msgs/Image)   │
│                       │  - Detect    │                       │
│                       │  - Annotate  │                       │
│                       └──────────────┘                       │
└──────────────────────────────────────────────────────────────┘
```

### Subscribing to Camera Images

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
const subscriber = new ROSLIB.Topic({
    ros,
    name: IMAGE_TOPIC,
    messageType: IMAGE_MESSAGE_TYPE,
    queue_length: 1  // Only keep latest frame
});

const publisher = new ROSLIB.Topic({
    ros,
    name: ANNOTATED_IMAGE_TOPIC,
    messageType: IMAGE_MESSAGE_TYPE
});

subscriber.subscribe(async (msg) => {
    // Process each frame
    const detections = await runYoloOnImageMsg(msg);
    const annotatedMsg = annotateImageMessage(msg, detections);
    publisher.publish(annotatedMsg);
});
```

</TabItem>
<TabItem value="python" label="Python">

```python
subscriber = roslibpy.Topic(
    client, src_topic, resolved_type, queue_length=1
)
publisher = roslibpy.Topic(
    client, dst_topic, "sensor_msgs/Image"
)

def on_image(msg):
    # Decode ROS image to numpy
    img_np, meta = decode_ros_image(msg)
    
    # Run YOLO detection
    annotated = run_yolo_on_image(img_np)
    
    # Encode back to ROS message
    annotated_msg = encode_ros_image(annotated, msg, meta)
    publisher.publish(annotated_msg)

subscriber.subscribe(on_image)
```

</TabItem>
</Tabs>

### Decoding ROS Images

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
function decodeRosImage(msg) {
    let height = msg.height;
    let width = msg.width;
    const encoding = (msg.encoding || "rgb8").toLowerCase();
    const dataField = msg.data;

    let buffer;
    
    // rosbridge sends image data as base64 string
    if (typeof dataField === "string") {
        buffer = Buffer.from(dataField, "base64");
    } else {
        buffer = Buffer.from(dataField);
    }

    return {
        buffer,
        meta: { height, width, encoding }
    };
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
import base64
import numpy as np

def decode_ros_image(img_msg: dict):
    """Decode a ROS sensor_msgs/Image into a numpy array."""
    height = img_msg["height"]
    width = img_msg["width"]
    encoding = img_msg.get("encoding", "rgb8")
    data_field = img_msg["data"]

    # rosbridge sends image data as base64 string
    if isinstance(data_field, str):
        raw = base64.b64decode(data_field)
    else:
        raw = bytes(data_field)

    channels = 3  # Assume RGB
    img = np.frombuffer(raw, dtype=np.uint8)
    img = img.reshape((height, width, channels))

    return img, {"encoding": encoding, "height": height, "width": width}
```

</TabItem>
</Tabs>

### Running YOLO Detection

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
// Uses ONNX Runtime for CPU inference
async function runYoloOnImageMsg(msg) {
    const { buffer, meta } = decodeRosImage(msg);
    
    // Preprocess image for YOLO input
    const inputTensor = preprocessImage(buffer, meta);
    
    // Run inference
    const outputs = await yoloSession.run({ images: inputTensor });
    
    // Post-process to get bounding boxes
    const detections = postprocessYoloOutput(outputs, meta);
    
    return detections;
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
from ultralytics import YOLO

# Load YOLO model (downloads automatically on first run)
model = YOLO("yolov8n.pt")

def run_yolo_on_image(img_np):
    """Run YOLO on an RGB image and return annotated image."""
    print("Running YOLO inference on image ...")
    
    # Convert RGB to BGR for OpenCV/YOLO
    bgr = img_np[..., ::-1].copy()
    
    # Run inference
    results = model(bgr, verbose=False, device="cpu")
    
    # Get annotated image with bounding boxes
    annotated_bgr = results[0].plot()
    
    # Convert back to RGB
    annotated_rgb = annotated_bgr[..., ::-1]
    
    print("YOLO inference finished.")
    return annotated_rgb
```

</TabItem>
</Tabs>

### Drawing Annotations

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
function annotateImageMessage(msg, detections) {
    if (!detections || detections.length === 0) {
        return msg;
    }

    const { buffer, meta } = decodeRosImage(msg);

    const colors = [
        { r: 0, g: 255, b: 255 },   // Cyan
        { r: 255, g: 0, b: 255 },   // Magenta
        { r: 255, g: 255, b: 0 },   // Yellow
        { r: 0, g: 255, b: 0 },     // Green
        { r: 255, g: 128, b: 0 }    // Orange
    ];

    detections.forEach((det, idx) => {
        const color = colors[idx % colors.length];
        
        // Draw bounding box
        drawRectOnBuffer(buffer, meta, det, { color, thickness: 4 });
        
        // Draw label
        const label = `${det.label} ${Math.round(det.score * 100)}%`;
        drawLabelOnBuffer(buffer, meta, det, label, { color });
    });

    return encodeRosImage(buffer, msg, meta);
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
# The ultralytics library handles annotation automatically
# results[0].plot() draws boxes, labels, and confidence scores

# For custom annotation:
import cv2

def draw_detections(img, detections):
    for det in detections:
        x1, y1, x2, y2 = det["box"]
        label = det["label"]
        score = det["score"]
        
        # Draw rectangle
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 255), 2)
        
        # Draw label
        text = f"{label} {score:.0%}"
        cv2.putText(img, text, (x1, y1-10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
    
    return img
```

</TabItem>
</Tabs>

## YOLO Model Options

| Model | Size | Speed | Accuracy |
|-------|------|-------|----------|
| `yolov8n` | 6 MB | Fastest | Good |
| `yolov8s` | 22 MB | Fast | Better |
| `yolov8m` | 52 MB | Medium | High |
| `yolov8l` | 87 MB | Slow | Higher |
| `yolov8x` | 137 MB | Slowest | Highest |

For real-time robotics on CPU, `yolov8n` (nano) is recommended.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `IMAGE_TOPIC` | `/camera/image_raw` | Input camera topic |
| `ANNOTATED_IMAGE_TOPIC` | `/camera/image_annotated` | Output annotated topic |
| `NO_YOLO` | `false` | Set `true` to disable YOLO (passthrough) |
| `MAX_IMAGES` | `0` | Limit frames processed (0 = unlimited) |

## Detectable Objects

YOLO is trained on the COCO dataset with 80 classes including:

**Common in robotics:**
- person, car, truck, bus, bicycle, motorcycle
- chair, couch, bed, dining table
- bottle, cup, bowl
- cat, dog, bird

**For simulation**, consider using `vision_colors.js` which detects colored shapes that are easier to place in Gazebo.

## Performance Tips

1. **Use queue_length=1**: Only process the latest frame
2. **Resize images**: Smaller images = faster inference
3. **Use nano model**: `yolov8n` is fastest for CPU
4. **Skip frames**: Process every Nth frame if needed

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```javascript
// Skip frames for better performance
let frameCount = 0;
subscriber.subscribe(async (msg) => {
    frameCount++;
    if (frameCount % 3 !== 0) return;  // Process every 3rd frame
    // ... process
});
```

</TabItem>
<TabItem value="python" label="Python">

```python
# Skip frames for better performance
frame_count = 0

def on_image(msg):
    global frame_count
    frame_count += 1
    if frame_count % 3 != 0:
        return  # Process every 3rd frame
    # ... process
```

</TabItem>
</Tabs>

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No images received | Topic mismatch | Check `IMAGE_TOPIC` matches simulation |
| Slow inference | Model too large | Use `yolov8n` (nano) model |
| No detections | Objects not in COCO | Use color detection for simulation |
| Memory issues | Too many frames queued | Set `queue_length=1` |

## Alternative: Color Detection

For simulation environments, `vision_colors.js` / color detection may work better since you can place distinctly colored objects in Gazebo:

<Tabs groupId="language">
<TabItem value="js" label="JavaScript" default>

```bash
bun robot:vision:colors
```

</TabItem>
<TabItem value="python" label="Python">

```bash
# Implement HSV-based color detection
# (Not included in Python template by default)
```

</TabItem>
</Tabs>

## Next Steps

- Combine vision with obstacle avoidance for smarter navigation
- Train a custom YOLO model for your specific objects
- Implement object tracking across frames

---

*Computer vision enables robots to understand their environment beyond geometric sensor data. YOLO provides a robust starting point for object detection.*


