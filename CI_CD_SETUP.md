# CI/CD Pipeline Setup Guide

This guide explains how to set up automatic deployments using GitHub Actions.

## 🚀 Available Workflows

### 1. **Full Stack Deployment** (`deploy-full-stack.yml`)

- **Trigger**: Push to `main` branch or manual trigger
- **What it does**:
  1. Builds and deploys backend to Cloud Run
  2. Runs database migrations
  3. Builds and deploys frontend to Firebase
  4. Outputs deployment summary

### 2. **Backend Only** (`deploy-backend.yml`)

- **Trigger**: Push to `main` with changes in `backend/**`
- **What it does**:

  1. Builds Docker image
  2. Pushes to Google Container Registry
  3. Deploys to Cloud Run
  4. Runs database migrations

  **Workflow file**: `.github/workflows/deploy-backend-cloudrun.yml`

  **Secrets used**: `GCP_SA_KEY`, `GCP_PROJECT_ID`, `CLOUD_SQL_CONNECTION_NAME`, `walvee-backend-env` (Secret Manager)

### 3. **Frontend Only** (`deploy-frontend.yml`)

- **Trigger**: Push to `main` with changes in `frontend/**`
- **What it does**:

  1. Builds React app with Vite
  2. Deploys to Firebase Hosting

  **Workflow file**: `.github/workflows/deploy-frontend-firebase.yml`

  **Secrets used**: `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_PROJECT_ID`, `VITE_API_URL`, `VITE_GOOGLE_MAPS_API_KEY`

### 4. **Backend Tests** (`test-backend.yml`)

- **Trigger**: Push/PR to `main` or `develop` with backend changes
- **What it does**:
  1. Sets up MySQL test database
  2. Runs linter
  3. Runs tests
  4. Validates build

### 5. **Frontend Tests** (`test-frontend.yml`)

- **Trigger**: Push/PR to `main` or `develop` with frontend changes
- **What it does**:
  1. Runs ESLint
  2. Runs tests
  3. Validates production build

## 📋 Prerequisites

Before setting up the pipeline, you need:

1. ✅ Google Cloud Project with billing enabled
2. ✅ Cloud Run API enabled
3. ✅ Cloud SQL instance created
4. ✅ Firebase project configured
5. ✅ GitHub repository with this code

## 🔧 Setup Instructions

### Step 1: Create Google Cloud Service Account

```powershell
# Set your project ID
gcloud config set project walvee-prod

# Create service account
gcloud iam service-accounts create github-actions `
  --display-name="GitHub Actions Deployment"

# Grant necessary roles
gcloud projects add-iam-policy-binding walvee-prod `
  --member="serviceAccount:github-actions@walvee-prod.iam.gserviceaccount.com" `
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding walvee-prod `
  --member="serviceAccount:github-actions@walvee-prod.iam.gserviceaccount.com" `
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding walvee-prod `
  --member="serviceAccount:github-actions@walvee-prod.iam.gserviceaccount.com" `
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding walvee-prod `
  --member="serviceAccount:github-actions@walvee-prod.iam.gserviceaccount.com" `
  --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create github-actions-key.json `
  --iam-account=github-actions@walvee-prod.iam.gserviceaccount.com
```

### Step 2: Create Firebase Service Account

```powershell
# Login to Firebase
firebase login

# Get your Firebase project ID
firebase projects:list

# Create a service account in GCP (same project)
# Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
# Or use CLI:

gcloud iam service-accounts create firebase-github-actions `
  --display-name="Firebase GitHub Actions"

# Grant Firebase roles
gcloud projects add-iam-policy-binding walvee-prod `
  --member="serviceAccount:firebase-github-actions@walvee-prod.iam.gserviceaccount.com" `
  --role="roles/firebase.admin"

# Create key
gcloud iam service-accounts keys create firebase-key.json `
  --iam-account=firebase-github-actions@walvee-prod.iam.gserviceaccount.com
```

### Step 3: Set Up GitHub Secrets

Go to your GitHub repository: **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

| Secret Name                 | Value                                  | How to Get                                                                              |
| --------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| `GCP_PROJECT_ID`            | `walvee-prod`                          | Your GCP project ID                                                                     |
| `GCP_SA_KEY`                | Contents of `github-actions-key.json`  | Copy entire JSON file content                                                           |
| `FIREBASE_SERVICE_ACCOUNT`  | Contents of `firebase-key.json`        | Copy entire JSON file content                                                           |
| `FIREBASE_PROJECT_ID`       | `walvee-prod`                          | Your Firebase project ID                                                                |
| `CLOUD_SQL_CONNECTION_NAME` | `walvee-prod:us-central1:walvee-mysql` | Get with: `gcloud sql instances describe walvee-mysql --format="value(connectionName)"` |
| `VITE_API_URL`              | `https://walvee-backend-xxxxx.run.app` | Your Cloud Run backend URL                                                              |
| `VITE_GOOGLE_MAPS_API_KEY`  | `AIza...`                              | Your Google Maps API key                                                                |

### Step 4: Create Secret Manager Secrets

Store sensitive backend environment variables in Google Secret Manager:

```powershell
# Create a secret for backend environment variables
# First, create a .env.production file with all your backend env vars

# Create the secret
gcloud secrets create walvee-backend-env `
  --data-file=backend/.env.production `
  --replication-policy=automatic

# Grant Cloud Run access to the secret
gcloud secrets add-iam-policy-binding walvee-backend-env `
  --member="serviceAccount:github-actions@walvee-prod.iam.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor"

# Also grant the Cloud Run service account access
PROJECT_NUMBER=$(gcloud projects describe walvee-prod --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding walvee-backend-env `
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor"
```

### Step 5: Test the Pipeline

#### Option A: Push to main branch

```powershell
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
```

#### Option B: Manual trigger

1. Go to GitHub: **Actions** tab
2. Select **Deploy Full Stack (Backend + Frontend)**
3. Click **Run workflow**
4. Select `main` branch
5. Click **Run workflow**

### Step 6: Monitor Deployment

1. Go to **Actions** tab in GitHub
2. Click on the running workflow
3. Watch real-time logs for each job
4. Check deployment summary

## 🔍 Monitoring & Logs

### View GitHub Actions Logs

- Go to **Actions** tab in your GitHub repository
- Click on any workflow run to see detailed logs

### View Cloud Run Logs

```powershell
gcloud run logs read walvee-backend --region us-central1 --limit 50
```

### View Firebase Hosting Status

```powershell
firebase hosting:channel:list
```

## 🛠️ Customization

### Change Deployment Region

Edit the workflow files and change:

```yaml
REGION: us-central1 # Change to your preferred region
```

### Add Environment-Specific Deployments

Create separate workflows for staging:

```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches:
      - develop # Trigger on develop branch
```

### Add Slack Notifications

Add to any workflow job:

```yaml
- name: Slack Notification
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: "Deployment to Cloud Run"
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Add Deployment Approval

For production deployments, add manual approval:

```yaml
jobs:
  deploy:
    environment: production # Create this environment in GitHub
    runs-on: ubuntu-latest
```

Then in GitHub: **Settings → Environments → production → Add required reviewers**

## 🔒 Security Best Practices

1. **Rotate service account keys** every 90 days:

   ```powershell
   gcloud iam service-accounts keys list --iam-account=github-actions@walvee-prod.iam.gserviceaccount.com
   gcloud iam service-accounts keys delete KEY_ID --iam-account=github-actions@walvee-prod.iam.gserviceaccount.com
   ```

2. **Use least privilege**: Only grant necessary IAM roles

3. **Enable branch protection**:

   - Go to **Settings → Branches → Add rule**
   - Require pull request reviews
   - Require status checks to pass

4. **Scan for secrets**: Add secret scanning workflow:
   ```yaml
   - name: TruffleHog Secret Scan
     uses: trufflesecurity/trufflehog@main
   ```

## 🐛 Troubleshooting

### "Permission denied" errors

**Problem**: Service account lacks necessary permissions

**Solution**:

```powershell
# Check current permissions
gcloud projects get-iam-policy walvee-prod `
  --flatten="bindings[].members" `
  --filter="bindings.members:github-actions@walvee-prod.iam.gserviceaccount.com"

# Add missing role
gcloud projects add-iam-policy-binding walvee-prod `
  --member="serviceAccount:github-actions@walvee-prod.iam.gserviceaccount.com" `
  --role="roles/MISSING_ROLE"
```

### "Docker push failed"

**Problem**: Docker authentication or GCR access issues

**Solution**:

```powershell
# Ensure Container Registry API is enabled
gcloud services enable containerregistry.googleapis.com

# Grant storage admin role
gcloud projects add-iam-policy-binding walvee-prod `
  --member="serviceAccount:github-actions@walvee-prod.iam.gserviceaccount.com" `
  --role="roles/storage.admin"
```

### "Cloud SQL connection failed"

**Problem**: Wrong connection name or proxy issues

**Solution**:

```powershell
# Verify connection name
gcloud sql instances describe walvee-mysql --format="value(connectionName)"

# Update GitHub secret: CLOUD_SQL_CONNECTION_NAME
```

### "Firebase deployment failed"

**Problem**: Service account lacks Firebase permissions

**Solution**:

```powershell
# Ensure Firebase Admin SDK API is enabled
gcloud services enable firebase.googleapis.com

# Verify Firebase project
firebase projects:list
```

### Build fails on frontend

**Problem**: Missing environment variables

**Solution**: Check that these secrets are set in GitHub:

- `VITE_API_URL`
- `VITE_GOOGLE_MAPS_API_KEY`

## 📊 Pipeline Metrics

Track your deployment success:

1. **Deployment Frequency**: How often you deploy
2. **Lead Time**: Time from commit to production
3. **MTTR**: Mean time to recovery
4. **Change Failure Rate**: % of deployments causing issues

View in GitHub: **Insights → Actions**

## 🎯 Next Steps

1. ✅ Set up staging environment
2. ✅ Add automated tests
3. ✅ Implement rollback strategy
4. ✅ Set up monitoring alerts
5. ✅ Create runbooks for incidents

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloud Run CI/CD](https://cloud.google.com/run/docs/continuous-deployment)
- [Firebase Hosting GitHub Actions](https://github.com/marketplace/actions/deploy-to-firebase-hosting)

## 💡 Tips

- **Use caching** to speed up builds (already configured)
- **Parallel jobs** for faster deployments (already configured)
- **Manual triggers** for controlled deployments (already available)
- **Branch protection** to prevent broken deployments
- **Deployment previews** for PRs (can be added with Firebase preview channels)
