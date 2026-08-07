variable "region" {
  default = "ap-south-1"
}

variable "ami_id" {
  description = "Amazon Linux 2 AMI for ap-south-1"
  default     = "ami-0f5ee92e2d63afc18"
}

variable "key_name" {
  description = "Your EC2 Key Pair name"
  default     = "foodrush-key"
}