import webtask from './bundle.ignored';
import {expect} from 'chai';

describe('webtask', () => {
  it('should work in a basic case', function(done) {
    this.timeout(5000);
    webtask(getTestContext(), (err, response) => {
      expect(err).to.be.null;
      expect(response.type).to.equal('Success');
      expect(response.stderr).to.be.empty;

      // I realize this is not a very good test, but here are the things that are being tested:
      // 1. the base and pr repos have a token added, but the output doesn't show the token (shows token-hidden instead)
      // 2. we clone the repo into a temp directory (not being specific about that though for differing systems)
      // 3. We execute the right git commands in the right order
      expect(response.stdout).to.match(new RegExp([
        '> R&M >> BASE_REPO: https://token-hidden@github.com/kentcdodds/rebase-and-merge-test.git',
        '> R&M >> BASE_BRANCH: master',
        '> R&M >> PR_REPO: https://token-hidden@github.com/kentcdodds/rebase-and-merge-test.git',
        '> R&M >> PR_BRANCH: kentcdodds-patch-1',
        '> R&M >> DRY_RUN of git clone https://token-hidden@github.com/kentcdodds/rebase-and-merge-test.git /.*?/kentcdodds-patch-1',
        '> R&M >> DRY_RUN of git fetch origin',
        '> R&M >> DRY_RUN of git checkout -b PR_kentcdodds-patch-1 master',
        '> R&M >> DRY_RUN of git pull https://token-hidden@github.com/kentcdodds/rebase-and-merge-test.git kentcdodds-patch-1',
        '> R&M >> DRY_RUN of git rebase origin/master',
        '> R&M >> DRY_RUN of git checkout master',
        '> R&M >> DRY_RUN of git merge --ff-only PR_kentcdodds-patch-1',
        '> R&M >> DRY_RUN of git push origin master',
        ''
      ].join('\n')));
      done();
    });
  });

  ['baseRepo', 'baseBranch', 'prRepo', 'prBranch'].forEach(item => {
    it(`should throw an error when missing ${item}`, () => {
      const context = getTestContext();
      delete context.data[item];
      webtask(context, (err, response) => {
        expect(err).to.be.an.instanceof(Error);
        expect(response).to.not.exist;
        console.log(err);
      });
    });
  });
});

function getTestContext() {
  return {
    data: {
      baseRepo: 'https://github.com/kentcdodds/rebase-and-merge-test.git',
      baseBranch: 'master',
      prRepo: 'https://github.com/kentcdodds/rebase-and-merge-test.git',
      prBranch: 'kentcdodds-patch-1',
      dryRun: true,
      token: 'WHATEVER_YOU_HAVE'
    }
  };
}
