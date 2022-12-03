import axios from 'axios';

async function searchShow (setShowSearch,search) {
    if (search.length === 0) {
      setShowSearch([])
    }
    if (search.length >= 2) {
      await axios("https://api.themoviedb.org/3/search/tv?api_key=" + process.env.NEXT_PUBLIC_TMDB + "&language=en-US&page=1&query=" + search + "&include_adult=false").then(
        (res) => {
          const json = res.data;
          let totalResults = 0
          let searchResults = []
          for (let i = 0; i < json.results.length; ++i) {
            if (totalResults === 5) {
              break
            }
            let showName = json.results[i]['name'];
            let showID = json.results[i]['id']
            let posterPath = "https://image.tmdb.org/t/p/w500" + json.results[i]['poster_path']
            searchResults.push([showName, showID, posterPath])
            totalResults += 1
          }
          setShowSearch(searchResults || [])
        }
      )

    }
    return 'Show Found!'
  }

export default searchShow;