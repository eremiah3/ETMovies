# TODO: Remove Auth/Profile/Continue Watching and Enhance Ad Blocking

## Step 1: Remove Authentication System
- [x] Remove src/context/AuthContext.jsx
- [x] Remove src/pages/Login.jsx and src/pages/Login.scss
- [x] Remove src/pages/Signup.jsx and src/pages/Signup.scss
- [x] Remove src/pages/Profile.jsx and src/pages/Profile.scss
- [x] Remove src/components/PrivateRoute.jsx

## Step 2: Remove Continue Watching
- [x] Remove src/components/continue-watching/ directory
- [x] Remove src/utils/continueWatching.js
- [x] Remove continue watching from src/pages/Home.jsx
- [x] Remove continue watching from src/pages/detail/Detail.jsx

## Step 3: Update App and Routes
- [x] Remove AuthProvider from src/App.js
- [x] Remove auth routes from src/routes/Routes.jsx
- [x] Remove auth links from src/components/header/Header.jsx

## Step 4: Enhance Ad Blocking
- [x] Ensure src/utils/adBlocker.js is integrated in VideoList.jsx
- [x] Test ad blocking functionality

## Step 5: Cleanup
- [ ] Remove any unused imports
- [ ] Test the app without auth features
