import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
const firebaseConfig = {
    apiKey: "AIzaSyCeDpkQAh4pXeiiU0fMKCv3I5MEaOSy-bw",
    authDomain: "zoom-clone-app-aba9c.firebaseapp.com",
    projectId: "zoom-clone-app-aba9c",
    storageBucket: "zoom-clone-app-aba9c.appspot.com",
    messagingSenderId: "54177868768",
    appId: "1:54177868768:web:93cf2faec2fee161149985"
  };

firebase.initializeApp(firebaseConfig);

export default firebase;