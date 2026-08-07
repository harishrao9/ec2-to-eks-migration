terraform {
  backend "s3" {
    bucket         = "foodrush-tfstate-harishrao9"
    key            = "ec2/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "foodrush-tfstate-lock"
    encrypt        = true
  }
}