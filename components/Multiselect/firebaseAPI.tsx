import React from "react";
import firebase from "firebase";

const fetchSubjects = async (selectedItem, subjects) => {
    await firebase
    .firestore()
    .collection("careers")
    .where("name","==",selectedItem)
    .get().then((snapshot)=>{
        snapshot.docs[0].data().subjects.forEach(element => {
            element.get().then((doc)=>{
                let subject = {
                    id: doc.id,
                    name: doc.data().name,
                    acronym: doc.data().acronym
                }
                subjects.push(subject)
            })
        });
    })
}

export default fetchSubjects;