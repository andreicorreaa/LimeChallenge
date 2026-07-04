# AWS Production Deployment Guide

This document outlines the architecture and step-by-step procedure for deploying the **AI Scribe Notes Management Tool** to a secure, scalable, production-ready AWS environment.

---

## 🏗️ Production Target Architecture

The recommended production setup leverages serverless and managed container services to minimize overhead while ensuring high availability, security, and performance.

```
                  ┌─────────────────┐
                  │   CloudFront    │ (CDN)
                  └────────┬────────┘
             ┌─────────────┴─────────────┐
             ▼                           ▼
      ┌─────────────┐             ┌─────────────┐
      │  S3 Bucket  │             │  ALB (HTTPS)│
      │ (Static UI) │             └──────┬──────┘
      └─────────────┘                    ▼
                                  ┌─────────────┐
                                  │ ECS Fargate │ (NestJS Backend)
                                  └──────┬──────┘
                            ┌────────────┴────────────┐
                            ▼                         ▼
                     ┌─────────────┐           ┌─────────────┐
                     │   RDS PG    │           │  S3 Bucket  │
                     │ (Database)  │           │ (Recordings)│
                     └─────────────┘           └─────────────┘
```

*   **Frontend**: Hosted in an **AWS S3 Bucket** configured for static website hosting, served globally via **AWS CloudFront** (CDN) with SSL/TLS termination.
*   **Routing**: CloudFront Routing Rules direct `/graphql`, `/health`, and `/uploads` paths to the Application Load Balancer (ALB), while serving frontend assets for other paths.
*   **Backend**: Deployed inside **AWS ECS (Elastic Container Service)** using serverless **Fargate** tasks, distributed across multiple Availability Zones behind an ALB.
*   **Database**: Managed **AWS RDS PostgreSQL** instance with automated backups and Multi-AZ replication.
*   **File Storage**: Managed **AWS S3 Bucket** for clinical audio recordings, using lifecycle rules to archive files to Glacier.
*   **Security & Secrets**: AWS Secrets Manager, IAM roles (using the principle of least privilege), and security groups to isolate database traffic within private subnets.

---

## 🚀 Step-by-Step Deployment Guide

### Step 1: Configure AWS S3 Bucket for Audio
1.  Open the AWS S3 Console and create a bucket (e.g., `clinical-scribe-recordings`).
2.  Enable **Bucket Versioning** for data preservation.
3.  Configure **Default Encryption** using SSE-S3 or AWS KMS.
4.  Ensure **Block all public access** is enabled (audio files will be securely served via S3 Pre-signed URLs generated dynamically by the backend).

### Step 2: Provision RDS PostgreSQL Database
1.  Open the AWS RDS Console and select **Create Database**.
2.  Choose **PostgreSQL** (version 16 or newer).
3.  Select the **Production** template (with Multi-AZ deployment for failover protection).
4.  Configure private subnets inside your VPC. Ensure **Publicly Accessible** is set to **No**.
5.  Set database master username and password, storing them in **AWS Secrets Manager**.

### Step 3: Publish Docker Images to AWS ECR
Create an ECR repository and push the backend Docker image:

```bash
# 1. Login to AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# 2. Create Repository
aws ecr create-repository --repository-name clinical-scribe-backend

# 3. Build & Tag Image
docker build -t clinical-scribe-backend ./backend
docker tag clinical-scribe-backend:latest <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/clinical-scribe-backend:latest

# 4. Push to Registry
docker push <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/clinical-scribe-backend:latest
```

### Step 4: Deploy NestJS Backend to AWS ECS Fargate
1.  **Create an ECS Cluster**: Select *Networking only* (Fargate template).
2.  **Define a Task Definition**:
    *   Launch Type: `FARGATE`.
    *   CPU: `0.5 vCPU`, Memory: `1 GB`.
    *   Define Container: Name: `backend`, Image: `<YOUR_ECR_IMAGE_URL>`.
    *   Map Port `3001` (TCP).
    *   Configure Log Driver: `awslogs` (redirects Pino JSON outputs to CloudWatch logs).
    *   Add Environment Variables (read database connection info, S3 details, and Gemini API keys from AWS Secrets Manager).
3.  **Create ECS Service**:
    *   Launch Type: `FARGATE`.
    *   Number of Tasks: `2` (across different AZs for high availability).
    *   Configure an **Application Load Balancer (ALB)** mapping Port 80/443 listener rules to ECS Target Group on Port 3001.
    *   Assign the ECS Tasks to a security group that allows incoming traffic only from the ALB.
    *   Health Check Path: `/health`.

### Step 5: Deploy React Frontend to S3 and CloudFront
1.  **Build Frontend locally**:
    ```bash
    cd frontend
    yarn build
    ```
2.  **Create Frontend S3 Bucket** (e.g., `clinical-scribe-ui`) and upload all files from the `dist/` directory.
3.  **Configure AWS CloudFront Distribution**:
    *   Set **Origin Domain** to point to the `clinical-scribe-ui` S3 Bucket.
    *   Set Origin Access Control (OAC) so the S3 Bucket remains private and only accessible via CloudFront.
    *   Define Default Cache Behavior (Redirect HTTP to HTTPS).
    *   Configure **Additional Behaviors** to route dynamic paths to the backend ALB:
        *   Path Pattern: `/graphql` -> Target Origin: ALB.
        *   Path Pattern: `/health` -> Target Origin: ALB.
        *   Path Pattern: `/uploads/*` -> Target Origin: ALB (only applicable if local storage strategy is active).
    *   Configure **Custom Error Responses**: Map `404` error codes to `/index.html` with a `200` response code (enables clean client-side routing with React Router).

---

## 🔒 Security Best Practices

1.  **VPC Private Subnets**: Run database and ECS containers inside private subnets with NAT Gateways for outbound internet access (to call the Gemini API).
2.  **Security Group Isolation**:
    *   PostgreSQL DB security group: Allows inbound traffic *only* from the ECS backend security group on port 5432.
    *   ECS Tasks security group: Allows inbound traffic *only* from the ALB security group on port 3001.
3.  **IAM Execution Roles**:
    *   The ECS Task Role should only contain policies to put/get items in S3 (`s3:PutObject`, `s3:GetObject`) restricted to the specific recordings bucket.
    *   Tasks should only have read access to the specific secrets in Secrets Manager.
