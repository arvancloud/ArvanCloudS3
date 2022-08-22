  # ArvanS3
# Contributing to ArvanS3 #
This is a short guide on how to contribute things to ArvanS3.

## Submitting a new feature or bug fix ##

If you find a bug that you'd like to fix, or a new feature that you'd
like to implement then please submit a pull request via GitHub.

If it is a big feature, then [make an issue](https://github.com/arvancloud/arvans3/issues) first so it can be discussed.

To prepare your pull request first press the fork button on [arvans3's GitHub
page](https://github.com/arvancloud/arvans3).

Next open your terminal, change directory to your preferred folder and initialise your local arvans3 project:

    git clone https://github.com/arvancloud/arvans3.git
    cd arvans3
    git remote rename origin upstream
      # if you have SSH keys setup in your GitHub account:
    git remote add origin git@github.com:YOURUSER/arvans3.git
      # otherwise:
    git remote add origin https://github.com/YOURUSER/arvans3.git

Finally make a branch to add your new feature

    git checkout -b my-new-feature

### Committing your changes ###

Follow the guideline for [commit messages](#commit-messages) and then:

    git checkout my-new-feature      # To switch to your branch
    git status                       # To see the new and changed files
    git add FILENAME                 # To select FILENAME for the commit
    git status                       # To verify the changes to be committed
    git commit                       # To do the commit
    git log                          # To verify the commit. Use q to quit the log

When you are done with that push your changes to Github:

    git push -u origin my-new-feature

## Writing Documentation ##

If you are adding a new feature then please update the documentation.


