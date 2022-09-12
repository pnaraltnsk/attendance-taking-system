import { useState, useEffect } from "react";
import { useClient } from "./settings";
import { Grid, Button } from "@material-ui/core";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { euclideanDistance } from 'face-api.js'
import * as faceapi from 'face-api.js';
import {getFromFirebase} from "./App.js";
//import imgg from "./images/rihanna.jpg";
export default function Controls(props) {
  const client = useClient();
  const names = props.names;
  const name = props.name;
  const { tracks, setStart, setInCall } = props;
  const [trackState, setTrackState] = useState({ video: true, audio: true });
  const [initializing, setInitializing] = useState(false);
  //const host = (name === names[0]) ? true : false;
  //console.log("host:", host);
  
  const [studentDb, setStudentDb] = useState([]);
  
  
 
  useEffect(() => {
    //props.setNames(JSON.parse(localStorage.getItem("nameList")));
    
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';
      
      Promise.all([
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        
      ]).then(setInitializing(true));
    };
    loadModels();
  }, []); 

 

  const mute = async (type) => {
    if (type === "audio") {
      await tracks[0].setEnabled(!trackState.audio);
      setTrackState((ps) => {
        return { ...ps, audio: !ps.audio };
      });
    } else if (type === "video") {
      await tracks[1].setEnabled(!trackState.video);
      setTrackState((ps) => {
        return { ...ps, video: !ps.video };
      });
    }
  };

  const leaveChannel = async () => {
    await client.leave();
    client.removeAllListeners();
    tracks[0].close();
    tracks[1].close();
    setStart(false);
    setInCall(false);

    const index = names.indexOf(name);
    console.log("index:", index);
    if (index > -1) { 
      names.splice(index, 1);
    }
    localStorage.setItem("nameList", JSON.stringify(names));
    //localStorage.removeItem(JSON.stringify(name));
    props.setNames(names);
    console.log("user left", names);
  };

  const studentNamesinDb = async () => {
    getFromFirebase.onSnapshot((querySnapShot) => {
      const dbStudents = [];
      querySnapShot.forEach((doc) => {
        dbStudents.push(doc.data().name);
      });
      console.log("dbStudents:", dbStudents);
      setStudentDb(dbStudents);
      
    });
  }

  const notAttending = async (names, studentDb, date) => {
      for(var i=0; i<names.length; i++){
        const index = studentDb.indexOf(name);
        if (index > -1) { 
          studentDb.splice(index, 1);
        }
      }
      console.log("studentDb:", studentDb);
      for(var i=0; i<studentDb.length; i++){
        const snapshot = await getFromFirebase.where('name', '==', studentDb[i]).get();
      if (!snapshot.empty) {
        snapshot.forEach(doc => {
          var session = doc.data().sessions;
          const usersSubCollectionGeneralRef = getFromFirebase.doc(doc.id).collection('attendanceRecords');

            usersSubCollectionGeneralRef.doc("session"+session).set({
              date:date, 
              presence:false
            });
            doc.ref.update({
              sessions: session + 1
            });
        });
        
      }
      
    }
  } 

  const attending = async (descriptor, cname, date) => {
    const snapshot = await getFromFirebase.where('name', '==', cname).get();
      if (!snapshot.empty) {
        snapshot.forEach(doc => {
          const dd = Object.values(doc.data().descriptor);
          console.log("id", dd);
          const id = doc.id;
          const distance = euclideanDistance(dd, descriptor);
          console.log("DISTANCE:",distance);

          
          var session = doc.data().sessions;
          
          const usersSubCollectionGeneralRef = getFromFirebase.doc(doc.id).collection('attendanceRecords');
          if(distance<0.5){        
            usersSubCollectionGeneralRef.doc("session"+session).set({
              date:date, 
              presence:true
            });                      
            console.log("matched",doc.data().presence);
          }
          else{
            usersSubCollectionGeneralRef.doc("session"+session).set({
              date:date, 
              presence:false
            }); 
            console.log("not matched",doc.data().presence);
          }  
          
          doc.ref.update({
            sessions: session + 1
          });
      });
      } 
  }
  const captureSnapshot = async () => {
    var images = [];
    await props.setNames(JSON.parse(localStorage.getItem("nameList")));
    
    console.log("UPDATED 2",names);
    var video = document.getElementsByTagName('video')
    const date = new Date().toDateString();
    await studentNamesinDb();
    await notAttending(names, studentDb, date);
    for( var i = 0; i < video.length; i++ ){
      
      console.log("video", video.length);
      var canvas = document.createElement("canvas");
      canvas.width = video.item(i).videoWidth;
      canvas.height = video.item(i).videoHeight;
      var contex = canvas.getContext("2d");
      contex.drawImage(video.item(i), 0, 0, canvas.width, canvas.height);
      //console.log(canvas.toDataURL());

      var a = document.createElement("a");
      a.href  = canvas.toDataURL('image/png');
    
      //console.log(names[i]);     
      //a.download = names[i] + ".png";
      var img = document.createElement("img");
      img.src = a.href;

      //const input = document.getElementById('imgg');
      const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
      console.log("DETECTIONS:", detections);
      
      
      const descriptor = detections[0].descriptor;

      
      //console.log("detections", descriptor);
      const cname = names[i];
      console.log("cname------",i, cname);

      
      
      /*getFromFirebase.doc(names[i]).set({
        name: names[i],
        descriptor: JSON.parse(JSON.stringify(descriptor)),
        sessions: 0
      });*/ 
      
      attending(descriptor, cname, date);
    
      //images.push(detections);
      //faceapi.draw.drawDetections(canvas, detections);
      //faceapi.draw.drawFaceLandmarks(canvas, detections);
      //a.href  = canvas.toDataURL(img);
      //document.body.appendChild(a);
      //a.click();
      //document.body.removeChild(a);

    }
  };
//<img src={imgg} id="imgg" hidden />
  return (
    <Grid container spacing={2} alignItems="center">
      
      <Grid item>
        <Button
          variant="contained"
          color={trackState.audio ? "primary" : "secondary"}
          onClick={() => mute("audio")}
        >
          {trackState.audio ? <MicIcon /> : <MicOffIcon />}
        </Button>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color={trackState.video ? "primary" : "secondary"}
          onClick={() => mute("video")}
        >
          {trackState.video ? <VideocamIcon /> : <VideocamOffIcon />}
        </Button>
      </Grid>
      <Grid item>
        <Button onClick={captureSnapshot}>
          <VideocamIcon />
        </Button>     
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="default"
          onClick={() => leaveChannel()}
        >
          Leave
          <ExitToAppIcon />
        </Button>
      </Grid>
    </Grid>
  );
}
