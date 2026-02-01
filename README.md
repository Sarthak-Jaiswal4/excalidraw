# <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Artist%20Palette.png" alt="Palette" width="45" height="45" /> DrawBorad

> **High-Fidelity Collaboration:** A distributed, real-time collaborative whiteboard engine built for infinite scalability and low-latency creative workflows.

<div align="center">
  <img src="https://capsule-render.vercel.app/render?type=soft&color=auto&height=250&section=header&text=SyncSketch&fontSize=90&animation=fadeIn&fontAlignY=38" width="100%" />
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Monorepo-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Real--Time-WebSocket_Pub_Sub-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Engine-Custom_Canvas_API-orange?style=for-the-badge" />
</p>

<p align="center">
  <a href="#-the-engine">The Engine</a> •
  <a href="#-technical-architecture">Architecture</a> •
  <a href="#-scalability-model">Scalability</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## 🎨 The Engine
SyncSketch isn't just a wrapper; it features a **bare-metal Canvas implementation**. Every interaction is optimized for 60FPS performance.

* **Custom Geometry:** Hand-written logic for rendering shapes, paths, and selection boxes.
* **Infinite Workspace:** Advanced Panning and Zooming algorithms for an unconstrained creative field.
* **Object Manipulation:** Real-time movement, resizing, and state reconciliation for multi-user editing.

---

## 🏗️ Technical Architecture

The project is managed as a **Monorepo**, separating concerns while sharing types and logic across the stack.

### 🧩 The Multi-Server Nexus
1.  **HTTP API (Node.js):** Handles user authentication, room persistence, and canvas metadata.
2.  **WebSocket Server (Node.js):** A high-concurrency state relay that manages live cursor positions and drawing updates.
3.  **React Frontend:** A highly optimized UI that utilizes the HTML5 Canvas API with custom hit-detection logic.

---

## 🛠️ Tech Stack

| Layer | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) | Powering the high-performance drawing interface and collaborative UI. |
| **Canvas Engine** | ![HTML5 Canvas](https://img.shields.io/badge/Canvas_API-E34F26?style=flat&logo=html5&logoColor=white) | Bare-metal implementation for custom shapes, panning, and hit-detection. |
| **Backends** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white) | Distributed Monorepo architecture with dedicated HTTP and WebSocket services. |
| **Real-Time Layer** | ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white) ![Redis](https://img.shields.io/badge/Redis_PubSub-DC382D?style=flat&logo=redis&logoColor=white) | Event synchronization across multiple server instances via Pub/Sub. |
| **Infrastructure** | ![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=flat&logo=amazonec2&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) | Containerized services deployed on cloud instances for high availability. |
| **Pipeline** | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=github-actions&logoColor=white) ![Docker Hub](https://img.shields.io/badge/Docker_Hub-2496ED?style=flat&logo=docker&logoColor=white) | Automated CI/CD for image builds, registry storage, and remote redeployment. |

## ⚙️ System Flow

### 1. Collaborative Real-time Architecture
SyncSketch uses a **Distributed WebSocket** model. When multiple users are in the same room but connected to different server instances, **Redis Pub/Sub** acts as the central nervous system to ensure global state synchronization.

```mermaid
sequenceDiagram
    participant UserA as 👤 User A
    participant WS1 as 🚀 WS Server 1
    participant Redis as 🛑 Redis Pub/Sub
    participant WS2 as 🚀 WS Server 2
    participant UserB as 👤 User B

    UserA->>WS1: Draw Shape (Socket.emit)
    WS1->>Redis: Publish Event (Room_ID)
    Redis-->>WS1: Subscribed
    Redis-->>WS2: Subscribed
    WS2->>UserB: Broadcast Shape (Socket.broadcast)
    Note over UserA, UserB: End-to-end latency < 50ms

## ⚙️ How It Works (The Flow)

```mermaid
graph TD
    %% Frontend
    U1((👤 User A)) -->|Drawing| Canvas[Custom Canvas Engine]
    Canvas -->|Emit Event| WS1[WS Server Node 1]
    
    subgraph "Distributed State Layer"
        WS1 -->|Publish| Redis[(Redis Pub/Sub)]
        Redis -->|Subscribe| WS2[WS Server Node 2]
    end
    
    subgraph "Persistent Layer"
        HTTP[HTTP API Server] -->|Save State| DB[(Database)]
    end

    WS2 -->|Broadcast| U2((👤 User B))
    
    style Redis fill:#D82C20,color:#fff
    style WS1 fill:#6E40C9,color:#fff
    style WS2 fill:#6E40C9,color:#fff
