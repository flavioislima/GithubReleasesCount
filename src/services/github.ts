import axios from 'axios';
import type { GitHubRelease } from '../types/github';

const GITHUB_API_BASE = 'https://api.github.com';
export const NO_EXTENSION = 'no extension';

export async function fetchReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
  const allReleases: GitHubRelease[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      const response = await axios.get<GitHubRelease[]>(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/releases`,
        {
          params: { page, per_page: perPage },
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      const releases = response.data;
      
      if (releases.length === 0) {
        break;
      }

      allReleases.push(...releases);
      
      if (releases.length < perPage) {
        break;
      }
      
      page++;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`Repository "${owner}/${repo}" not found`);
        }
        throw new Error(`GitHub API error: ${error.response?.status} ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  }

  return allReleases;
}

export function getFileExtension(filename: string): string {
  const match = filename.match(/\.([^.]+)$/);
  return match ? `.${match[1].toLowerCase()}` : NO_EXTENSION;
}
