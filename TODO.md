# Fix Anime Page Task

## Information Gathered
- AnimePage.jsx renders AnimeList component, which fetches anime data from AniList API and displays it using MovieCard with category="anime".
- Animation page works similarly with AnimationList fetching TMDB animation movies.
- Both pages fetch and display data correctly, but anime video watching fails due to unreliable TMDB search in VideoList.jsx.
- VideoList.jsx for anime searches TMDB for a movie with the same title to get TMDB ID, then uses vidsrcApi for video sources. This often fails as not all anime have TMDB movie entries.

## Plan
- [x] Modify src/pages/detail/VideoList.jsx to improve anime video fetching:
  - Search TMDB for both "movie" and "tv" categories with the anime title.
  - Use the first result from either search as TMDB ID for vidsrcApi.
  - Add better error handling and fallback messages if no sources found.
- [x] Change AnimeList.jsx to use Jikan API for fetching anime data.
- [x] Change Detail.jsx to use Jikan API for anime details.
- [x] Add TMDB find method for external ID lookup.
- [x] Update VideoList.jsx to use TMDB find with MAL ID for anime videos.
- Ensure video player displays properly for anime once sources are available.

## Dependent Files to be edited
- src/pages/detail/VideoList.jsx: Enhance anime video fetching logic.
- src/components/anime-list/AnimeList.jsx: Switch to Jikan API.
- src/pages/detail/Detail.jsx: Switch to Jikan API for anime.
- src/api/tmdbApi.js: Add find method.

## Followup steps
- Test AnimePage data fetching and video watching functionality.
- Check for any console errors or issues.
- Verify anime detail pages load and videos play without errors.
