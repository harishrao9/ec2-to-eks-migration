output "ec2_public_ip" {
  value       = aws_instance.app.public_ip
  description = "Access the app at http://<this-ip>:3000"
}

output "app_url" {
  value = "http://${aws_instance.app.public_ip}:3000"
}