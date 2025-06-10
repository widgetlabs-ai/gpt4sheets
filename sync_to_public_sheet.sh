#!/bin/bash
# sync_to_public_sheet.sh - Script to sync code to public sheet and update commit ID

# Public sheet script ID - this is the ID of the public gpt4sheets project
# This is not sensitive and is hardcoded to prevent pushing to the wrong project
PUBLIC_SCRIPT_ID="1CbblD1Mu2ImtTXLtHjRydPlrA6ZULVmC_qDE8A3O488XsnDCqWWrUfyh"

# Verify .clasp.json has the correct script ID
echo "Verifying .clasp.json points to the public sheet..."
CURRENT_SCRIPT_ID=$(grep -o '"scriptId":"[^"]*"' .clasp.json | cut -d'"' -f4)

if [ "$CURRENT_SCRIPT_ID" != "$PUBLIC_SCRIPT_ID" ]; then
  echo "ERROR: .clasp.json contains incorrect script ID!"
  echo "Current ID: $CURRENT_SCRIPT_ID"
  echo "Expected ID: $PUBLIC_SCRIPT_ID"
  echo "Please update .clasp.json or use the following command:"
  echo "echo '{\"scriptId\":\"$PUBLIC_SCRIPT_ID\",\"rootDir\":\"$(pwd)\"}' > .clasp.json"
  exit 1
fi

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
