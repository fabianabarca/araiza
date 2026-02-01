# CI/CD Setup Instructions

## Overview

This GitHub Actions workflow automatically deploys your site whenever you publish changes from Nuxt Studio (or push to the main branch).

## Setup Steps

### 1. Configure GitHub Secrets

Go to your GitHub repository: https://github.com/fabianabarca/araiza

1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add these three secrets:
   - **Name:** `SERVER_HOST`
     - **Value:** Your server's IP address or hostname (e.g., `192.168.1.100` or `server.university.edu`)
   - **Name:** `SERVER_USERNAME`
     - **Value:** Your SSH username
   - **Name:** `SERVER_PASSWORD`
     - **Value:** Your SSH password

### 2. Ensure Server Prerequisites

Make sure your server has:

- Git installed and configured
- pnpm installed (check with `pnpm --version`)
- The repository cloned at `~/araiza`
- Proper Git credentials configured (so `git pull` doesn't ask for password)

To configure Git credentials on the server, run:

```bash
git config --global credential.helper store
cd ~/araiza
git pull  # Enter credentials once, they'll be saved
```

### 3. VPN Consideration

⚠️ **IMPORTANT**: GitHub Actions will connect from GitHub's servers, which are NOT inside your university's VPN.

**Solutions:**

1. **Whitelist GitHub's IP ranges** on your university's firewall (ask your IT department)
2. **Set up a VPN tunnel** that GitHub Actions can use (complex)
3. **Use a jump server/bastion host** outside the VPN that can reach your server
4. **Expose SSH port** to the internet with strong security (not recommended without proper hardening)

The easiest solution is usually option 1 - ask your IT department to whitelist GitHub Actions IP ranges.

### 4. Test the Workflow

Once secrets are configured and VPN access is resolved:

1. Make a small change to any file in your repository
2. Commit and push to the main branch (or publish from Nuxt Studio)
3. Go to **Actions** tab in GitHub to see the deployment progress
4. Check your website to verify the changes are live

### 5. Manual Deployment

You can also trigger deployment manually:

1. Go to **Actions** tab in GitHub
2. Click **Deploy to Server** workflow
3. Click **Run workflow** button

## Troubleshooting

### Workflow fails with "Host key verification failed"

Add this to your workflow's SSH step (before `script:`):

```yaml
script_stop: true
```

### Git pull fails with permission denied

Make sure Git credentials are stored on the server (see step 2 above).

### Build fails

Check the Actions logs for specific errors. Common issues:

- Missing dependencies (run `pnpm install` on server manually first)
- Node.js version mismatch
- Insufficient disk space

## Security Best Practices (Recommended Improvements)

For better security, consider switching from password to SSH key authentication:

1. Generate SSH key pair on your local machine:

   ```bash
   ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions
   ```

2. Copy public key to server:

   ```bash
   ssh-copy-id -i ~/.ssh/github_actions.pub user@server
   ```

3. Add private key to GitHub Secrets as `SSH_PRIVATE_KEY`

4. Update the workflow to use `key` instead of `password`

## Next Steps

After the VPN issue is resolved and the workflow runs successfully, every change you make in Nuxt Studio will automatically deploy to your production server within 1-2 minutes!
