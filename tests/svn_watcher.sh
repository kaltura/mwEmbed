#!/bin/bash  
# Shell script to run Selenium test suite on svn revision  
# repsitory to a specified email address.  
# based on Ben Dowling's svn monitor http://www.coderholic.com/svn-change-monitoring-script/
  
svnUrl="http://www.kaltura.org/kalorg/html5video"  
lastRevisionFile="./.last-revision"  
mailto="andrew.davis@kaltura.com"  
  
function getCurrentRevision {  
  # Get the current SVN revision, eg. "r4670"  
  currentRevision=$(svn log "$svnUrl" -r HEAD 2>/dev/null | head -n2 | grep -v -- "-------" | awk '{ print $1 }')  
  # Strip off the 'r'  
  currentRevision="${currentRevision:1}"  
  # echo "$currentRevision"  
}  
  
currentRevision=$(getCurrentRevision)  
  
# If we've run this program before then we've stored the SVN revision at the time  
if [ -f "$lastRevisionFile" ]  
then  
  lastRevision=$(cat "$lastRevisionFile")  
  #  Check what the current revision is, and exit if there  
  # haven't been any changes since we last checked  
  if [ $currentRevision -lt $lastRevision ]  
  then  
      # EXIT if there have not been any changes  
      exit  
  fi  
else  
  # We haven't run this program before, so set the last revision to the current revision - 10  
  lastRevision=$(echo "$currentRevision - 10" | bc)  
fi  
  
  
# Store the current revision + 1 as the last revision  
revision=$(echo "$currentRevision + 1" | bc)  
echo "$revision" > "$lastRevisionFile"

# Mail the SVN changes  V
cd ../
svn up
#svn log "$svnUrl" -r "HEAD:${lastRevision}" | mail -s "Test run for $svnUrl" $mailto  
php tests/RunSeleniumTests.php | mail -s "Test run for $svnUrl" $mailto
