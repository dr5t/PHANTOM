// =============================================================================
// PHANTOM Server — In-Memory Repository Store
// =============================================================================

import type { AnalyzedRepository } from './types.js';

class RepoStore {
  private repos: Map<string, AnalyzedRepository> = new Map();

  addRepo(repo: AnalyzedRepository): void {
    this.repos.set(repo.id, repo);
  }

  getRepo(id: string): AnalyzedRepository | undefined {
    return this.repos.get(id);
  }

  getAllRepos(): AnalyzedRepository[] {
    return Array.from(this.repos.values());
  }

  findByPath(repoPath: string): AnalyzedRepository | undefined {
    return this.getAllRepos().find((r) => r.path === repoPath);
  }

  removeRepo(id: string): boolean {
    return this.repos.delete(id);
  }

  clear(): void {
    this.repos.clear();
  }
}

export const store = new RepoStore();
