#!/bin/bash  
# Shell script to run Selenium test suite on svn revision  
# repsitory to a specified email address.  
# based on Ben Dowling's svn monitor http://www.coderholic.com/svn-change-monitoring-script/

svnUrl="http://www.kaltura.org/kalorg/html5video/trunk"
lastRevisionFile="./.last-revision"
mailto="andrew.davis@kaltura.com"

function getCurrentRevision {
  # Get the current SVN revision, eg. "r4670"
  currentRevision=$(svn log "$svnUrl" -r HEAD 2>/dev/null | head -n2 | grep -v -- "-------" | awk '{ print $1 }')
  # Strip off the 'r'
  currentRevision="${currentRevision:1}"
  echo "$currentRevision"
}

currentRevision=$(getCurrentRevision)

lastRevision=$(cat "$lastRevisionFile")
#  Check what the current revision is, and exit if there
# haven't been any changes since we last checked
if [ $currentRevision = $lastRevision ]
  then
    # EXIT if there have not been any changes
    exit
fi

# Store the current revision as the last revision
echo "$currentRevision" > "$lastRevisionFile"

# Mail the SVN changes
cd ../
svn up
php tests/RunSeleniumTests.php | mail -s "Tested r$currentRevision for $svnUrl" $mailto
