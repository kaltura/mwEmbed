#!/bin/bash

# check if there's been a git checkout performed then do the following, otherwise sync from svn

# if mwEmbed.git_sync exists, do git-svn rebase for all mapped branches

## BRANCH Mappings

# master  http://www.kaltura.org/kalorg/html5video/trunk/mwEmbed/
# dev     http://www.kaltura.org/kalorg/html5video/branches/html5.kaltura.1.7

# TAG Mappings

## The tag mappings are not perfect yet.  SVN tags seem to sometimes include an mwEmbed directory.

# 1.5     http://www.kaltura.org/kalorg/html5video/tags/1.5/
# 1.6.0   http://www.kaltura.org/kalorg/html5video/tags/1.6.0/
# 1.6.1   http://www.kaltura.org/kalorg/html5video/tags/1.6.1/
# 1.6.2   http://www.kaltura.org/kalorg/html5video/tags/1.6.2/
# 1.6.3   http://www.kaltura.org/kalorg/html5video/tags/1.6.3/
# 1.6.4   http://www.kaltura.org/kalorg/html5video/tags/1.6.4/mwEmbed/
# 1.6.5   http://www.kaltura.org/kalorg/html5video/tags/1.6.5/mwEmbed/
# 1.6.6   http://www.kaltura.org/kalorg/html5video/tags/1.6.6/mwEmbed/

## Clone Master

git init
git config svn.authorsfile authors.txt
git config svn.rmdir true

#git svn init http://www.kaltura.org/kalorg/html5video/ --svn-remote=kaltura.org --prefix=kaltura.org/ --trunk=trunk/mwEmbed --branches=branches --tags=tags;
git svn init http://www.kaltura.org/kalorg/html5video/ --svn-remote=kaltura.org --prefix=kaltura.org/ --trunk=trunk/mwEmbed --branches=branches --tags=tags --branches=trunk ;
# Doesn't work: git svn init svn+ssh://svn.wikimedia.org/svnroot/mediawiki/ --svn-remote=TimedMediaHandler --prefix=TimedMediaHandler/ --trunk=trunk/extensions/TimedMediaHandler --branches=branches/MwEmbedStandAloneRL1_17/MwEmbedStandAlone mwEmbed.git_sync;
#git svn init svn+ssh://svn.wikimedia.org/svnroot/mediawiki/ --svn-remote=mediawiki.org --prefix=mediawiki.org/ --trunk=trunk/extensions/TimedMediaHandler mwEmbed.git_sync;

cat mwEmbed.git_sync/.git/config
