/**
 * Local SVG Diagram Generator
 * Creates architecture diagrams without external dependencies
 */

// Generate SVG architecture diagrams locally
export const generateLocalDiagram = (architecture) => {
  const { id, name, services } = architecture;
  
  switch (id) {
    case 'static-spa':
      return generateStaticSPADiagram(services);
    case 'serverless-api':
      return generateServerlessAPIDiagram(services);
    case 'traditional-stack':
      return generateTraditionalStackDiagram(services);
    case 'container-stack':
      return generateContainerStackDiagram(services);
    default:
      return generateGenericDiagram(architecture);
  }
};

const generateStaticSPADiagram = (services) => {
  return `
    <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .service-box { fill: #FF9900; stroke: #232F3E; stroke-width: 2; }
          .storage-box { fill: #569A31; stroke: #232F3E; stroke-width: 2; }
          .text { font-family: Arial, sans-serif; font-size: 14px; fill: #232F3E; text-anchor: middle; }
          .title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #232F3E; text-anchor: middle; }
          .arrow { stroke: #232F3E; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
        </style>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#232F3E" />
        </marker>
      </defs>
      
      <!-- Title -->
      <text x="400" y="30" class="title">Static SPA Hosting Architecture</text>
      
      <!-- User -->
      <circle cx="100" cy="200" r="30" fill="#87CEEB" stroke="#232F3E" stroke-width="2"/>
      <text x="100" y="205" class="text">Users</text>
      
      <!-- Route53 -->
      <rect x="200" y="170" width="100" height="60" rx="5" class="service-box"/>
      <text x="250" y="195" class="text">Route53</text>
      <text x="250" y="210" class="text">(DNS)</text>
      
      <!-- CloudFront -->
      <rect x="350" y="170" width="100" height="60" rx="5" class="service-box"/>
      <text x="400" y="195" class="text">CloudFront</text>
      <text x="400" y="210" class="text">(CDN)</text>
      
      <!-- S3 -->
      <rect x="500" y="170" width="100" height="60" rx="5" class="storage-box"/>
      <text x="550" y="195" class="text">S3 Bucket</text>
      <text x="550" y="210" class="text">(Static Files)</text>
      
      <!-- Arrows -->
      <path d="M 130 200 L 190 200" class="arrow"/>
      <path d="M 300 200 L 340 200" class="arrow"/>
      <path d="M 450 200 L 490 200" class="arrow"/>
      
      <!-- Labels -->
      <text x="160" y="190" class="text" style="font-size: 12px;">DNS Lookup</text>
      <text x="320" y="190" class="text" style="font-size: 12px;">HTTPS</text>
      <text x="470" y="190" class="text" style="font-size: 12px;">Origin Fetch</text>
      
      <!-- Benefits -->
      <text x="400" y="320" class="text" style="font-size: 12px;">✓ Global CDN ✓ Auto-scaling ✓ HTTPS included ✓ Cost-effective</text>
    </svg>
  `;
};

const generateServerlessAPIDiagram = (services) => {
  return `
    <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .service-box { fill: #FF9900; stroke: #232F3E; stroke-width: 2; }
          .database-box { fill: #3F48CC; stroke: #232F3E; stroke-width: 2; }
          .text { font-family: Arial, sans-serif; font-size: 14px; fill: #232F3E; text-anchor: middle; }
          .title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #232F3E; text-anchor: middle; }
          .arrow { stroke: #232F3E; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
        </style>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#232F3E" />
        </marker>
      </defs>
      
      <!-- Title -->
      <text x="400" y="30" class="title">Serverless API Architecture</text>
      
      <!-- Client Apps -->
      <circle cx="100" cy="200" r="30" fill="#87CEEB" stroke="#232F3E" stroke-width="2"/>
      <text x="100" y="205" class="text">Client Apps</text>
      
      <!-- API Gateway -->
      <rect x="200" y="170" width="120" height="60" rx="5" class="service-box"/>
      <text x="260" y="195" class="text">API Gateway</text>
      <text x="260" y="210" class="text">(REST/HTTP)</text>
      
      <!-- Lambda -->
      <rect x="370" y="170" width="120" height="60" rx="5" class="service-box"/>
      <text x="430" y="195" class="text">Lambda</text>
      <text x="430" y="210" class="text">(Functions)</text>
      
      <!-- DynamoDB -->
      <rect x="540" y="170" width="120" height="60" rx="5" class="database-box"/>
      <text x="600" y="195" class="text">DynamoDB</text>
      <text x="600" y="210" class="text">(NoSQL)</text>
      
      <!-- CloudWatch -->
      <rect x="370" y="280" width="120" height="60" rx="5" class="service-box"/>
      <text x="430" y="305" class="text">CloudWatch</text>
      <text x="430" y="320" class="text">(Monitoring)</text>
      
      <!-- Arrows -->
      <path d="M 130 200 L 190 200" class="arrow"/>
      <path d="M 320 200 L 360 200" class="arrow"/>
      <path d="M 490 200 L 530 200" class="arrow"/>
      <path d="M 430 230 L 430 270" class="arrow"/>
      
      <!-- Labels -->
      <text x="160" y="190" class="text" style="font-size: 12px;">API Calls</text>
      <text x="340" y="190" class="text" style="font-size: 12px;">Trigger</text>
      <text x="510" y="190" class="text" style="font-size: 12px;">CRUD</text>
      <text x="450" y="255" class="text" style="font-size: 12px;">Logs</text>
      
      <!-- Benefits -->
      <text x="400" y="420" class="text" style="font-size: 12px;">✓ Pay per request ✓ Auto-scaling ✓ No server management ✓ Built-in monitoring</text>
    </svg>
  `;
};

const generateTraditionalStackDiagram = (services) => {
  return `
    <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .service-box { fill: #FF9900; stroke: #232F3E; stroke-width: 2; }
          .database-box { fill: #3F48CC; stroke: #232F3E; stroke-width: 2; }
          .storage-box { fill: #569A31; stroke: #232F3E; stroke-width: 2; }
          .text { font-family: Arial, sans-serif; font-size: 14px; fill: #232F3E; text-anchor: middle; }
          .title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #232F3E; text-anchor: middle; }
          .arrow { stroke: #232F3E; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
        </style>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#232F3E" />
        </marker>
      </defs>
      
      <!-- Title -->
      <text x="400" y="30" class="title">Traditional Stack Architecture</text>
      
      <!-- Users -->
      <circle cx="100" cy="200" r="30" fill="#87CEEB" stroke="#232F3E" stroke-width="2"/>
      <text x="100" y="205" class="text">Users</text>
      
      <!-- ALB -->
      <rect x="200" y="170" width="100" height="60" rx="5" class="service-box"/>
      <text x="250" y="195" class="text">ALB</text>
      <text x="250" y="210" class="text">(Load Balancer)</text>
      
      <!-- EC2 Instances -->
      <rect x="350" y="120" width="80" height="50" rx="5" class="service-box"/>
      <text x="390" y="140" class="text">EC2</text>
      <text x="390" y="155" class="text">Instance 1</text>
      
      <rect x="350" y="220" width="80" height="50" rx="5" class="service-box"/>
      <text x="390" y="240" class="text">EC2</text>
      <text x="390" y="255" class="text">Instance 2</text>
      
      <!-- RDS -->
      <rect x="500" y="170" width="100" height="60" rx="5" class="database-box"/>
      <text x="550" y="195" class="text">RDS</text>
      <text x="550" y="210" class="text">(MySQL)</text>
      
      <!-- S3 -->
      <rect x="500" y="280" width="100" height="60" rx="5" class="storage-box"/>
      <text x="550" y="305" class="text">S3</text>
      <text x="550" y="320" class="text">(Files)</text>
      
      <!-- Arrows -->
      <path d="M 130 200 L 190 200" class="arrow"/>
      <path d="M 300 190 L 340 155" class="arrow"/>
      <path d="M 300 210 L 340 245" class="arrow"/>
      <path d="M 430 145 L 490 190" class="arrow"/>
      <path d="M 430 245 L 490 210" class="arrow"/>
      <path d="M 430 255 L 490 305" class="arrow"/>
      
      <!-- Labels -->
      <text x="160" y="190" class="text" style="font-size: 12px;">HTTPS</text>
      <text x="320" y="175" class="text" style="font-size: 12px;">Balance</text>
      <text x="460" y="170" class="text" style="font-size: 12px;">DB</text>
      <text x="460" y="280" class="text" style="font-size: 12px;">Files</text>
      
      <!-- Benefits -->
      <text x="400" y="420" class="text" style="font-size: 12px;">✓ Full control ✓ Predictable performance ✓ Any technology ✓ Easy debugging</text>
    </svg>
  `;
};

const generateContainerStackDiagram = (services) => {
  return `
    <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .service-box { fill: #FF9900; stroke: #232F3E; stroke-width: 2; }
          .database-box { fill: #3F48CC; stroke: #232F3E; stroke-width: 2; }
          .container-box { fill: #FF9900; stroke: #232F3E; stroke-width: 2; stroke-dasharray: 5,5; }
          .text { font-family: Arial, sans-serif; font-size: 14px; fill: #232F3E; text-anchor: middle; }
          .title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #232F3E; text-anchor: middle; }
          .arrow { stroke: #232F3E; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
        </style>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#232F3E" />
        </marker>
      </defs>
      
      <!-- Title -->
      <text x="400" y="30" class="title">Container Platform Architecture</text>
      
      <!-- Users -->
      <circle cx="100" cy="200" r="30" fill="#87CEEB" stroke="#232F3E" stroke-width="2"/>
      <text x="100" y="205" class="text">Users</text>
      
      <!-- ALB -->
      <rect x="200" y="170" width="100" height="60" rx="5" class="service-box"/>
      <text x="250" y="195" class="text">ALB</text>
      <text x="250" y="210" class="text">(Load Balancer)</text>
      
      <!-- ECS Cluster -->
      <rect x="330" y="100" width="200" height="200" rx="10" fill="none" stroke="#232F3E" stroke-width="3" stroke-dasharray="10,5"/>
      <text x="430" y="120" class="text" style="font-weight: bold;">ECS Cluster</text>
      
      <!-- Fargate Tasks -->
      <rect x="350" y="140" width="80" height="50" rx="5" class="container-box"/>
      <text x="390" y="160" class="text">Fargate</text>
      <text x="390" y="175" class="text">Task 1</text>
      
      <rect x="350" y="220" width="80" height="50" rx="5" class="container-box"/>
      <text x="390" y="240" class="text">Fargate</text>
      <text x="390" y="255" class="text">Task 2</text>
      
      <!-- RDS -->
      <rect x="580" y="170" width="100" height="60" rx="5" class="database-box"/>
      <text x="630" y="195" class="text">RDS</text>
      <text x="630" y="210" class="text">(PostgreSQL)</text>
      
      <!-- ECR -->
      <rect x="350" y="320" width="80" height="50" rx="5" class="service-box"/>
      <text x="390" y="340" class="text">ECR</text>
      <text x="390" y="355" class="text">(Registry)</text>
      
      <!-- Arrows -->
      <path d="M 130 200 L 190 200" class="arrow"/>
      <path d="M 300 200 L 320 200" class="arrow"/>
      <path d="M 430 165 L 570 190" class="arrow"/>
      <path d="M 430 245 L 570 210" class="arrow"/>
      <path d="M 390 270 L 390 310" class="arrow"/>
      
      <!-- Labels -->
      <text x="160" y="190" class="text" style="font-size: 12px;">HTTPS</text>
      <text x="310" y="190" class="text" style="font-size: 12px;">Route</text>
      <text x="500" y="180" class="text" style="font-size: 12px;">DB Access</text>
      <text x="410" y="295" class="text" style="font-size: 12px;">Pull Images</text>
      
      <!-- Benefits -->
      <text x="400" y="450" class="text" style="font-size: 12px;">✓ Container benefits ✓ Auto-scaling ✓ No server management ✓ Easy CI/CD</text>
    </svg>
  `;
};

const generateGenericDiagram = (architecture) => {
  return `
    <svg viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .service-box { fill: #FF9900; stroke: #232F3E; stroke-width: 2; }
          .text { font-family: Arial, sans-serif; font-size: 14px; fill: #232F3E; text-anchor: middle; }
          .title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #232F3E; text-anchor: middle; }
        </style>
      </defs>
      
      <!-- Title -->
      <text x="400" y="30" class="title">${architecture.name}</text>
      
      <!-- Generic AWS Services -->
      <rect x="300" y="100" width="200" height="100" rx="10" class="service-box"/>
      <text x="400" y="140" class="text">AWS Services</text>
      <text x="400" y="160" class="text">${architecture.description}</text>
      
      <!-- User -->
      <circle cx="100" cy="150" r="30" fill="#87CEEB" stroke="#232F3E" stroke-width="2"/>
      <text x="100" y="155" class="text">Users</text>
      
      <!-- Arrow -->
      <path d="M 130 150 L 290 150" stroke="#232F3E" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
      
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#232F3E" />
      </marker>
    </svg>
  `;
};

export default {
  generateLocalDiagram
};