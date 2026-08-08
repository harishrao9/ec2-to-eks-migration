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

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "foodrush-vpc" }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = { Name = "foodrush-igw" }
}

# Public Subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.region}a"
  map_public_ip_on_launch = true
  tags = { Name = "foodrush-public-subnet" }
}

# Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "foodrush-rt" }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Security Group
resource "aws_security_group" "ec2" {
  name        = "foodrush-ec2-sg"
  description = "Allow HTTP and SSH"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "foodrush-ec2-sg" }
}

# EC2 Instance (Free Tier t2.micro)
resource "aws_instance" "app" {
  ami                    = var.ami_id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = var.key_name

user_data = <<-EOF
  #!/bin/bash
  exec > /var/log/user-data.log 2>&1
  set -x

  # Update packages
  apt-get update -y

  # Install Docker
  apt-get install -y docker.io
  systemctl start docker
  systemctl enable docker

  # Wait for Docker to be ready
  sleep 10

  # Pull and run FoodRush
  docker pull ghcr.io/harishrao9/foodrush:latest
  docker run -d \
    -p 3000:3000 \
    -e APP_ENV=EC2 \
    -e APP_VERSION=1.0.0 \
    --name foodrush \
    --restart always \
    ghcr.io/harishrao9/foodrush:latest

  echo "FoodRush started successfully"
EOF

  tags = { Name = "foodrush-ec2" }
}