import type { GitHubRelease } from '../types/github';

const GITHUB_API_BASE = 'https://api.github.com';

export async function fetchReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
  const allReleases: GitHubRelease[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/releases?page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Repository "${owner}/${repo}" not found`);
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const releases: GitHubRelease[] = await response.json();
    
    if (releases.length === 0) {
      break;
    }

    allReleases.push(...releases);
    
    if (releases.length < perPage) {
      break;
    }
    
    page++;
  }

  return allReleases;
}

export function getFileExtension(filename: string): string {
  const match = filename.match(/\.([^.]+)$/);
  return match ? `.${match[1].toLowerCase()}` : 'no extension';
}
