terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# Use existing VPC data or create new
resource "aws_vpc" "eks" {
  cidr_block           = "10.1.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "foodrush-eks-vpc" }
}

resource "aws_internet_gateway" "eks" {
  vpc_id = aws_vpc.eks.id
  tags   = { Name = "foodrush-eks-igw" }
}

resource "aws_subnet" "eks_a" {
  vpc_id                  = aws_vpc.eks.id
  cidr_block              = "10.1.1.0/24"
  availability_zone       = "${var.region}a"
  map_public_ip_on_launch = true
  tags = {
    Name                                        = "foodrush-eks-subnet-a"
    "kubernetes.io/cluster/foodrush-eks"        = "shared"
    "kubernetes.io/role/elb"                    = "1"
  }
}

resource "aws_subnet" "eks_b" {
  vpc_id                  = aws_vpc.eks.id
  cidr_block              = "10.1.2.0/24"
  availability_zone       = "${var.region}b"
  map_public_ip_on_launch = true
  tags = {
    Name                                        = "foodrush-eks-subnet-b"
    "kubernetes.io/cluster/foodrush-eks"        = "shared"
    "kubernetes.io/role/elb"                    = "1"
  }
}

resource "aws_route_table" "eks" {
  vpc_id = aws_vpc.eks.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.eks.id
  }
}

resource "aws_route_table_association" "eks_a" {
  subnet_id      = aws_subnet.eks_a.id
  route_table_id = aws_route_table.eks.id
}

resource "aws_route_table_association" "eks_b" {
  subnet_id      = aws_subnet.eks_b.id
  route_table_id = aws_route_table.eks.id
}

# IAM Role for EKS Cluster
resource "aws_iam_role" "eks_cluster" {
  name = "foodrush-eks-cluster-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster.name
}

# IAM Role for Node Group
resource "aws_iam_role" "eks_nodes" {
  name = "foodrush-eks-node-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_worker_node" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_nodes.name
}

resource "aws_iam_role_policy_attachment" "eks_cni" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_nodes.name
}

resource "aws_iam_role_policy_attachment" "eks_ecr" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_nodes.name
}

# EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = "foodrush-eks"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "1.32"

  vpc_config {
    subnet_ids = [aws_subnet.eks_a.id, aws_subnet.eks_b.id]
  }

  depends_on = [aws_iam_role_policy_attachment.eks_cluster_policy]
  tags = { Name = "foodrush-eks" }
}

# Node Group (t3.micro — minimal cost)
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "foodrush-nodes"
  node_role_arn   = aws_iam_role.eks_nodes.arn
  subnet_ids      = [aws_subnet.eks_a.id, aws_subnet.eks_b.id]
  instance_types  = ["t3.micro"]

  scaling_config {
    desired_size = 2
    min_size     = 1
    max_size     = 3
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node,
    aws_iam_role_policy_attachment.eks_cni,
    aws_iam_role_policy_attachment.eks_ecr,
  ]
  tags = { Name = "foodrush-node-group" }
}