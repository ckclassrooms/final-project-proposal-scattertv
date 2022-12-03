import {doc, setDoc,getDoc} from "firebase/firestore"; 

async function showStats(db,showName,showID,posterPath,isAddingToAccount){
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
    }else if(isAddingToAccount){
      let showClickCount = showReceived.clickCount
      let showAddedCount = showReceived.addedCount+1
      await setDoc(doc(db, "showStats", String(showID)), {
        showID:showID,
        showName:showName,
        posterPath:posterPath,
        clickCount : showClickCount,
        addedCount : showAddedCount,
      });
      return
    }else{
      let showClickCount = showReceived.clickCount+1
      let showAddedCount = showReceived.addedCount
      await setDoc(doc(db, "showStats", String(showID)), {
        showID:showID,
        showName:showName,
        posterPath:posterPath,
        clickCount : showClickCount,
        addedCount : showAddedCount,
      });
      return
    }
  }
  export default showStats;