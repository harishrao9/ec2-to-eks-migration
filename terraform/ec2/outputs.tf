output "ec2_public_ip" {
  value       = aws_instance.app.public_ip
  description = "Access the app at http://<this-ip>:3000"
}

output "app_url" {
  value = "http://${aws_instance.app.public_ip}:3000"
}

output "salt_master_ip" {
  value       = aws_instance.app.public_ip
  description = "Salt Master IP — SSH and run salt commands here"
}

output "salt_minion_ip" {
  value       = aws_instance.salt_minion.public_ip
  description = "Salt Minion IP — managed by Salt Master"
}
