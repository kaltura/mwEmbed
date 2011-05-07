#!/bin/bash  

# Running this script will run all locally tests on the most recent 
# svn HEAD (checked out automatically by the grid)

# Guidelines:
# commit your test html files to the repository then write tests locally
# the grid updates its svn checkout every five minutes
# run this script

# if you are interested in setting up a development url for the grid 
# to test, email andrew.davis@kaltura.com your public key for setup assistance

cd ../

# list configured browsers and loop through tests suite for each
php tests/RunSeleniumTests.php --list-browsers > tests/.browsers
awk '/=>/ { print $3, $4, $5, $6, $7, $8 }' tests/.browsers > tests/.browser-list
cat "tests/.browser-list" | while read line;
do
  echo -e "\n\nrunning tests for: $line\n"
  php tests/RunSeleniumTests.php --testBrowser "$line" > tests/.temp-result
  awk '/OK\:/ { print $2 }' tests/.temp-result > tests/.temp-passed
  awk '/OK\:/ { print $4 }' tests/.temp-result > tests/.temp-failed
  passedCount=$(cat tests/.temp-passed | awk '{ sum+=$1} END {print sum}')
  failedCount=$(cat tests/.temp-failed | awk '{ sum+=$1} END {print sum}')
  echo "passed: $passedCount | failed: $failedCount"
  if [ $failedCount -gt 0 ]
    then
      echo -e "\nFAILURE:\n"
      cat tests/.temp-result
  fi
done
