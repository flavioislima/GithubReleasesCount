import type { GitHubRelease } from '../types/github';

const GITHUB_API_BASE = 'https://api.github.com';
export const NO_EXTENSION = 'no extension';

export async function fetchReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
  const allReleases: GitHubRelease[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = new URL(`${GITHUB_API_BASE}/repos/${owner}/${repo}/releases`);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('per_page', perPage.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

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
  return match ? `.${match[1].toLowerCase()}` : NO_EXTENSION;
}
