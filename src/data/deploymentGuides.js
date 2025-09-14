/**
 * Deployment Guides for AWS Architectures
 * Optimized for dynamic loading and tree shaking
 */

export const deploymentGuides = {
  'static-spa': {
    title: 'Deploy React SPA to AWS S3 + CloudFront',
    estimatedTime: '20 minutes',
    prerequisites: ['AWS CLI installed', 'AWS account configured', 'Node.js installed'],
    steps: [
      {
        title: 'Build your React application',
        description: 'Create production build of your React app',
        commands: ['npm install', 'npm run build'],
        explanation: 'This creates optimized static files in the build/ directory'
      },
      {
        title: 'Create S3 bucket for hosting',
        description: 'Set up S3 bucket with static website hosting',
        commands: [
          'aws s3 mb s3://your-app-bucket-unique-name',
          'aws s3 website s3://your-app-bucket-unique-name --index-document index.html --error-document error.html'
        ],
        explanation: 'Replace "your-app-bucket-unique-name" with a globally unique bucket name'
      },
      {
        title: 'Configure bucket policy for public access',
        description: 'Allow public read access to your website files',
        commands: [
          'echo \'{"Version":"2012-10-17","Statement":[{"Sid":"PublicReadGetObject","Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::your-app-bucket-unique-name/*"}]}\' > bucket-policy.json',
          'aws s3api put-bucket-policy --bucket your-app-bucket-unique-name --policy file://bucket-policy.json'
        ],
        explanation: 'This policy allows anyone to read your website files'
      },
      {
        title: 'Upload files to S3',
        description: 'Sync your build files to the S3 bucket',
        commands: ['aws s3 sync build/ s3://your-app-bucket-unique-name --delete'],
        explanation: 'The --delete flag removes files that no longer exist locally'
      },
      {
        title: 'Set up CloudFront distribution (Optional)',
        description: 'Create CDN for global content delivery and HTTPS',
        commands: ['# Use AWS Console to create CloudFront distribution pointing to your S3 bucket'],
        explanation: 'CloudFront provides faster loading times worldwide and free HTTPS certificates'
      }
    ]
  },
  'serverless-api': {
    title: 'Deploy Node.js API to AWS Lambda',
    estimatedTime: '35 minutes',
    prerequisites: ['AWS CLI installed', 'AWS SAM CLI installed', 'Node.js installed'],
    steps: [
      {
        title: 'Initialize SAM project',
        description: 'Create serverless application template',
        commands: ['sam init --runtime nodejs18.x --name my-api', 'cd my-api'],
        explanation: 'SAM (Serverless Application Model) simplifies Lambda deployment'
      },
      {
        title: 'Configure API Gateway',
        description: 'Set up REST API endpoints in template.yaml',
        commands: ['# Edit template.yaml to define your API routes and Lambda functions'],
        explanation: 'API Gateway handles HTTP requests and routes them to Lambda functions'
      },
      {
        title: 'Install dependencies and build',
        description: 'Install packages and build the application',
        commands: ['npm install', 'sam build'],
        explanation: 'SAM build prepares your code and dependencies for deployment'
      },
      {
        title: 'Deploy the application',
        description: 'Deploy your serverless API to AWS',
        commands: ['sam deploy --guided'],
        explanation: 'The --guided flag helps you configure deployment settings interactively'
      },
      {
        title: 'Test your API',
        description: 'Verify your API is working correctly',
        commands: ['curl https://your-api-id.execute-api.region.amazonaws.com/Prod/hello'],
        explanation: 'Replace the URL with your actual API Gateway endpoint from the deployment output'
      }
    ]
  },
  'traditional-stack': {
    title: 'Deploy Full-Stack App to EC2 with RDS',
    estimatedTime: '90 minutes',
    prerequisites: ['AWS CLI installed', 'SSH key pair created', 'Domain name (optional)'],
    steps: [
      {
        title: 'Launch EC2 instance',
        description: 'Create a virtual server for your application',
        commands: [
          'aws ec2 run-instances --image-id ami-0abcdef1234567890 --count 1 --instance-type t3.small --key-name your-key-pair --security-groups your-security-group'
        ],
        explanation: 'Replace ami-id, key-name, and security-group with your actual values'
      },
      {
        title: 'Set up RDS database',
        description: 'Create managed database instance',
        commands: [
          'aws rds create-db-instance --db-instance-identifier myapp-db --db-instance-class db.t3.micro --engine mysql --master-username admin --master-user-password mypassword --allocated-storage 20'
        ],
        explanation: 'This creates a small MySQL database. Change password and settings as needed'
      },
      {
        title: 'Connect to EC2 and install dependencies',
        description: 'SSH into your server and set up the environment',
        commands: [
          'ssh -i your-key.pem ec2-user@your-ec2-ip',
          'sudo yum update -y',
          'sudo yum install -y nodejs npm git',
          'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash'
        ],
        explanation: 'This installs Node.js and other required tools on your EC2 instance'
      },
      {
        title: 'Deploy your application',
        description: 'Clone and start your application',
        commands: [
          'git clone https://github.com/yourusername/your-app.git',
          'cd your-app',
          'npm install',
          'npm run build',
          'npm start'
        ],
        explanation: 'Replace the git URL with your actual repository'
      },
      {
        title: 'Configure load balancer',
        description: 'Set up Application Load Balancer for high availability',
        commands: ['# Use AWS Console to create ALB and target group pointing to your EC2 instance'],
        explanation: 'ALB distributes traffic and provides health checks for your application'
      }
    ]
  },
  'container-stack': {
    title: 'Deploy Containerized App with ECS Fargate',
    estimatedTime: '60 minutes',
    prerequisites: ['AWS CLI installed', 'Docker installed', 'ECR repository created'],
    steps: [
      {
        title: 'Build and push Docker image',
        description: 'Create container image and push to ECR',
        commands: [
          'docker build -t my-app .',
          'aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com',
          'docker tag my-app:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:latest',
          'docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:latest'
        ],
        explanation: 'Replace the ECR URI with your actual repository URI'
      },
      {
        title: 'Create ECS cluster',
        description: 'Set up container orchestration cluster',
        commands: ['aws ecs create-cluster --cluster-name my-app-cluster'],
        explanation: 'ECS cluster manages your containerized applications'
      },
      {
        title: 'Create task definition',
        description: 'Define how your container should run',
        commands: ['# Create task-definition.json with your container configuration', 'aws ecs register-task-definition --cli-input-json file://task-definition.json'],
        explanation: 'Task definition specifies CPU, memory, and networking for your container'
      },
      {
        title: 'Create ECS service',
        description: 'Deploy and maintain desired number of tasks',
        commands: ['aws ecs create-service --cluster my-app-cluster --service-name my-app-service --task-definition my-app:1 --desired-count 2 --launch-type FARGATE'],
        explanation: 'ECS service ensures your application stays running and handles scaling'
      }
    ]
  }
};

export default deploymentGuides;