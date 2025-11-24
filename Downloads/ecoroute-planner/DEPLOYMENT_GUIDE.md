# EcoRoute Planner - Deployment Guide

## 🎯 Quick Overview

This guide will help you deploy your EcoRoute Planner app to Netlify so it's accessible from any internet browser.

**Repository:** https://github.com/Academic-Coding/ecoroute-planner  
**Status:** ✅ Code pushed to GitHub (public repository)

---

## 📋 Step-by-Step Deployment Instructions

### Step 1: Access Netlify

1. Go to **https://app.netlify.com/**
2. Make sure you're logged in with your GitHub account
3. You should see your Netlify dashboard

### Step 2: Import Your Repository

1. Click the **"Add new site"** button (or **"Import an existing project"**)
2. Click **"Import from Git"**
3. Select **"GitHub"** as your Git provider
4. If you see "No repositories found":
   - Click **"Configure Netlify on GitHub"**
   - Make sure **"All repositories"** is selected for **Academic-Coding**
   - Click **"Save"**
   - Return to Netlify and refresh

### Step 3: Select Your Repository

1. Look for **"ecoroute-planner"** in the repository list
2. Click on **"ecoroute-planner"** to select it
3. You'll be taken to the deploy configuration page

### Step 4: Configure Build Settings

Netlify should auto-detect these settings. Verify they are correct:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Base directory:** (leave empty)

### Step 5: Add Environment Variables

This is **CRITICAL** for the app to work!

1. Look for **"Show advanced"** or **"Advanced build settings"** button
2. Click it to expand the advanced settings
3. Find the **"Environment variables"** section
4. Click **"New variable"** button
5. Add the following:
   - **Key:** `VITE_GEMINI_API_KEY`
   - **Value:** `AIzaSyDBE799jJhapFrKpn5d5AcmTbQIGuKsVFs`
6. Click **"Add"** or save the variable

### Step 6: Deploy!

1. Click the **"Deploy ecoroute-planner"** button (or **"Deploy site"**)
2. Wait for the deployment to complete (usually 2-5 minutes)
3. You'll see a progress indicator showing:
   - Building
   - Deploying
   - Published

### Step 7: Get Your Live URL

Once deployment is complete:

1. Netlify will show you the live URL
2. It will look like: `https://ecoroute-planner-xxxxx.netlify.app`
3. Click on the URL to open your live app!

---

## 🔧 Troubleshooting

### Issue: "No repositories found"

**Solution:**
1. Click "Configure Netlify on GitHub"
2. Make sure "All repositories" is selected
3. Save and return to Netlify

### Issue: Build fails

**Solution:**
1. Check that the build command is `npm run build`
2. Check that the publish directory is `dist`
3. Make sure the environment variable `VITE_GEMINI_API_KEY` is set

### Issue: App loads but shows "Authentication Required"

**Solution:**
1. The environment variable is missing or incorrect
2. Go to Site settings → Environment variables
3. Add `VITE_GEMINI_API_KEY` with your API key
4. Trigger a new deployment

### Issue: API calls fail

**Solution:**
1. Check that the API key is valid
2. Make sure the environment variable name is exactly `VITE_GEMINI_API_KEY` (case-sensitive)
3. Redeploy the site after adding the variable

---

## 🎨 Customizing Your Deployment

### Change Site Name

1. Go to **Site settings** → **General** → **Site details**
2. Click **"Change site name"**
3. Enter a custom name (e.g., `my-ecoroute-planner`)
4. Your URL will become: `https://my-ecoroute-planner.netlify.app`

### Add Custom Domain

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the instructions to connect your domain

### Enable HTTPS

- HTTPS is automatically enabled by Netlify
- Your site will be accessible via `https://` by default

---

## 📊 Monitoring Your Deployment

### View Build Logs

1. Go to **Deploys** tab
2. Click on any deployment
3. View the build log to see what happened during deployment

### Check Site Analytics

1. Go to **Analytics** tab (if available on your plan)
2. View visitor statistics and performance metrics

---

## 🔄 Updating Your App

When you make changes to your code:

1. **Push changes to GitHub:**
   ```bash
   cd c:\Users\hassa\Downloads\ecoroute-planner
   git add .
   git commit -m "Your update message"
   git push origin main
   ```

2. **Automatic deployment:**
   - Netlify will automatically detect the changes
   - It will rebuild and redeploy your app
   - Wait 2-5 minutes for the new version to go live

3. **Manual deployment:**
   - Go to Netlify dashboard
   - Click **"Trigger deploy"** → **"Deploy site"**

---

## 🔐 Security Notes

### Protecting Your API Key

**IMPORTANT:** Your API key is currently hardcoded in the environment variables. For better security:

1. **Monitor usage:** Check your Google AI Studio dashboard regularly
2. **Set quotas:** Configure usage limits in Google Cloud Console
3. **Rotate keys:** If you suspect the key is compromised, generate a new one and update Netlify

### Making Repository Private

If you want to make the repository private again:

1. You'll need a Netlify Pro plan (paid)
2. Or keep it public for free hosting

---

## 📞 Support Resources

- **Netlify Documentation:** https://docs.netlify.com/
- **Netlify Community:** https://answers.netlify.com/
- **GitHub Repository:** https://github.com/Academic-Coding/ecoroute-planner

---

## ✅ Deployment Checklist

Before deploying, make sure:

- [ ] Repository is public on GitHub
- [ ] Code is pushed to the `main` branch
- [ ] Build command is set to `npm run build`
- [ ] Publish directory is set to `dist`
- [ ] Environment variable `VITE_GEMINI_API_KEY` is added
- [ ] Netlify has access to your GitHub repository

---

## 🎉 Success!

Once deployed, your EcoRoute Planner will be live and accessible from anywhere in the world!

**Share your app:**
- Copy the Netlify URL
- Share it with friends, colleagues, or on social media
- Anyone can use it to plan eco-friendly routes!

**Example URL:** `https://ecoroute-planner-xxxxx.netlify.app`

---

*Last updated: November 24, 2025*
