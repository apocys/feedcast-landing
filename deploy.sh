#!/bin/bash

# FeedCast Radio Landing Page - Deployment Script
# This script helps deploy the landing page to various platforms

echo "🚀 FeedCast Radio Landing Page Deployment"
echo "=========================================="

# Check if required files exist
required_files=("index.html" "styles.css" "script.js" "assets/favicon.svg")
missing_files=()

for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        missing_files+=("$file")
    fi
done

if [[ ${#missing_files[@]} -ne 0 ]]; then
    echo "❌ Missing required files:"
    printf ' - %s\n' "${missing_files[@]}"
    exit 1
fi

echo "✅ All required files present"

# Create deployment directory
mkdir -p dist
cp -r * dist/ 2>/dev/null || true
rm -f dist/deploy.sh dist/test.html dist/README.md

echo "📦 Files prepared in ./dist/"

echo ""
echo "🌐 Deployment Options:"
echo ""
echo "1. GitHub Pages:"
echo "   - Push dist/ contents to gh-pages branch"
echo "   - Enable GitHub Pages in repository settings"
echo ""
echo "2. Netlify:"
echo "   - Drag dist/ folder to netlify.com/drop"
echo "   - Or connect to GitHub repository"
echo ""
echo "3. Vercel:"
echo "   - vercel --prod (in dist/ directory)"
echo "   - Or connect to GitHub repository"
echo ""
echo "4. Any static host:"
echo "   - Upload dist/ contents to web root"
echo ""

# Validate HTML
if command -v tidy >/dev/null 2>&1; then
    echo "🔍 HTML Validation:"
    tidy -q -e dist/index.html && echo "✅ HTML is valid" || echo "⚠️  HTML has warnings"
fi

# Check file sizes
echo ""
echo "📊 File Sizes:"
echo "HTML: $(du -h dist/index.html | cut -f1)"
echo "CSS:  $(du -h dist/styles.css | cut -f1)"
echo "JS:   $(du -h dist/script.js | cut -f1)"
echo "Total: $(du -sh dist/ | cut -f1)"

echo ""
echo "🎉 Ready for deployment!"
echo "Visit your deployed site to test all functionality."

# Optional: Start local server for testing
if command -v python3 >/dev/null 2>&1; then
    echo ""
    read -p "Start local server for testing? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🖥️  Starting local server at http://localhost:8000"
        cd dist && python3 -m http.server 8000
    fi
fi