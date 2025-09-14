# AWS Deploy Assistant

An intelligent AWS deployment analyzer and recommendation engine built with React and Kiro AI.

<img width="1069" height="690" alt="Screenshot 2025-09-14 173251" src="https://github.com/user-attachments/assets/46e2cfcd-39e5-4deb-96cd-270e392c186a" />
<img width="911" height="655" alt="Screenshot 2025-09-14 173213" src="https://github.com/user-attachments/assets/0828b415-f1c3-4e11-9d5b-7b1bed8d0d9c" />




## Features

🔍 **Smart Code Analysis** - Automatically detects React, Node.js, Vue, Python, and full-stack application patterns

🏗️ **Architecture Recommendations** - Suggests optimal AWS services with 4 proven architecture patterns:
- Static SPA Hosting (S3 + CloudFront)
- Serverless API (Lambda + API Gateway)
- Traditional Stack (EC2 + RDS)
- Container Platform (ECS + Fargate)

📊 **Interactive Visualization** - Visual architecture diagrams showing AWS services, costs, and complexity

📋 **Step-by-Step Deployment** - Generated deployment guides with copy-paste commands and explanations

💰 **Advanced Cost Calculator** - Traffic-based cost estimates with optimization tips and breakdowns

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/Eamateli/aws-deploy-assistant.git
cd aws-deploy-assistant
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Start the development server
\`\`\`bash
npm run dev
\`\`\`

4. Open http://localhost:5173 in your browser

### Building for Production
\`\`\`bash
npm run build
\`\`\`

## How It Works

1. **Analyze**: Describe your application or upload code files
2. **Architecture**: Review recommended AWS architectures with pros/cons
3. **Deploy**: Follow step-by-step deployment guides with commands
4. **Costs**: Estimate monthly costs with traffic-based calculations

## Example Applications

Try these example descriptions:
- "React e-commerce app with shopping cart, user authentication, and payment processing using Stripe"
- "Node.js REST API with Express, MongoDB, JWT authentication, and file upload functionality"
- "Full-stack React app with Node.js backend, PostgreSQL database, and real-time chat features"

## Architecture Patterns

### Static SPA Hosting
- **Services**: S3, CloudFront, Route53
- **Cost**: \$5-25/month
- **Best for**: React/Vue SPAs, portfolios, marketing sites

### Serverless API
- **Services**: Lambda, API Gateway, DynamoDB
- **Cost**: \$10-100/month
- **Best for**: REST APIs, microservices, event-driven apps

### Traditional Stack
- **Services**: EC2, ALB, RDS, S3
- **Cost**: \$50-200/month
- **Best for**: Full-stack apps, legacy migrations, custom requirements

### Container Platform
- **Services**: ECS, Fargate, ALB, RDS
- **Cost**: \$75-250/month
- **Best for**: Containerized apps, CI/CD pipelines, scalable services

## Technology Stack

- **React 18** - Modern UI framework with hooks
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Vite** - Fast build tool and dev server

## Development with Kiro

This project showcases spec-driven development using Kiro AI:
- **Requirements** - Comprehensive user stories and acceptance criteria
- **Design** - Detailed technical architecture and component interfaces
- **Implementation** - Actionable coding tasks with clear objectives
- **Quality** - Built-in testing and performance considerations

## Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Kiro AI for spec-driven development
- AWS service information and pricing from AWS Documentation
- Icons by Lucide

## Disclaimer

This tool provides estimates and guidance for AWS deployments. Always verify pricing, test deployments thoroughly, and follow AWS best practices for production applications.

