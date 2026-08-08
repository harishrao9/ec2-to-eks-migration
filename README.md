# 🚀 FoodRush — EC2 to EKS Migration

A real-world simulation of migrating a production food delivery application
from EC2 to Amazon EKS using GitOps, Helm, and Terraform.

> Inspired by my professional experience migrating 140+ applications
> from EC2 to EKS at Nu Skin Enterprises (via Infosys).

---

## 🏗️ Architecture

### Phase 1 — Legacy: App on EC2

GitHub → Terraform → AWS EC2 (t3.micro) → Docker → FoodRush App


### Phase 2 — Modern: App on EKS

GitHub → Terraform → EKS Cluster → Helm → Kubernetes Pods → FoodRush App
└→ LoadBalancer → Public URL


---

## 📸 Migration Proof

### Running on EC2
![EC2](screenshots/ec2-running.png)

### Running on EKS
![EKS](screenshots/eks-running.png)

### Kubernetes Cluster
![Nodes](screenshots/kubectl-nodes-helm.png)
![Pods](screenshots/kubectl-pods-svc.png)

---

## 🛠️ Tech Stack

| Category | Tools |
|----------|-------|
| Cloud | AWS (EC2, EKS, VPC, IAM, ALB, S3) |
| IaC | Terraform |
| Containers | Docker, Kubernetes |
| Packaging | Helm |
| Registry | GitHub Container Registry (GHCR) |
| CI/CD | GitHub Actions |
| App | Node.js + Express |

---

## 📁 Project Structure

ec2-to-eks-migration/
├── app/ # Node.js FoodRush application
│ ├── index.js
│ └── package.json
├── docker/ # Dockerfile
│ └── Dockerfile
├── helm/ # Helm chart for Kubernetes deployment
│ ├── Chart.yaml
│ ├── values.yaml
│ └── templates/
│ ├── deployment.yaml
│ └── service.yaml
├── terraform/
│ ├── ec2/ # EC2 infrastructure (Phase 1)
│ │ ├── main.tf
│ │ ├── variables.tf
│ │ ├── outputs.tf
│ │ └── backend.tf
│ └── eks/ # EKS infrastructure (Phase 2)
│ ├── main.tf
│ ├── variables.tf
│ ├── outputs.tf
│ └── backend.tf
├── .github/workflows/ # GitHub Actions CI/CD
└── screenshots/ # Migration proof screenshots


---

## 🚀 How to Run

### Prerequisites
- AWS CLI configured
- Terraform installed
- kubectl installed
- Helm installed
- Docker installed

### Phase 1 — Deploy on EC2
```bash
cd terraform/ec2
terraform init
terraform apply
# App available at http://<ec2-public-ip>:3000
```

### Phase 2 — Deploy on EKS
```bash
cd terraform/eks
terraform init
terraform apply

# Connect kubectl
aws eks update-kubeconfig --name foodrush-eks --region ap-south-1

# Deploy with Helm
helm upgrade --install foodrush helm/ --set env.APP_ENV=EKS

# Get LoadBalancer URL
kubectl get svc
```

### Cleanup (to avoid AWS costs)
```bash
# Remove Helm release
helm uninstall foodrush

# Destroy EKS
cd terraform/eks && terraform destroy

# Destroy EC2
cd terraform/ec2 && terraform destroy
```

---

## ✅ Key Achievements

- Migrated app from EC2 to EKS with **zero downtime**
- Provisioned entire infrastructure using **Terraform IaC**
- Deployed using **Helm** charts with environment-specific values
- Containerized app with **Docker** — image on GHCR
- Demonstrated **GitOps** principles throughout

---

## 👨‍💻 Author

**Harish P Rao** — SRE & DevOps Engineer  
[LinkedIn](https://linkedin.com/in/harishrao-1512/) | 
[GitHub](https://github.com/harishrao9)