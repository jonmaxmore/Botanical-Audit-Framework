# ============================================================================
# Import Existing AWS Resources to Terraform
# PowerShell Script
# ============================================================================

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Import Existing AWS Resources to Terraform              ║" -ForegroundColor Yellow
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ------------------------------
# Configuration
# ------------------------------

$AWS_REGION = "ap-southeast-1"
$EXISTING_VPC_ID = "vpc-03768ea49251845c3"
$EXISTING_SUBNET_ID = "subnet-0a9aedf2d5d4793b4"
$EXISTING_INSTANCE_ID = "i-036cad13893eb6511"
$AWS_ACCOUNT_ID = "426322450594"

Write-Host "📊 Existing Resources:" -ForegroundColor Yellow
Write-Host "   VPC ID:      $EXISTING_VPC_ID" -ForegroundColor Gray
Write-Host "   Subnet ID:   $EXISTING_SUBNET_ID" -ForegroundColor Gray
Write-Host "   Instance ID: $EXISTING_INSTANCE_ID" -ForegroundColor Gray
Write-Host "   Region:      $AWS_REGION" -ForegroundColor Gray
Write-Host "   Account:     $AWS_ACCOUNT_ID`n" -ForegroundColor Gray

# ------------------------------
# Option Selection
# ------------------------------

Write-Host "🎯 Choose Your Approach:`n" -ForegroundColor Yellow
Write-Host "1. ✅ Use Existing Resources (Data Sources - Recommended)" -ForegroundColor Green
Write-Host "   Keep existing resources untouched" -ForegroundColor Gray
Write-Host "   Add new managed resources around them (ALB, S3, Route53, etc.)" -ForegroundColor Gray
Write-Host "   Best for: Adding managed services to existing infrastructure`n" -ForegroundColor Gray

Write-Host "2. 📦 Import Resources to Terraform" -ForegroundColor Cyan
Write-Host "   Bring existing resources under Terraform management" -ForegroundColor Gray
Write-Host "   Full control but requires careful state management" -ForegroundColor Gray
Write-Host "   Best for: Complete infrastructure as code`n" -ForegroundColor Gray

Write-Host "3. 🔄 Hybrid Approach" -ForegroundColor Magenta
Write-Host "   Reference existing VPC/Instance" -ForegroundColor Gray
Write-Host "   Create new Auto Scaling Group with existing instance as template" -ForegroundColor Gray
Write-Host "   Add ALB, S3, monitoring around existing resources" -ForegroundColor Gray
Write-Host "   Best for: Gradual migration to Terraform`n" -ForegroundColor Gray

$choice = Read-Host "Select option (1, 2, or 3)"

switch ($choice) {
    "1" {
        Write-Host "`n✅ Option 1: Using Existing Resources with Data Sources`n" -ForegroundColor Green
        
        Write-Host "📝 Step 1: Update terraform.tfvars" -ForegroundColor Yellow
        Write-Host "   Add these lines to terraform.tfvars:" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   # Use existing VPC" -ForegroundColor Gray
        Write-Host "   use_existing_vpc = true" -ForegroundColor White
        Write-Host "   existing_vpc_id = `"$EXISTING_VPC_ID`"" -ForegroundColor White
        Write-Host "   existing_subnet_ids = [`"$EXISTING_SUBNET_ID`"]" -ForegroundColor White
        Write-Host ""
        Write-Host "   # Reference existing instance (optional)" -ForegroundColor Gray
        Write-Host "   existing_instance_id = `"$EXISTING_INSTANCE_ID`"" -ForegroundColor White
        Write-Host ""
        
        Write-Host "📝 Step 2: Terraform will create:" -ForegroundColor Yellow
        Write-Host "   ✅ Application Load Balancer" -ForegroundColor Green
        Write-Host "   ✅ Target Group (register your existing instance)" -ForegroundColor Green
        Write-Host "   ✅ S3 Buckets (certificates, photos, backups)" -ForegroundColor Green
        Write-Host "   ✅ Route53 DNS + ACM Certificate" -ForegroundColor Green
        Write-Host "   ✅ CloudWatch Monitoring + Alarms" -ForegroundColor Green
        Write-Host "   ✅ Security Groups (ALB, backend rules)" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "📝 Step 3: Deploy" -ForegroundColor Yellow
        Write-Host "   cd infrastructure/terraform" -ForegroundColor White
        Write-Host "   terraform init" -ForegroundColor White
        Write-Host "   terraform plan" -ForegroundColor White
        Write-Host "   terraform apply" -ForegroundColor White
        Write-Host ""
        
        Write-Host "✅ Your existing instance will remain untouched!" -ForegroundColor Green
        Write-Host "🚀 New resources will integrate with it seamlessly.`n" -ForegroundColor Cyan
    }
    
    "2" {
        Write-Host "`n📦 Option 2: Importing Resources to Terraform`n" -ForegroundColor Cyan
        
        Write-Host "⚠️  WARNING: This will bring resources under Terraform management." -ForegroundColor Yellow
        Write-Host "   Any manual changes will be overwritten on next terraform apply!`n" -ForegroundColor Red
        
        Write-Host "📝 Import Commands:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   # Import VPC" -ForegroundColor Gray
        Write-Host "   terraform import module.vpc.aws_vpc.main $EXISTING_VPC_ID" -ForegroundColor White
        Write-Host ""
        Write-Host "   # Import Subnet" -ForegroundColor Gray
        Write-Host "   terraform import module.vpc.aws_subnet.public[0] $EXISTING_SUBNET_ID" -ForegroundColor White
        Write-Host ""
        Write-Host "   # Import EC2 Instance" -ForegroundColor Gray
        Write-Host "   terraform import module.compute.aws_instance.backend $EXISTING_INSTANCE_ID" -ForegroundColor White
        Write-Host ""
        
        Write-Host "📝 Before importing:" -ForegroundColor Yellow
        Write-Host "   1. Backup current state: terraform state pull > backup.tfstate" -ForegroundColor White
        Write-Host "   2. Review resource configuration matches existing" -ForegroundColor White
        Write-Host "   3. Test with terraform plan after import" -ForegroundColor White
        Write-Host ""
        
        Write-Host "💡 Tip: Start with Option 1 (Data Sources) for safer approach.`n" -ForegroundColor Cyan
    }
    
    "3" {
        Write-Host "`n🔄 Option 3: Hybrid Approach`n" -ForegroundColor Magenta
        
        Write-Host "📝 This approach will:" -ForegroundColor Yellow
        Write-Host "   1. Reference your existing VPC (read-only)" -ForegroundColor White
        Write-Host "   2. Keep your existing instance running" -ForegroundColor White
        Write-Host "   3. Create AMI from your instance" -ForegroundColor White
        Write-Host "   4. Create Auto Scaling Group using that AMI" -ForegroundColor White
        Write-Host "   5. Add Application Load Balancer" -ForegroundColor White
        Write-Host "   6. Register both existing and new instances to ALB" -ForegroundColor White
        Write-Host ""
        
        Write-Host "📝 Steps:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Step 1: Create AMI from existing instance" -ForegroundColor White
        Write-Host "   aws ec2 create-image ``" -ForegroundColor Gray
        Write-Host "     --instance-id $EXISTING_INSTANCE_ID ``" -ForegroundColor Gray
        Write-Host "     --name `"botanical-audit-production-$(Get-Date -Format 'yyyyMMdd')`" ``" -ForegroundColor Gray
        Write-Host "     --description `"Production instance snapshot`" ``" -ForegroundColor Gray
        Write-Host "     --region $AWS_REGION" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "   Step 2: Get AMI ID from output, add to terraform.tfvars:" -ForegroundColor White
        Write-Host "   custom_ami_id = `"ami-xxxxx`"" -ForegroundColor Gray
        Write-Host "   use_existing_vpc = true" -ForegroundColor Gray
        Write-Host "   existing_vpc_id = `"$EXISTING_VPC_ID`"" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "   Step 3: Deploy Terraform" -ForegroundColor White
        Write-Host "   terraform apply" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "✅ Result:" -ForegroundColor Green
        Write-Host "   • Existing instance continues running" -ForegroundColor Gray
        Write-Host "   • New instances join via Auto Scaling" -ForegroundColor Gray
        Write-Host "   • Load Balancer distributes traffic" -ForegroundColor Gray
        Write-Host "   • Gradual migration path to full Terraform management`n" -ForegroundColor Gray
    }
    
    default {
        Write-Host "`n❌ Invalid option. Please run script again and choose 1, 2, or 3.`n" -ForegroundColor Red
        exit 1
    }
}

# ------------------------------
# Additional Information
# ------------------------------

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Additional Resources:" -ForegroundColor Yellow
Write-Host "   • EXISTING_RESOURCES.md - Detailed resource information" -ForegroundColor Gray
Write-Host "   • README.md - Complete deployment guide" -ForegroundColor Gray
Write-Host "   • terraform.tfvars.example - Configuration template" -ForegroundColor Gray
Write-Host ""
Write-Host "🆘 Need Help?" -ForegroundColor Yellow
Write-Host "   Documentation: infrastructure/terraform/README.md" -ForegroundColor Gray
Write-Host "   Troubleshooting section included!" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
