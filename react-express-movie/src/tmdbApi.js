import axios from 'axios';

const TMDB_API_KEY = 'b314abefa5607d3419161b2604c3dbaf';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const getMoviePoster = async (title) => {
      try {
         const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: {
               api_key: TMDB_API_KEY,
               query: title,
            }
         });

         const movie = response.data.results[0];
         if (movie && movie.poster_path) {
            return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
         } else {
            return null;
         }
      } catch (error) {
         console.error('Error fetching movie poster:', error);
         return null;
      }
};
