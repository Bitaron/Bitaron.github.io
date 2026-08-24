---
title: "Kubernetes Part 2: Installation"
date: 2026-04-18 09:38:09 +0000
image: "/assets/images/posts/kubernetes-part-2-installation.jpg"
tags:
  - DevOps
  - Kubernetes
  - Software Engineering
  - Container Orchestration
  - Software Architecture
external_url: "https://medium.com/@bitaron90/kubernetes-part-2-installation-589564e18307"
excerpt: >-
  A step-by-step production Kubernetes installation guide using Kubeadm,
  covering machine preparation, containerd, control-plane initialization,
  Cilium networking, worker joins, and cluster validation.
---

> Originally published on [Medium](https://medium.com/@bitaron90/kubernetes-part-2-installation-589564e18307).


![Kubernetes Part 2: Installation illustration](/assets/images/medium/kubernetes-part-2-installation-01.jpeg)

In [Part 1](https://medium.com/@bitaron90/devops-essentials-a-comprehensive-guide-to-kubernetes-and-container-orchestration-61b5fbad6c51) we learned about essential concepts. In this part we go through a Step-by-Step Guide to install production kubernetes with Kubeadm

Getting a Kubernetes cluster up and running doesn’t have to be complicated. In this guide, I’ll walk you through installing Kubernetes using **Kubeadm**, a tool designed to bootstrap a minimal viable Kubernetes cluster. Whether you’re new to Kubernetes or just want a quick setup, this approach focuses on simplicity without sacrificing functionality.

### What You’ll Install

Before we dive in, here’s what we’re putting together:

- **Kubernetes v1.35** — The container orchestration powerhouse
- **Containerd 2.2.2** — A lightweight container runtime
- **Calico 3.31.4** — For networking and security policies

This stack is production-tested and widely used in real-world deployments.

### Prerequisites

You’ll need:

- Two or more Linux machines (bare metal or cloud VMs)
- Root or sudo access on all machines
- At least 2GB RAM per machine (4GB+ recommended)
- Basic SSH access between nodes

### Step 1: Prepare Your Machines

### Disable Swap

Kubernetes doesn’t play well with swap memory. Let’s turn it off:

```
sudo swapoff -a
```

To make this permanent, edit /etc/fstab or your systemd swap configuration.

### Get System Info

Check that each machine has a unique MAC address and Product UUID — Kubernetes requires this:

```
ip link                                    # MAC address
sudo cat /sys/class/dmi/id/product_uuid  # Product UUID
```

### Open Required Firewall Ports

We need to disable firewall. Becaus calico and firewall doesn’t play well togther.

```
sudo systemctl stop firewalld
```

### Configure IPv4 Forwarding

Kubernetes needs this to route traffic between containers:

```
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.ipv4.ip_forward = 1
EOF
```

```
sudo sysctl --system
```

### Disable SELinux (if present)

```
sudo setenforce 0
sudo sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config
```

### Step 2: Install Containerd

Containerd is your container runtime. Here’s the quick version:

```
# Download and verify
wget https://github.com/containerd/containerd/releases/download/v2.2.2/containerd-2.2.2-linux-amd64.tar.gz
wget https://github.com/containerd/containerd/releases/download/v2.2.2/containerd-2.2.2-linux-amd64.tar.gz.sha256sum
sha256sum --check containerd-2.2.2-linux-amd64.tar.gz.sha256sum
```

```
# Extract to /usr/local
tar Cxzvf /usr/local containerd-2.2.2-linux-amd64.tar.gz
```

```
# Add systemd service
wget -P /usr/local/lib/systemd/system https://raw.githubusercontent.com/containerd/containerd/main/containerd.service
sudo systemctl daemon-reload
sudo systemctl enable --now containerd
```

### Install Runc

```
wget https://github.com/opencontainers/runc/releases/download/v1.5.0-rc.2/runc.amd64
wget https://github.com/opencontainers/runc/releases/download/v1.5.0-rc.2/runc.sha256sum
sha256sum --check runc.sha256sum
sudo install -m 755 runc.amd64 /usr/local/sbin/runc
```

### Install CNI Plugins

```
wget https://github.com/containernetworking/plugins/releases/download/v1.9.1/cni-plugins-linux-amd64-v1.9.1.tgz
wget https://github.com/containernetwork/plugins/releases/download/v1.9.1/cni-plugins-linux-amd64-v1.9.1.tgz.sha256
sha256sum --check cni-plugins-linux-amd64-v1.9.1.tgz.sha256
```

```
mkdir -p /opt/cni/bin
tar Cxzvf /opt/cni/bin cni-plugins-linux-amd64-v1.9.1.tgz
```

### Configure Containerd

```
mkdir -p /etc/containerd
containerd config default > /etc/containerd/config.toml
```

```
# Enable systemd cgroup driver
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
```

```
# Enable CRI plugin
sudo sed -i 's/disabled_plugins = \["cri"\]/disabled_plugins = []/' /etc/containerd/config.toml
```

```
# Restart
sudo systemctl restart containerd
```

### Step 3: Install Kubeadm, Kubelet, and Kubectl

Add the Kubernetes repository:

```
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.35/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.35/rpm/repodata/repomd.xml.key
exclude=kubelet kubeadm kubectl cri-tools kubernetes-cni
EOF
```

```
# Install
sudo yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
```

```
# Enable kubelet
sudo systemctl enable --now kubelet
```

### Step 4: Initialize the Control Plane

On your **control plane node only**, run:

```
sudo kubeadm init --pod-network-cidr=192.168.0.0/16
```

This generates your cluster’s certificates and tokens. Once it completes, you’ll see a kubeadm join command—**save this!** You'll need it for worker nodes.

### Set Up Kubectl Access

```
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Verify the control plane is ready:

```
kubectl get nodes
```

### Step 5: Install Calico Networking

Kubernetes needs a network plugin. Calico is simple and powerful:

```
# Install Tigera operator (Calico's management system)
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/operator-crds.yaml
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/tigera-operator.yaml
```

```
# Download and apply Calico configuration
curl -O https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/custom-resources-bpf.yaml
kubectl create -f custom-resources-bpf.yaml
```

```
# Monitor deployment. All will be in true state after few minutes
watch kubectl get tigerastatus
```

### Step 6: Join Worker Nodes

On each **worker node**, run the kubeadm join command from Step 4:

```
sudo kubeadm join <CONTROL_PLANE_IP>:6443 --token <TOKEN> \
  --discovery-token-ca-cert-hash sha256:<HASH>
```

Replace the placeholders with the actual values from your init output.

Verify worker status on the control plane:

```
kubectl get nodes
```

All nodes should show as Ready within a few minutes.

### Step 7: Test Your Cluster

Deploy a simple Nginx application:

```
kubectl create deployment test-app --image=nginx
kubectl expose deployment test-app --type=NodePort --port=80
kubectl get svc test-app
```

Find the NodePort (usually in the 30000–32767 range), get a node’s IP, and test:

```
# Get worker node internal ip. That is node ip. eg: 192.168.1.10
kubectl get nodes -o wide
#Get node port. e.g: 30000-32767
kubectl get svc
curl http://<NODE-IP>:<NODE-PORT>
```

You should see the Nginx welcome page. Success! 🎉

### Cleanup (Optional)

```
kubectl delete service test-app
kubectl delete deployment test-app
```

### Troubleshooting Tips

- **Nodes not ready?** Check kubelet logs: journalctl -u kubelet -f
- **Pods pending?** Ensure Calico is running: kubectl get pods -n calico-system
- **Can’t reach services?** Verify firewall is stopped

### Resources

- [Kubernetes Docs](https://kubernetes.io/docs)
- [Containerd Getting Started](https://github.com/containerd/containerd/blob/main/docs/getting-started.md)
- [Calico Installation](https://docs.tigera.io/calico/latest/getting-started/kubernetes)

**That’s it!** You now have a fully functional Kubernetes cluster. From here, the sky’s the limit. Happy containerizing! 🚀
