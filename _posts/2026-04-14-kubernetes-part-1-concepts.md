---
title: "Kubernetes Part 1 : Concepts"
date: 2026-04-14 06:05:52 +0000
image: "/assets/images/posts/kubernetes-part-1-concepts.jpg"
tags:
  - Kubernetes
  - DevOps
  - Container Orchestration
  - Software Architecture
  - Software Engineering
series: "DevOps Essentials: Kubernetes and Container Orchestration"
series_part: 1
external_url: "https://medium.com/@bitaron90/devops-essentials-a-comprehensive-guide-to-kubernetes-and-container-orchestration-61b5fbad6c51"
excerpt: >-
  Learn the essential Kubernetes and container-orchestration concepts behind a
  small team’s move into large-scale telecom infrastructure, from clusters and
  workloads to networking, configuration, and platform architecture.
---

> Originally published on [Medium](https://medium.com/@bitaron90/devops-essentials-a-comprehensive-guide-to-kubernetes-and-container-orchestration-61b5fbad6c51).


![Kubernetes Part 1 : Concepts illustration](/assets/images/medium/kubernetes-part-1-concepts-01.jpeg)

I work in a small software farm with at most 20 developers — including QA — and frankly, we’ve never needed a dedicated DevOps team. Everything changed when we landed a project from a leading telecom company that required building and maintaining massive infrastructure. Suddenly, I found myself assigned the DevOps role and part of the team to design the architecture from scratch.

This series serves three key purposes:

1. **Document my learning** in a structured, digestible format
2. **Create accessible onboarding material** for new DevOps engineers
3. **Provide an extensive resource** for continued learning

Let’s dive in.

### Part 1: Understanding the Fundamentals

### Containers: The Building Blocks

**What are containers?**

Containers are lightweight, executable application components that bundle source code with all the operating system (OS) libraries and dependencies required to run the code in any environment.

Still abstract? Let me simplify:

When you run your application on a computer, your code executes alongside OS system libraries. For example, when your Java Spring Boot application saves a file to disk, it calls OS-level file APIs. The problem? Different operating systems have vastly different file APIs. Moreover, if you have multiple applications running different Java versions, they can’t coexist on the same machine.

**This is where containers shine.**

Containers solve this by packaging your application code *with the necessary OS-level system libraries* (not kernel libraries). Containers use an underlying container engine — specific to your OS — to translate calls from within the container to actual OS calls. The result? Lightweight, easily reproducible environments.

Think of it this way: instead of everyone installing dependencies manually (and fighting compatibility issues), containers say, “Here’s your app *plus everything it needs, pre-configured and ready to go.*”

### Container Orchestration: Managing at Scale

So now we can create containers easily — really easily. In a microservices architecture, you might have hundreds or even thousands of containers running simultaneously. Managing all of them? That’s container orchestration.

Container orchestration platforms solve critical challenges:

- **Container lifecycle management** — Starting, stopping, restarting containers
- **Networking** — Enabling communication between containers
- **Security** — Isolating containers and managing access
- **Scalability** — Automatically scaling up or down based on demand
- **Load balancing** — Distributing traffic across containers
- **Service discovery** — Making services findable dynamically

### Part 2: Enter Kubernetes

**Kubernetes (K8s)** is a container orchestration platform, but it’s more than that. At its core, Kubernetes is a framework for running distributed systems. You can even build your own container orchestration tool using Kubernetes as a foundation.

### Core Kubernetes Concepts

#### Pods

The first concept to understand: **Pods** are the smallest deployable unit in Kubernetes. They’re wrappers that Kubernetes places around your containers when deploying them. A pod can contain one or more containers, though single-container pods are most common.

#### Nodes

**Nodes** are the machines — physical or virtual — where pods are deployed. Kubernetes clusters have two types of nodes:

- **Controller Plane** — The brain of your cluster (manages everything)
- **Worker Nodes** — Execute your applications

#### Kubernetes Components

Kubernetes uses several key components (think of them as modules):

**Running on the Controller Plane:**

- **kube-apiserver** — The control panel of Kubernetes. Every interaction with Kubernetes goes through its API.
- **etcd** — Kubernetes’s memory. All cluster data is stored here.
- **kube-scheduler** — The watchdog that monitors nodes and pods, deciding where to place new pods.
- **kube-controller-manager** — A management layer that oversees nodes, pods, and other resources.

**Running on Worker Nodes:**

- **kubelet** — The captain of each node. It receives orders from the control plane and manages the node.
- **kube-proxy** — The networking proxy that enables external and internal services to communicate with pods. Think of it as managing networking rules.

### Part 3: Advanced Kubernetes Concepts

### Container Runtimes

Containers need a container engine/runtime to execute. Kubernetes requires a container runtime installed on all nodes. Common examples include Docker, containerd, and CRI-O.

### Container Networks

Like container runtimes, container networks are low-level networking managers. They enable pod-to-pod communication across your cluster.

### Kubernetes Resources

A **Kubernetes resource** is either an object or operation accessible via the Kubernetes API. Resources are represented as JSON objects and stored in etcd. You can even define custom resources to extend Kubernetes functionality.

### Controllers

**Controllers** continuously watch over your Kubernetes cluster, making decisions and adjustments to maintain the desired state. They’re the automation engine of Kubernetes.

### Operators

**Operators** are controllers that leverage custom resources to extend Kubernetes functionality programmatically. They allow you to automate complex, application-specific operational tasks.

### kubectl: Your Command-Line Interface

**kubectl** is Kubernetes’s command-line tool. It’s how you interact with your cluster, deploy applications, and manage resources.

### Part 4: Working with Kubernetes Resources

### Naming Conventions

Kubernetes objects must follow specific naming rules:

- Only alphanumeric characters and hyphens allowed
- Lowercase letters only (no uppercase)
- Cannot start with a hyphen
- Examples: my-deployment, api-service, user-database

### Namespaces

**Namespaces** are virtual clusters within a single physical cluster. They work like namespaces in programming languages — allowing you to isolate resources, manage permissions, and organize your cluster logically.

### Labels

**Labels** are key-value pairs used to identify and group Kubernetes resources. Kubernetes uses them internally to organize and select resources. Labels must follow the naming convention rules mentioned above.

```
# Example labels
labels:
  app: my-api
  environment: production
  version: v1.2.3
```

### Annotations

**Annotations** are key-value pairs created by users — Kubernetes largely ignores them. Operators and tools use annotations for metadata. Unlike labels, annotations don’t follow naming restrictions and can contain any data.

```
# Example annotations
annotations:
  description: "Production API service"
  owner: "platform-team@company.com"
```

### Deployments

While you *can* create Pods directly, you typically don’t. Instead, you create **Deployments**. A Deployment is a wrapper around Pods that handles:

- Pod creation and lifecycle
- Rolling updates (seamlessly updating all pods)
- Rollbacks (reverting to previous versions)
- Scaling (increasing/decreasing pod count)

### Services

Deployments solve deployment, but raise a new question: *How do we access our applications?*

**Services** answer this. They provide stable, predictable ways to access pods:

- Assign a stable IP address
- Enable load balancing across multiple pods
- Enable service discovery (other services can find you by name)

Services are essential for both internal pod-to-pod communication and external access.

### Ingress Controllers

If Services handle internal networking, **Ingress Controllers** handle web traffic and routing. Nginx is a popular Ingress controller. You define routing rules using Kubernetes Ingress resources, and the controller implements them.

### API Gateways

**API Gateways** extend Ingress functionality with:

- Request rate limiting
- Authentication and authorization
- Advanced routing logic
- Cluster-level traffic proxying

Popular examples include Ambassador and Kong. They’re configured using custom Kubernetes resources.

### Conclusion

This introduction covers the foundational concepts you need to understand Kubernetes. From containers to services to advanced orchestration patterns, each component plays a vital role in building scalable, resilient distributed systems.

In the next part of this series, we’ll dive deeper into practical implementations and real-world scenarios.

### Resources

For deeper understanding, I recommend:

- <https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1>
- [https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1](https://medium.com/dzerolabs/just-in-time-kubernetes-namespaces-labels-annotations-and-basic-application-deployment-f62568a9eaaf)
- <https://kubernetes.io/docs/concepts/overview/>
- <https://www.ibm.com/think/topics/kubernetes>
