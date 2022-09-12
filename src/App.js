import { useState, useEffect } from "react";
import { Button, TextField } from "@material-ui/core";
import VideoCall from "./VideoCall";
import firebase from "./firebase";

const getFromFirebase = firebase.firestore().collection("studentFaceDesc");
function App() {
  const [inCall, setInCall] = useState(false);
  const [name, setName] = useState("");
  localStorage.clear();
  const [names, setNames] = useState(JSON.parse(localStorage.getItem('nameList')) ?? []);
  const [students, setStudents] = useState([]);
  

  
  useEffect(() => {
    getDetections();
    //console.log("student",students);
    //localStorage.setItem("nameList", JSON.stringify(names));
    console.log("UPDATED",names);
  } , [names]);

  
  const getDetections = () => {
    
    getFromFirebase.onSnapshot((querySnapShot) => {
      const dbDescriptions = [];
      querySnapShot.forEach((doc) => {
        dbDescriptions.push(doc.data());
      });
      
      setStudents(dbDescriptions);
      
      
    });
  };

  const handleSubmit = (e) => {
    console.log("name:", name); 
    localStorage.setItem("nameList", JSON.stringify([...names, e])); 
    const arr = JSON.parse(localStorage.getItem("nameList"));
    setNames(arr);
    console.log("arr:", arr);
    console.log("Updated:",names);
    console.log("student11",students);
    
  };

  return (
    <div className="App" style={{ height: "100%" }}>
      {inCall ? (
        <VideoCall name={name} names={names} setNames={setNames} students={students} setInCall={setInCall} />
      ) : (
        <>
        <TextField 
          variant="outlined" 
          color="secondary"
          label="Enter your name" 
          value={name}
          required
          onKeyDown={ (e) => {
            if (e.code === 'Space') e.preventDefault()
          }}
          onChange={(e) => setName(e.target.value.toLowerCase())}
        />
        <div style={{ margin: 10 }} />
        <Button
            variant="contained"
            color="primary"
            onClick={() => {                     
              handleSubmit(name);              
              {name ? (setInCall(true)) : (alert("Please enter your name"))}}}
          >
          Join Call
        </Button></>
      )}
    </div>
  );
}

export {getFromFirebase}
export default App;
