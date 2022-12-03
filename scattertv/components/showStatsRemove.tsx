import {doc, setDoc,getDoc} from "firebase/firestore"; 

async function showStatsRemove(db,showName,showID,posterPath){
    let showSnap = await getDoc(doc(db,"showStats",String(showID)))
    let showReceived = showSnap.data();
    if(showReceived === undefined){
      await setDoc(doc(db, "showStats", String(showID)), {
        showID:showID,
        showName:showName,
        posterPath:posterPath,
        clickCount : 1,
        addedCount : 0,
      });
    }

    let showClickCount = showReceived.clickCount
    let showAddedCount = showReceived.addedCount-1
    if (showAddedCount < 0){
      showAddedCount = 0
    }
      await setDoc(doc(db, "showStats", String(showID)), {
        showID:showID,
        showName:showName,
        posterPath:posterPath,
        clickCount : showClickCount,
        addedCount : showAddedCount,
      });
      return
  }

  export default showStatsRemove;