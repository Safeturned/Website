# Safeturned WebSite

A web application for scanning and analyzing Unturned server plugins for security threats and backdoors.

## What is Safeturned?

Safeturned is a security tool designed specifically for Unturned server administrators. It helps you identify malicious plugins that could compromise your server by performing deep static analysis of plugin source code.

## Features

The application provides several key capabilities:

Code Analysis - Deep static analysis of plugin source code for suspicious patterns
Threat Detection - Detection of backdoors, trojans and other malicious components  
Fast Scanning - Analysis results in seconds with detailed reports
Mobile Friendly - Responsive design that works on all devices
Multi-language Support - Available in English and Russian

## Tech Stack

Frontend: Next.js 14 with App Router
Styling: Tailwind CSS
Language: TypeScript
Deployment: Docker ready

## Getting Started

### Prerequisites

Node.js 18+ or Bun
npm, yarn, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Safeturned/WebSite.git
cd WebSite
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker

You can also run the application using Docker:

```bash
docker-compose up
```

## How it Works

1. Upload Plugin - Upload your .dll plugin file through the web interface
2. Code Analysis - Our system analyzes the code for suspicious functions and patterns
3. Get Results - Receive a detailed report with security assessment and recommendations

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This site is not affiliated with Smartly Dressed Games or Unturned. Unturned® is a registered trademark or trademark of Smartly Dressed Games Ltd. in the United States, Canada, and other countries.