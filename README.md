# ScatterTV 2.0

<h2>Deployed Site</h2>

https://scattertv.netlify.app/


<h2>Deployment Instructions</h2>

- Sign up for an account at [themoviedb](https://www.themoviedb.org/?language=en-US)

- Under account settings there will be an option to generate an API key

- Add a `.env` file to the root folder of the repository.

- Create a new key value pair in the following format
  - `REACT_APP_TMDBKEY=APIKEYHERE`

- `npm run build` to create a build file

- or `npm start` to run the application in a dev enviorment

<h2>Current Issues with MVP</h2>

- Sometimes the show information will not appear correctly on the graph. In order to circumvent this, search for the same show again to update the data properly


<h2>Overview</h2>

So a while back, I worked on a web application using Python and Flask called [ScatterTV](https://github.com/mirackara/projectscatter). It was a very simple web application that used a [csv file provided by IMDb](https://datasets.imdbws.com/) that contained tv show rating information to then plot on a graph. However since then, I have discovered an API called [themoviedb](https://www.themoviedb.org/?language=en-US). This site is basically like IMDb, but has a public API that anybody can use to query show information from. Additionally, now that I have learned a bit about security and creating a secure web application, I can see that my original project had a TON of areas where malicious SQL injections were possible.

<h2> What I want the application to support </h2>
The only thing I want to inherit from my original project is the tool I used to graph the shows. Other than that, I want to completely change how the website is built and add major functionalities including:

- User support (You'll be able to 'favorite' a show and see all of your shows you've favorited on your personal page)
  - OAuth Support

- Adding the use of an API instead of pulling data from a CSV file
  - Pulling each search from the CSV file was computationally expensive since I hosted the csv file and queried specifically form that file.
  - Using an API will help mitigate any type of computation on the server side.
  - The API also provides a ton more information than what the csv file could provide. Including actors, roles, posters, descriptions, and similar show suggestions.

- Hosting on Firebase
  - Before, I had used Azure to host the project. Now, I see the benefit of using Firebase for user authentication support and firestore.
  
- Security Improvements (SQL Injections)


<h2> What I want to do </h2>

I want to completely overhaul my previous project from the ground up. 
 
 - Use ReactJS instead of Flask
 - Query API's instead of CSV file
 - Overhaul the UI to support more information about the show
 - User logging in/personal profiles

The ONLY thing I would do similarly is maybe the color scheme and the library I used for the graphs, [CanvasJS](https://canvasjs.com/) 
