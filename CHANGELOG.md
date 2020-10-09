<a name="1.8.0"></a>
# [1.8.0](https://github.com/brightcove/player-loader/compare/v1.7.1...v1.8.0) (2020-10-09)

### Features

* Add support for poster URL override (#67) ([d341708](https://github.com/brightcove/player-loader/commit/d341708)), closes [#67](https://github.com/brightcove/player-loader/issues/67)

<a name="1.7.1"></a>
## [1.7.1](https://github.com/brightcove/player-loader/compare/v1.7.0...v1.7.1) (2019-06-21)

### Code Refactoring

* Rename the mis-named `configId` parameter (#52) ([6896897](https://github.com/brightcove/player-loader/commit/6896897)), closes [#52](https://github.com/brightcove/player-loader/issues/52)

<a name="1.7.0"></a>
# [1.7.0](https://github.com/brightcove/player-loader/compare/v1.6.0...v1.7.0) (2019-06-04)

### Features

* Support adConfigId and configId params (#50) ([b33157c](https://github.com/brightcove/player-loader/commit/b33157c)), closes [#50](https://github.com/brightcove/player-loader/issues/50)

### Chores

* **package:** Update outdated dependencies (#49) ([cae135e](https://github.com/brightcove/player-loader/commit/cae135e)), closes [#49](https://github.com/brightcove/player-loader/issues/49)

<a name="1.6.0"></a>
# [1.6.0](https://github.com/brightcove/player-loader/compare/v1.5.0...v1.6.0) (2018-10-23)

### Features

* Add support for an iframeHorizontalPlaylist embed option, enhance playlist embed option to support legacy playlists. (#35) ([09e8694](https://github.com/brightcove/player-loader/commit/09e8694)), closes [#35](https://github.com/brightcove/player-loader/issues/35)
* Replace existing demo pages with one page allowing many configurations. (#34) ([123c7a8](https://github.com/brightcove/player-loader/commit/123c7a8)), closes [#34](https://github.com/brightcove/player-loader/issues/34)

### Chores

* **package:** update videojs-generate-rollup-config to version 2.3.0 ([4f401e5](https://github.com/brightcove/player-loader/commit/4f401e5))

<a name="1.5.0"></a>
# [1.5.0](https://github.com/brightcove/player-loader/compare/v1.4.2...v1.5.0) (2018-10-05)

### Features

* allow player url to be passed in (#32) ([fc52bc8](https://github.com/brightcove/player-loader/commit/fc52bc8)), closes [#32](https://github.com/brightcove/player-loader/issues/32)

### Chores

* **package:** update videojs-standard to version 8.0.2 (#31) ([9161428](https://github.com/brightcove/player-loader/commit/9161428)), closes [#31](https://github.com/brightcove/player-loader/issues/31)

<a name="1.4.2"></a>
## [1.4.2](https://github.com/brightcove/player-loader/compare/v1.4.1...v1.4.2) (2018-09-17)

### Chores

* Mark players as having been loaded with this library. (#30) ([e327286](https://github.com/brightcove/player-loader/commit/e327286)), closes [#30](https://github.com/brightcove/player-loader/issues/30)

<a name="1.4.1"></a>
## [1.4.1](https://github.com/brightcove/player-loader/compare/v1.4.0...v1.4.1) (2018-09-12)

### Bug Fixes

* Fix an issue where embedding a player more than once would result in "Uncaught TypeError: resolve is not a function" (#28) ([2d54995](https://github.com/brightcove/player-loader/commit/2d54995)), closes [#28](https://github.com/brightcove/player-loader/issues/28)

<a name="1.4.0"></a>
# [1.4.0](https://github.com/brightcove/player-loader/compare/v1.3.2...v1.4.0) (2018-09-06)

### Features

* Add `embedOptions.tagName` parameter to improve support for older Brightcove Player versions. (#26) ([c4c10e7](https://github.com/brightcove/player-loader/commit/c4c10e7)), closes [#26](https://github.com/brightcove/player-loader/issues/26)

<a name="1.3.2"></a>
## [1.3.2](https://github.com/brightcove/player-loader/compare/v1.3.1...v1.3.2) (2018-09-05)

### Bug Fixes

* Remove the postinstall script to prevent install issues ([5fca070](https://github.com/brightcove/player-loader/commit/5fca070))

### Chores

* **package:** Update dependencies to enable Greenkeeper 🌴 (#20) ([fc9ee13](https://github.com/brightcove/player-loader/commit/fc9ee13)), closes [#20](https://github.com/brightcove/player-loader/issues/20)

<a name="1.3.1"></a>
## [1.3.1](https://github.com/brightcove/player-loader/compare/v1.3.0...v1.3.1) (2018-08-30)

### Chores

* Update tooling using plugin generator v7.2.0 (#19) ([fa7961b](https://github.com/brightcove/player-loader/commit/fa7961b)), closes [#19](https://github.com/brightcove/player-loader/issues/19)

<a name="1.3.0"></a>
# [1.3.0](https://github.com/brightcove/player-loader/compare/v1.2.1...v1.3.0) (2018-08-28)

### Features

* Allow an embed to use the unminified version of a player. (#14) ([49a1819](https://github.com/brightcove/player-loader/commit/49a1819)), closes [#14](https://github.com/brightcove/player-loader/issues/14)

### Bug Fixes

* Fix an issue with using the refNode param as a string. (#13) ([57f64fa](https://github.com/brightcove/player-loader/commit/57f64fa)), closes [#13](https://github.com/brightcove/player-loader/issues/13)
* Fix usage of the 'replace' value for refNodeInsert. (#15) ([36ba6f2](https://github.com/brightcove/player-loader/commit/36ba6f2)), closes [#15](https://github.com/brightcove/player-loader/issues/15)

### Documentation

* Add note describing which Brightcove Player versions this is compatible with. (#17) ([7301b73](https://github.com/brightcove/player-loader/commit/7301b73)), closes [#17](https://github.com/brightcove/player-loader/issues/17)

<a name="1.2.1"></a>
## [1.2.1](https://github.com/brightcove/player-loader/compare/v1.2.0...v1.2.1) (2018-08-17)

### Code Refactoring

* Use [@brightcove](https://github.com/brightcove)/player-url to generate URLs. ([253d019](https://github.com/brightcove/player-loader/commit/253d019))

<a name="1.2.0"></a>
# [1.2.0](https://github.com/brightcove/player-loader/compare/v1.1.0...v1.2.0) (2018-08-14)

### Features

* Detect pre-existing players on the page and cache them to avoid downloading players that may exist before player-loader gets to run. (#10) ([566d4ed](https://github.com/brightcove/player-loader/commit/566d4ed)), closes [#10](https://github.com/brightcove/player-loader/issues/10)

<a name="1.1.0"></a>
# [1.1.0](https://github.com/brightcove/player-loader/compare/v1.0.0...v1.1.0) (2018-08-01)

### Features

* Expose the getUrl function from utils (#9) ([63b18ce](https://github.com/brightcove/player-loader/commit/63b18ce)), closes [#9](https://github.com/brightcove/player-loader/issues/9)

<a name="1.0.0"></a>
# 1.0.0 (2018-07-23)

### Features

* Allow Brightcove Players to be embedded and loaded asynchronously. (#2) ([be708db](https://github.com/brightcove/player-loader/commit/be708db)), closes [#2](https://github.com/brightcove/player-loader/issues/2)

