# Update npm packages
npm update

# Get version from package.json
$VERSION = node --eval "console.log(require('./package.json').version);"

# Run tests and exit if they fail
npm test
if ($LASTEXITCODE -ne 0) { exit 1 }

# Create and checkout build branch
git checkout -b build

# Build and generate docs
jake "build[,,true]"
jake docs

# Add files to git
git add `
    dist/leaflet.draw.js `
    dist/leaflet.draw-src.js `
    dist/leaflet.draw-src.map `
    dist/leaflet.draw.css `
    dist/leaflet.draw-src.css `
    docs/* `
    -f

# Commit changes
git commit -m "v$VERSION"

# Tag the version and push
git tag "v$VERSION" -f
git push --tags -f

# Publish to npm
npm publish

# Clean up: checkout master and delete build branch
git checkout master
git branch -D build
