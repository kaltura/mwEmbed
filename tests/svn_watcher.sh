#!/bin/bash  
# Shell script to run Selenium test suite on svn revision  
# repsitory to a specified email address.  
# based on Ben Dowling's svn monitor http://www.coderholic.com/svn-change-monitoring-script/

svnUrl="http://www.kaltura.org/kalorg/html5video/trunk"
lastRevisionFile="./.last-revision"
mailto="andrew.davis@kaltura.com"
echo "0" > .failure

function getCurrentRevision {
  # Get the current SVN revision, eg. "r4670"
  currentRevision=$(svn log "$svnUrl" -r HEAD 2>./.svn_error | head -n2 | grep -v -- "-------" | awk '{ print $1 }')
  # Strip off the 'r'
  currentRevision="${currentRevision:1}"
  echo "$currentRevision"
}

currentRevision=$(getCurrentRevision)

# check that the a revision number was retrieved from the repo, exit if remote error
if [ -z $currentRevision ]
  then
    echo "error retrieveing last svn revision from remote"
    exit
fi

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

# Update from the repository
cd ../

svn up > tests/.test-results

# list configured browsers and loop through tests suite for each
php tests/RunSeleniumTests.php --list-browsers > tests/.browsers
awk '/=>/ { print $3, $4, $5, $6, $7, $8 }' tests/.browsers > tests/.browser-list

echo -e "Beginning Tests of r$currentRevision for $svnUrl" >> tests/.test-results

cat "tests/.browser-list" | while read line;
do
  echo -e "\n\nrunning tests for: $line\n" >> tests/.test-results
  php tests/RunSeleniumTests.php --testBrowser "$line" > tests/.temp-result
  awk '/OK\:/ { print $2 }' tests/.temp-result > tests/.temp-passed
  awk '/OK\:/ { print $4 }' tests/.temp-result > tests/.temp-failed
  passedCount=$(cat tests/.temp-passed | awk '{ sum+=$1} END {print sum}')
  failedCount=$(cat tests/.temp-failed | awk '{ sum+=$1} END {print sum}')
  echo "passed: $passedCount | failed: $failedCount" >> tests/.test-results
  if [ $failedCount -gt 0 ]
    then
      echo -e "\nFAILURE:\n" >> tests/.test-results
      cat tests/.temp-result >> tests/.test-results
      echo "1" > tests/.failure
  fi
done

FAILURE=$(cat tests/.failure)

if [ "$FAILURE" -eq 1 ]
  then
    cat tests/.test-results | mail -s "Test FAILURE for r$currentRevision of $svnUrl" $mailto
  else
    cat tests/.test-results | mail -s "Tests passed for r$currentRevision of $svnUrl" $mailto
fi


cat tests/.test-results
