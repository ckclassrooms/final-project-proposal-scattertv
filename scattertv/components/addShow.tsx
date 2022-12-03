import {doc, setDoc,getDoc} from "firebase/firestore"; 
import showStats from './showStats'

async function addShow (db,uid,showName,showID,posterPath)  {
    try {
      console.log(posterPath)
      let firstDoc = doc(db, "users", uid);
      const docSnap = await getDoc(firstDoc);
      let showsReceived = docSnap.data();
      let showToAdd = {showID:showID,showName:showName,posterPath};
      let addShow = true;
      const result = showsReceived.shows.map((obj) => {
        if(obj.showName === showName){
          addShow = false;
        }
      });
      if(addShow){
        showsReceived.shows.push(showToAdd)
        showStats(db,showName,showID,posterPath,true)

      }
      let docRef = await setDoc(doc(db, "users", uid), {
        shows:showsReceived.shows
      },{ merge: true });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

export default addShow