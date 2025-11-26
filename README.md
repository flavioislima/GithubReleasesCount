# GitHub Releases Download Counter

A web application that reads GitHub repository releases and calculates the total number of times assets were downloaded.

## Features

- **Repository Input**: Enter any public GitHub repository in the format `owner/repo` (e.g., `facebook/react`)
- **Download Statistics**: View total downloads, number of releases, and number of assets
- **Extension Filter**: Skip specific file types (like `.yml`, `.yaml`) from the statistics
- **File Type Chart**: Pie chart showing downloads breakdown by file extension
- **Time-based Chart**: Line chart showing downloads over time with date range options:
  - Last 24 Hours
  - Last Week
  - Last Month
  - Last 365 Days

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Chart.js** with react-chartjs-2 for charts
- **date-fns** for date manipulation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. Enter a GitHub repository in the format `owner/repo`
2. Click "Fetch" to load the release data
3. Use the extension filter to exclude specific file types from statistics
4. View the charts for insights on download patterns

## Screenshots

![Initial UI](https://github.com/user-attachments/assets/e618874d-614b-44fe-8af8-0df02ba1abbd)

## License

MIT License - see [LICENSE](LICENSE) file for details.
