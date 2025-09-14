/**
 * Architecture Diagram Generator using Kroki API
 * Generates PlantUML diagrams for AWS architectures
 */

// Base64 encoding for URL-safe transmission
const encodeBase64 = (str) => {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Generate PlantUML code for different architecture patterns
const generatePlantUMLCode = (architecture) => {
  const { id, services } = architecture;
  
  switch (id) {
    case 'static-spa':
      return `
@startuml
!theme aws-orange
skinparam backgroundColor transparent
skinparam defaultFontColor #232F3E

title Static SPA Hosting Architecture

actor "Users\\nWorldwide" as users #lightblue
rectangle "Route53\\n(DNS)" as r53 #FF9900
rectangle "CloudFront\\n(Global CDN)" as cf #FF9900
rectangle "S3 Bucket\\n(Static Hosting)" as s3 #569A31
rectangle "Certificate Manager\\n(SSL/TLS)" as acm #FF9900

users --> r53 : DNS Lookup
r53 --> cf : Route to CDN
cf --> s3 : Origin Fetch
acm --> cf : SSL Certificate

note right of s3
  • Static Files (HTML, CSS, JS)
  • Website Hosting Enabled
  • Public Read Access
end note

note right of cf
  • Global Edge Locations
  • HTTPS Redirect
  • Caching & Compression
end note

@enduml`;

    case 'serverless-api':
      return `
@startuml
!theme aws-orange
skinparam backgroundColor transparent
skinparam defaultFontColor #232F3E

title Serverless API Architecture

actor "Client Apps" as clients #lightblue
rectangle "API Gateway\\n(REST/HTTP)" as apigw #FF9900
rectangle "Lambda Function\\n(Business Logic)" as lambda #FF9900
database "DynamoDB\\n(NoSQL)" as dynamo #3F48CC
rectangle "CloudWatch\\n(Monitoring)" as cw #FF9900
rectangle "IAM Roles\\n(Security)" as iam #FF9900

clients --> apigw : HTTPS API Calls
apigw --> lambda : Event Trigger
lambda --> dynamo : CRUD Operations
lambda --> cw : Logs & Metrics
iam --> lambda : Execution Role
iam --> dynamo : Access Permissions

note right of lambda
  • Auto Scaling (0 to 1000s)
  • Pay per Request
  • No Server Management
end note

note right of dynamo
  • Single-digit ms latency
  • Auto Scaling
  • Global Tables
end note

@enduml`;

    case 'traditional-stack':
      return `
@startuml
!theme aws-orange
skinparam backgroundColor transparent
skinparam defaultFontColor #232F3E
skinparam rectangleFontColor #232F3E
skinparam databaseFontColor #232F3E

title Traditional Stack Architecture

actor "Users" as users #lightblue
rectangle "Application\\nLoad Balancer" as alb #FF9900
rectangle "EC2 Instance\\n(Auto Scaling)" as ec2_1 #FF9900
rectangle "EC2 Instance\\n(Auto Scaling)" as ec2_2 #FF9900
database "RDS MySQL\\n(Multi-AZ)" as rds #3F48CC
rectangle "S3 Bucket\\n(Static Assets)" as s3 #569A31

users --> alb : HTTPS Traffic
alb --> ec2_1 : Load Balance
alb --> ec2_2 : Load Balance
ec2_1 --> rds : Database Queries
ec2_2 --> rds : Database Queries
ec2_1 --> s3 : Static Files
ec2_2 --> s3 : Static Files

note right of alb
  • SSL Termination
  • Health Checks
  • Auto Scaling Target
end note

note right of rds
  • Automated Backups
  • Multi-AZ Deployment
  • Read Replicas
end note

@enduml`;

    case 'container-stack':
      return `
@startuml
!theme aws-orange
skinparam backgroundColor transparent
skinparam defaultFontColor #232F3E

title Container Platform Architecture

actor "Users" as users #lightblue
rectangle "Application\\nLoad Balancer" as alb #FF9900
rectangle "ECS Cluster\\n(Orchestration)" as ecs #FF9900
rectangle "Fargate Task 1\\n(Container)" as fargate1 #FF9900
rectangle "Fargate Task 2\\n(Container)" as fargate2 #FF9900
database "RDS Database\\n(PostgreSQL)" as rds #3F48CC
rectangle "ECR\\n(Container Registry)" as ecr #FF9900

users --> alb : HTTPS Traffic
alb --> ecs : Route Requests
ecs --> fargate1 : Task Management
ecs --> fargate2 : Task Management
fargate1 --> rds : Database Access
fargate2 --> rds : Database Access
ecr --> fargate1 : Pull Images
ecr --> fargate2 : Pull Images

note right of fargate1
  • Serverless Containers
  • Auto Scaling
  • No EC2 Management
end note

note right of ecs
  • Service Discovery
  • Load Balancing
  • Health Monitoring
end note

@enduml`;

    default:
      return `
@startuml
!theme aws-orange
skinparam backgroundColor transparent

actor User
rectangle "AWS Services" as aws #FF9900

User --> aws : Requests

note right of aws
  ${architecture.name}
  ${architecture.description}
end note

@enduml`;
  }
};

// Generate diagram URL using Kroki API
export const generateDiagramUrl = (architecture, format = 'svg') => {
  try {
    const plantUMLCode = generatePlantUMLCode(architecture);
    const encoded = encodeBase64(plantUMLCode);
    return `https://kroki.io/plantuml/${format}/${encoded}`;
  } catch (error) {
    console.error('Failed to generate diagram URL:', error);
    return null;
  }
};

// Generate diagram with error handling and fallback
export const generateArchitectureDiagram = async (architecture, format = 'svg') => {
  try {
    const url = generateDiagramUrl(architecture, format);
    if (!url) throw new Error('Failed to generate diagram URL');
    
    // Test if the URL is accessible
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) throw new Error('Diagram service unavailable');
    
    return {
      url,
      alt: `Architecture diagram for ${architecture.name}`,
      title: `${architecture.name} Architecture`
    };
  } catch (error) {
    console.error('Diagram generation failed:', error);
    
    // Return fallback diagram
    return {
      url: null,
      alt: `Architecture diagram for ${architecture.name}`,
      title: `${architecture.name} Architecture`,
      fallback: true,
      error: error.message
    };
  }
};

// Preload diagram for better UX
export const preloadDiagram = (architecture) => {
  const url = generateDiagramUrl(architecture);
  if (url) {
    const img = new Image();
    img.src = url;
  }
};

export default {
  generateDiagramUrl,
  generateArchitectureDiagram,
  preloadDiagram
};