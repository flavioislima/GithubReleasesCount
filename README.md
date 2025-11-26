# GitHub Releases Download Counter

A web application that reads GitHub repository releases and calculates the total number of times assets were downloaded.

## Features

- **Repository Input**: Enter any public GitHub repository in the format `owner/repo` (e.g., `facebook/react`)
- **Flathub Integration**: Optionally provide a Flathub App ID to include Flathub download statistics (counted as Linux downloads)
- **Download Statistics**: View total downloads, number of releases, and number of assets
- **Extension Filter**: Skip specific file types (like `.yml`, `.yaml`, `.blockmap`) from the statistics
- **OS Filter**: View downloads grouped by operating system (Windows, macOS, Linux, Other)
- **File Type Chart**: Pie chart showing downloads breakdown by file extension
- **Time-based Chart**: Line chart showing downloads over time with date range options:
  - Last 24 Hours
  - Last Week
  - Last Month
  - Last 365 Days
  - All Time
- **Top 10 Releases**: See the most downloaded releases with clickable rows to view per-file download details
- **Recent Repos**: Quick access to recently searched repositories (stored in localStorage)

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
2. Optionally enter a Flathub App ID (e.g., `com.heroicgameslauncher.hgl`) to include Flathub download statistics
3. Click "Fetch" to load the release data
4. Use the extension filter to exclude specific file types from statistics
5. Use the time range buttons to view downloads over different periods (including All Time)
6. View the OS filter section to see downloads grouped by operating system
7. Click on releases in the Top 10 list to see per-file download details

## Screenshots

![Initial UI](https://github.com/user-attachments/assets/e618874d-614b-44fe-8af8-0df02ba1abbd)

## License

MIT License - see [LICENSE](LICENSE) file for details.
