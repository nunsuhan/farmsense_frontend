# Deploy Phase 4 Files to Server
$ServerUser = "django"
$ServerIP = "152.42.248.236"
$KeyPath = "C:\Users\한문수\id_han_new"

Write-Host "🚀 Starting Phase 4 Deployment..."

# 1. Ensure directories exist
Write-Host "📂 Creating remote directories..."
ssh -i $KeyPath $ServerUser@$ServerIP "mkdir -p /home/django/django_project/core /home/django/django_project/dss/services /home/django/django_project/static/baselines"

# 2. Upload Files
$Files = @(
    @("local_baseline_loader.py", "/home/django/django_project/core/baseline_loader.py"),
    @("local_core_apps.py", "/home/django/django_project/core/apps.py"),
    @("local_threshold_service.py", "/home/django/django_project/dss/services/threshold_service.py"),
    @("local_sensor_service.py", "/home/django/django_project/dss/services/sensor_service.py"),
    @("local_alert_service.py", "/home/django/django_project/dss/services/alert_service.py"),
    @("local_tasks.py", "/home/django/django_project/dss/tasks.py"),
    @("local_celery.py", "/home/django/django_project/config/celery.py")
)

foreach ($File in $Files) {
    $Local = $File[0]
    $Remote = $File[1]
    Write-Host "📤 Uploading $Local to $Remote..."
    scp -i $KeyPath $Local "$ServerUser@$ServerIP`:$Remote"
}

# 3. Append Settings (Simple Append)
Write-Host "⚙️ Updating settings.py..."
scp -i $KeyPath local_settings_snippet.py "$ServerUser@$ServerIP`:~/temp_settings_snippet.py"
ssh -i $KeyPath $ServerUser@$ServerIP "cat ~/temp_settings_snippet.py >> /home/django/django_project/config/settings.py && rm ~/temp_settings_snippet.py"

Write-Host "✅ Deployment Files Transferred."
Write-Host "⚠️  IMPORTANT: You still need to:"
Write-Host "   1. SSH into the server."
Write-Host "   2. Install Redis: 'sudo apt install redis-server'"
Write-Host "   3. Install requirements: 'pip install celery redis django-celery-beat firebase-admin'"
Write-Host "   4. Upload your 'farm_baselines.json' to '/home/django/django_project/static/baselines/'"
Write-Host "   5. Restart services: 'sudo systemctl restart gunicorn', 'celery -A config worker ...'"
