# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.3.0](https://github.com/ihelpee/nestjs-crud/compare/v2.2.3...v2.3.0) (2026-02-25)

### Features

- Implement cursor-based pagination across MikroORM, Mongoose, and TypeORM CRUD services. ([d43b5b3](https://github.com/ihelpee/nestjs-crud/commit/d43b5b3e7e80e7d1692cbaf7d10a3ee32c2f32b9))

## [2.2.3](https://github.com/ihelpee/nestjs-crud/compare/v2.2.2...v2.2.3) (2026-02-25)

### Bug Fixes

- add build step before publishing to NPM. ([dd66b1b](https://github.com/ihelpee/nestjs-crud/commit/dd66b1b146fc9e42dbe1c24518494455670763c0))

## [2.2.2](https://github.com/ihelpee/nestjs-crud/compare/v2.2.1...v2.2.2) (2026-02-25)

### Bug Fixes

- fixed missing package on publish ([558dc34](https://github.com/ihelpee/nestjs-crud/commit/558dc344da6e14fc3fa0bd2bc0ff48a0738ed5fb))

## [2.2.1](https://github.com/ihelpee/nestjs-crud/compare/v2.2.0...v2.2.1) (2026-02-25)

### Bug Fixes

- adjust path filters to trigger release on workflow changes ([bf38077](https://github.com/ihelpee/nestjs-crud/commit/bf38077063c420dcb207fca1427c180eac14f351))
- force anonymous registry access and clear npmrc in test job ([1607e57](https://github.com/ihelpee/nestjs-crud/commit/1607e5741ef2471765f8c2a3669cc924731192a9))
- migrate CI workflows from npm to yarn and update MikroORM dependencies. ([37b2fb0](https://github.com/ihelpee/nestjs-crud/commit/37b2fb0a49ac48d34ed5f7e25dad02fd7e93d3b1))
- minimal test job to avoid 403 Forbidden on install ([09f5b65](https://github.com/ihelpee/nestjs-crud/commit/09f5b65cb6c1cd7a2ca7b0db0d60ac7bbb039598))
- separate npm authentication from install to avoid 403 ([fb6ba89](https://github.com/ihelpee/nestjs-crud/commit/fb6ba8958799a889eaccdb64aea74793fe241c58))
- switch to npm install for better registry handling on CI ([21ce6d0](https://github.com/ihelpee/nestjs-crud/commit/21ce6d0c904549b9599cf6c78417c13fb326b893))
- update release workflow to handle race conditions and git displacement ([3d92f8a](https://github.com/ihelpee/nestjs-crud/commit/3d92f8acc60bd1f530a1ed7522bbd86c13402f8e))
- update yarn.lock ([b4d31d6](https://github.com/ihelpee/nestjs-crud/commit/b4d31d633ba7ab373b1683f2b3dedc169d2f07bc))

# [2.2.0](https://github.com/ihelpee/nestjs-crud/compare/v2.1.4...v2.2.0) (2026-02-25)

### Bug Fixes

- removed ValidationPipe instance support and updated plainToInstance ([f0b54de](https://github.com/ihelpee/nestjs-crud/commit/f0b54deaf14c1a46b24e790cb6443b2b019e047b))
- removed ValidationPipe instance support and updated plainToInstance ([0455877](https://github.com/ihelpee/nestjs-crud/commit/04558778bf7bfcda7c46bd1541a26ce0e2a0c0c5))
- removed ValidationPipe instance support and updated plainToInstance ([e6ea657](https://github.com/ihelpee/nestjs-crud/commit/e6ea657d7aba30f68c49e6cb97535ad1a21ef419))
- removed ValidationPipe instance support and updated plainToInstance ([2f1ca59](https://github.com/ihelpee/nestjs-crud/commit/2f1ca598fb355e6db4200c55f5c813367af75925))

### Features

- Add comprehensive TypeScript declaration files across all packages for improved type support. ([b82b66a](https://github.com/ihelpee/nestjs-crud/commit/b82b66a4437f9c1eb1e19a8050eadc67cb877575))
- added useCursor to pagination result ([47bc118](https://github.com/ihelpee/nestjs-crud/commit/47bc118d17659612f514b626183efeb507c440c9))
