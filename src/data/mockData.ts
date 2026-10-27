import type { RepositoryItem, MemoryEvent, ResurrectionReport, ModelOption } from '../types';

export const REPOSITORIES: RepositoryItem[] = [
  {
    id: 'nexus-auth-v2',
    name: 'nexus-auth-v2',
    path: '~/Projects/nexus-auth-v2',
    language: 'TypeScript',
    lastActivity: '7 months ago',
    lastActivityTimestamp: '2024-03-18T04:22:11Z',
    daysInactive: 224,
    unfinishedTasksCount: 14,
    status: 'Needs Resurrection',
    commitCount: 83,
    branchesCount: 4,
    stashesCount: 3,
    description: 'Zero-knowledge biometric authentication gateway with OAuth2 & WebAuthn PKCE flow.',
    primaryRisk: 'Breaking changes in @auth0/angular-jwt v5 & unresolved token rotation race condition.',
    abandonReason: 'Stalled during migration from Session cookies to JWT Refresh Tokens after auth race bug.'
  },
  {
    id: 'vector-cache-engine',
    name: 'vector-cache-engine',
    path: '~/Developer/Rust/vector-cache-engine',
    language: 'Rust',
    lastActivity: '11 months ago',
    lastActivityTimestamp: '2023-11-29T19:40:02Z',
    daysInactive: 332,
    unfinishedTasksCount: 8,
    status: 'Memory Ready',
    commitCount: 142,
    branchesCount: 2,
    stashesCount: 1,
    description: 'Embedded SIMD-accelerated HNSW vector index with memory-mapped write-ahead logging.',
    primaryRisk: 'Unsound unsafe block in SIMD dot-product kernel causing MIRI test failure.',
    abandonReason: 'Abandoned when author hit segfault on AVX-512 intrinsic bounds check.'
  },
  {
    id: 'dist-cron-daemon',
    name: 'dist-cron-daemon',
    path: '~/Golang/src/dist-cron-daemon',
    language: 'Go',
    lastActivity: '1 year ago',
    lastActivityTimestamp: '2023-10-14T11:15:30Z',
    daysInactive: 378,
    unfinishedTasksCount: 19,
    status: 'Indexed',
    commitCount: 65,
    branchesCount: 3,
    stashesCount: 4,
    description: 'Distributed fault-tolerant cron scheduler with Raft leader election and Redis backed leasing.',
    primaryRisk: 'Split-brain edge case in Raft cluster re-election when heartbeat drops below 120ms.',
    abandonReason: 'Developer shifted priorities after leader lease flakiness in local Docker cluster.'
  },
  {
    id: 'ghost-kv-store',
    name: 'ghost-kv-store',
    path: '~/Projects/ghost-kv-store',
    language: 'C++',
    lastActivity: '2 years ago',
    lastActivityTimestamp: '2022-09-04T08:50:19Z',
    daysInactive: 780,
    unfinishedTasksCount: 23,
    status: 'Needs Resurrection',
    commitCount: 210,
    branchesCount: 5,
    stashesCount: 6,
    description: 'LSM-tree key-value engine with bloom filter tiering and zero-copy io_uring compaction.',
    primaryRisk: 'File descriptor leak during background SSTable compaction cycles under write pressure.',
    abandonReason: 'Author started rewrite in Rust before finishing the Linux io_uring kernel probe.'
  },
  {
    id: 'whisper-local-stream',
    name: 'whisper-local-stream',
    path: '~/AI/whisper-local-stream',
    language: 'Python',
    lastActivity: '4 months ago',
    lastActivityTimestamp: '2024-06-22T14:12:00Z',
    daysInactive: 127,
    unfinishedTasksCount: 6,
    status: 'Memory Ready',
    commitCount: 47,
    branchesCount: 2,
    stashesCount: 2,
    description: 'Real-time WebSocket audio streaming transcription daemon powered by Whisper.cpp & CoreML.',
    primaryRisk: 'Audio buffer drift after 45 minutes of continuous stream recording on macOS Sonoma.',
    abandonReason: 'Stalled at WebRTC SDP handshake negotiation for microphone multiplexing.'
  }
];

export const GHOST_MEMORY_EVENTS: MemoryEvent[] = [
  {
    id: 'ev-01',
    type: 'commit',
    timestamp: '2024-03-18 04:22:11 UTC',
    relativeTime: '7 months ago',
    commitHash: '9f2a71d',
    author: 'shauryatiwari',
    message: 'wip: handle token rotation edge case when offline [do not merge]',
    fileReference: 'src/auth/provider.ts',
    lineNumber: 142,
    codeSnippet: `// FIXME(shaurya): If network cuts out between POST /refresh and storage write,
// refreshToken is burned on server but client still has old credentials.
// Need atomic retry queue or double-buffered storage token swap!`,
    tags: ['Unfinished Feature', 'High Risk', 'WIP'],
    isFact: true,
    aiInterpretation: 'The developer was stuck on an atomic token desynchronization problem at 4:22 AM right before abandoning the codebase.',
    confidenceScore: 0.94
  },
  {
    id: 'ev-02',
    type: 'stash',
    timestamp: '2024-03-18 04:45:00 UTC',
    relativeTime: '7 months ago',
    author: 'shauryatiwari',
    message: 'WIP on feature/pkce-v2: half-implemented indexedDB persistent vault',
    fileReference: 'src/storage/vault.ts',
    lineNumber: 68,
    codeSnippet: `+ export async function saveEncryptedSession(token: VaultToken): Promise<void> {
+   // TODO: Encrypt using WebCrypto SubtleCrypto with AES-GCM
+   // currently writing raw JSON string to localStorage as placeholder!
+   localStorage.setItem('__temp_session', JSON.stringify(token));
+ }`,
    tags: ['Stashed Work', 'Security Leak'],
    isFact: true,
    aiInterpretation: 'A temporary security compromise was stashed and never cleaned up. Exposes plain tokens in localStorage.',
    confidenceScore: 0.98
  },
  {
    id: 'ev-03',
    type: 'todo',
    timestamp: '2024-02-12 18:04:32 UTC',
    relativeTime: '8 months ago',
    commitHash: '3c8e41b',
    author: 'shauryatiwari',
    message: 'refactor(jwt): isolate payload validation logic',
    fileReference: 'src/tokens/jwt.rs',
    lineNumber: 88,
    todoText: 'TODO(security): Verify RS256 signature against jwks_uri cache before trusting claims',
    tags: ['Security Leak', 'TODO'],
    isFact: true,
    aiInterpretation: 'JWT payload decoding bypassed signature verification in test harness; remains disabled in production code path.',
    confidenceScore: 0.91
  },
  {
    id: 'ev-04',
    type: 'branch_diverge',
    timestamp: '2024-01-20 22:15:10 UTC',
    relativeTime: '9 months ago',
    commitHash: '7a19ff0',
    author: 'shauryatiwari',
    message: 'feat(webauthn): biometric passkey registration scaffolding',
    fileReference: 'src/passkeys/webauthn.ts',
    lineNumber: 215,
    codeSnippet: `const credential = await navigator.credentials.create({
  publicKey: publicKeyCredentialCreationOptions
});
// Reconstruct note: navigator.credentials fails on insecure HTTP contexts.
// No fallback implemented for non-HTTPS dev localhost.`,
    tags: ['Unfinished Feature', 'Stale Branch'],
    isFact: true,
    aiInterpretation: 'Branch feature/passkeys diverged 18 commits from main and was never merged due to missing HTTPS test harness.',
    confidenceScore: 0.88
  },
  {
    id: 'ev-05',
    type: 'dependency_break',
    timestamp: '2023-11-05 14:02:19 UTC',
    relativeTime: '11 months ago',
    commitHash: '1e5b882',
    author: 'dependabot[bot]',
    message: 'build(deps): bump @auth0/angular-jwt from 4.2.1 to 5.0.0',
    fileReference: 'package.json',
    lineNumber: 24,
    tags: ['Breaking Changes', 'Dependency Break'],
    isFact: true,
    aiInterpretation: 'Automated dependency bump introduced breaking API contract change that was never migrated in src/auth/provider.ts.',
    confidenceScore: 0.96
  }
];

export const RESURRECTION_REPORTS: Record<string, ResurrectionReport> = {
  'nexus-auth-v2': {
    repoName: 'nexus-auth-v2',
    overview: 'High-performance WebAuthn & OAuth2 local identity gateway written in TypeScript. Active from Nov 2023 to March 2024 with 83 commits.',
    abandonmentDiagnosis: 'Project halted on March 18, 2024 at 4:45 AM after the author encountered an unrecoverable refresh token desynchronization race condition during offline state transitions, accompanied by an unmerged stash and broken v5 JWT dependency.',
    historicalMilestones: [
      {
        title: 'Nov 12, 2023: Core OAuth2 Authorization Code + PKCE established',
        description: 'Successfully implemented RFC 7636 PKCE code challenge generation with SHA-256.',
        evidence: 'Commit 4d812a0: "feat: implement SHA-256 code challenge RFC 7636"'
      },
      {
        title: 'Jan 15, 2024: WebAuthn Passkeys prototype initiated',
        description: 'Created biometric registration handlers, but stalled on localhost SSL self-signed certificates.',
        evidence: 'Branch feature/passkeys (18 commits ahead, last updated Jan 20, 2024)'
      },
      {
        title: 'March 18, 2024: Late-night token rotation regression & shutdown',
        description: 'Author wrote FIXME warning about burned refresh tokens and created uncommitted stash before closing editor.',
        evidence: 'Stash stash@{0} and commit 9f2a71d: "wip: handle token rotation edge case"'
      }
    ],
    unfinishedFeatures: [
      {
        feature: 'Atomic Double-Buffered Refresh Token Swap',
        completionPct: 75,
        blocker: 'Refresh token is invalidated on server before local IndexedDB transaction commits.',
        files: ['src/auth/provider.ts', 'src/storage/vault.ts']
      },
      {
        feature: 'WebCrypto AES-GCM Encrypted Storage Vault',
        completionPct: 40,
        blocker: 'Code is currently writing raw session JSON to localStorage as temporary fallback.',
        files: ['src/storage/vault.ts']
      },
      {
        feature: 'WebAuthn Localhost Development HTTPS Harness',
        completionPct: 85,
        blocker: 'Requires mkcert or vite-plugin-mkcert for biometric credential registration on localhost.',
        files: ['vite.config.ts', 'src/passkeys/webauthn.ts']
      }
    ],
    potentialIssues: [
      {
        severity: 'high',
        issue: 'Plaintext JWT tokens saved in localStorage under "__temp_session" key in stash@{0}',
        fixCommand: 'phantom fix --security-sanitize-stash 0'
      },
      {
        severity: 'high',
        issue: 'Breaking API changes in @auth0/angular-jwt v5 requires replacing JwtHelperService method signatures',
        fixCommand: 'npm i @auth0/angular-jwt@5.1.2 && phantom patch --dep-migration'
      },
      {
        severity: 'medium',
        issue: 'Uncommitted stash@{0} has 14 unmerged file modifications that conflict with main HEAD',
        fixCommand: 'git stash apply stash@{0} --resolve-theirs'
      }
    ],
    recommendedNextSteps: [
      {
        stepNumber: 1,
        title: 'Apply and isolate stashed security fixes',
        actionCommand: 'git stash branch resurrect/storage-vault stash@{0}',
        explanation: 'Safely branches off the stash without polluting your working tree.'
      },
      {
        stepNumber: 2,
        title: 'Upgrade dependencies and run AST compatibility patch',
        actionCommand: 'npx phantom patch --target=nexus-auth-v2 --fix-jwt-v5',
        explanation: 'Transforms legacy JwtHelperService calls into modern WebCrypto subtle signatures.'
      },
      {
        stepNumber: 3,
        title: 'Deploy double-buffer token mutex',
        actionCommand: 'phantom apply-recipe atomic-refresh-mutex',
        explanation: 'Injects the pre-verified in-memory promise queue to eliminate the refresh token race condition.'
      },
      {
        stepNumber: 4,
        title: 'Re-run full verification test suite',
        actionCommand: 'npm test -- --runInBand',
        explanation: 'Validates all 42 unit tests including OAuth2 PKCE exchange and token renewal.'
      }
    ]
  }
};

export const LOCAL_MODELS: ModelOption[] = [
  {
    id: 'llama-3.2-3b',
    name: 'Llama 3.2 3B Coder (Local)',
    parameterSize: '3.2 Billion',
    contextWindow: '128k Tokens',
    ramRequired: '2.4 GB VRAM / Unified RAM',
    speed: '68 tokens/sec on Apple M-Series',
    provider: 'Ollama',
    recommendedFor: 'Ultra-fast Git AST scanning, commit intent parsing, and instant local diff analysis.'
  },
  {
    id: 'qwen-2.5-coder-7b',
    name: 'Qwen 2.5 Coder 7B Instruct',
    parameterSize: '7.6 Billion',
    contextWindow: '32k Tokens',
    ramRequired: '5.2 GB VRAM',
    speed: '44 tokens/sec on Apple M-Series',
    provider: 'Local GGML',
    recommendedFor: 'Complex architectural reconstruction, multi-file dependency patching, and code resurrection.'
  },
  {
    id: 'deepseek-coder-6.7b',
    name: 'DeepSeek-Coder 6.7B',
    parameterSize: '6.7 Billion',
    contextWindow: '16k Tokens',
    ramRequired: '4.8 GB VRAM',
    speed: '48 tokens/sec on Apple M-Series',
    provider: 'Llama.cpp',
    recommendedFor: 'Accurate TODO detection, bug origin backtracking, and git blame archaeology.'
  }
];
