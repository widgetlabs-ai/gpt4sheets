#!/bin/bash
# sync_to_public_sheet.sh - Script to sync code to public sheet and update commit ID

# Public sheet script ID - this is the ID of the public gpt4sheets project
# This is not sensitive and is hardcoded to prevent pushing to the wrong project
PUBLIC_SCRIPT_ID="1CbblD1Mu2ImtTXLtHjRydPlrA6ZULVmC_qDE8A3O488XsnDCqWWrUfyh"

# Verify .clasp.json has the correct script ID
echo "Checking .clasp.json configuration..."
CURRENT_SCRIPT_ID=$(grep -o '"scriptId":"[^"]*"' .clasp.json | cut -d'"' -f4)
CURRENT_ROOT_DIR=$(grep -o '"rootDir":"[^"]*"' .clasp.json | cut -d'"' -f4)

if [ "$CURRENT_SCRIPT_ID" != "$PUBLIC_SCRIPT_ID" ]; then
  echo "Current script ID ($CURRENT_SCRIPT_ID) is not the public sheet ID."
  echo "This appears to be your development environment."
  echo ""
  echo "This script will:"
  echo "  • Temporarily update .clasp.json to point to the public sheet"
  echo "  • Push your code to the public sheet"
  echo "  • Restore your development environment afterward"
  echo ""
  read -p "Type 'yes' to proceed or anything else to exit: " CONFIRM
  
  if [ "$CONFIRM" != "yes" ]; then
    echo "Operation cancelled. Exiting."
    exit 1
  fi
  
  echo "Creating backup of your current .clasp.json..."
  cp .clasp.json .clasp.json.bak
  
  echo "Temporarily updating .clasp.json to point to public sheet..."
  echo "{\"scriptId\":\"$PUBLIC_SCRIPT_ID\",\"rootDir\":\"$CURRENT_ROOT_DIR\"}" > .clasp.json
  
  # Set flag to restore .clasp.json later
  RESTORE_CLASP_JSON=true
else
  RESTORE_CLASP_JSON=false
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

# Restore original .clasp.json if we modified it
if [ "$RESTORE_CLASP_JSON" = true ]; then
  echo "Restoring your development .clasp.json configuration..."
  mv .clasp.json.bak .clasp.json
  echo "Development environment restored."
fi

echo "Sync completed successfully!"
