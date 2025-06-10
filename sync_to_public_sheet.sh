#!/bin/bash
# sync_to_public_sheet.sh - Script to sync code to public sheet and update commit ID

# Get the latest commit SHA from the main branch
LATEST_COMMIT=$(git rev-parse HEAD)

# Update the commit SHA in the settings manager file
echo "Updating commit SHA to: $LATEST_COMMIT"
sed -i '' "s/const CURRENT_COMMIT_SHA = \"[a-z0-9]*\";/const CURRENT_COMMIT_SHA = \"$LATEST_COMMIT\";/" 05_settingsManager.js

# Push code to the public sheet using clasp
echo "Pushing code to public sheet..."
clasp push -f

# Commit the updated file with the new SHA
# Note: This commit message is important - our code specifically ignores commits with this message pattern
# when checking for updates to avoid always showing an update notification
git add 05_settingsManager.js
git commit -m "Update current commit SHA to $LATEST_COMMIT"
git push origin main

echo "Sync completed successfully!"
