# Reverted Changes to Fix Movie Page

## Changes Reverted:
- [x] Detail.jsx - Removed jikanApi usage, back to TMDB API only
- [x] CastList.jsx - Removed anime check, loads casts for all categories
- [x] MovieList.jsx - Removed anime check, loads similar movies for all categories
- [x] VideoList.jsx - Removed source selection dropdown
- [x] detail.scss - Removed source selector styling
- [x] Removed jikanApi import from Detail.jsx

## Result:
- Movie page should work normally with TMDB API
- Anime and animation pages will have 404 errors (original state)
- All other pages should work as before
