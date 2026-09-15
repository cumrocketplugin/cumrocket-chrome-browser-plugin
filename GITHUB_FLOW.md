# GitHub workflow

Work on the existing `main` branch. Do not create new branches. Commit reviewed changes with a message explaining what changed, then push to GitHub over SSH.

## Repository and SSH key

| Setting | Value |
| --- | --- |
| Branch | `main` |
| Remote | `origin` |
| SSH remote URL | `git@github-cumrocketplugin:cumrocketplugin/cumrocket-chrome-browser-plugin.git` |
| SSH host alias | `github-cumrocketplugin` |
| Private key to use | `~/.ssh/cumrocketplugin` |
| Corresponding public key | `~/.ssh/cumrocketplugin.pub` |

The local SSH configuration already resolves this alias to GitHub with the key above. Its relevant settings are equivalent to:

```sshconfig
Host github-cumrocketplugin
    HostName github.com
    User git
    IdentityFile ~/.ssh/cumrocketplugin
    IdentitiesOnly yes
```

Keep the private key outside the repository. Only the `.pub` key should be registered with the appropriate GitHub account or repository access settings.

To check authentication:

```sh
ssh -T git@github-cumrocketplugin
```

GitHub should identify the authenticated account and explain that shell access is unavailable. A successful authentication test can still exit with status `1`. Authentication alone does not confirm write access to this repository.

If the key needs to be loaded into an existing SSH agent:

```sh
ssh-add ~/.ssh/cumrocketplugin
```

## 1. Check the current branch and changes

Run commands from the repository directory:

```sh
git branch --show-current
git remote -v
git status --short
git diff
```

Confirm the branch is `main` and the remote matches the table above. Inspect new files directly because `git diff` does not show untracked file contents.

## 2. Synchronize before starting new work

For an established repository with a clean working tree:

```sh
git fetch origin
git pull --ff-only origin main
```

If local changes are already in progress, review and commit them before integrating remote changes. If a fast-forward pull fails because histories have diverged, follow the merge procedure below.

**Initial commit:** At the time this document was created, local `main` had no commits. Check the remote before the first push:

```sh
git ls-remote --heads origin main
```

If the command succeeds with no output, remote `main` does not exist yet; skip the pull and create the initial commit. If it returns a commit, fetch and inspect the remote history before integrating local files. Do not overwrite an existing remote history.

## 3. Stage and review the intended files

For the initial documentation commit:

```sh
git add README.md GITHUB_FLOW.md
git diff --cached --check
git diff --cached
```

For later commits, replace the filenames with the files changed for that task. Run checks appropriate to the change before committing.

## 4. Add a commit message describing the changes

Every commit must include a short summary and a body explaining what changed and why. Record validation performed, and describe planned features as documentation rather than implemented functionality.

Example for the initial documentation commit:

```sh
git commit -m "docs: describe extension features and GitHub workflow" \
  -m "Document planned keyword, regex, semantic, and agent-assisted video search. Add automatic navigation, pause controls, and an optional Skip ad toggle. Document the existing-main workflow and repository SSH key." \
  -m "Validation: reviewed the documentation and ran git diff --cached --check. No executable code changed."
```

Adapt the message to the actual staged changes and checks performed. This commit message serves as the change comment shown on GitHub after pushing.

## 5. Push over SSH

First push, to set the upstream tracking branch:

```sh
git push -u origin main
```

Subsequent pushes:

```sh
git push origin main
```

The `origin` URL uses the SSH alias, which selects `~/.ssh/cumrocketplugin` automatically. To explicitly select the same key for a single push:

```sh
GIT_SSH_COMMAND='ssh -i ~/.ssh/cumrocketplugin -o IdentitiesOnly=yes' git push origin main
```

If GitHub rejects a push because remote `main` has newer commits, fetch and merge them into the existing branch:

```sh
git fetch origin
git merge origin/main
```

If there are conflicts, resolve them, stage the resolved files, and complete the merge with a descriptive commit message. Review the result, rerun relevant checks, and push again. Do not force-push. If repository rules prevent direct pushes, report the restriction without creating a branch or bypassing the rules.

## 6. Verify the push

```sh
git status -sb
git log -1 --format=full
git rev-parse HEAD
git ls-remote --heads origin main
```

Confirm that the local commit hash matches remote `main`. Open the repository's GitHub commit history to review the published changes and commit message.
