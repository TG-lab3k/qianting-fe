## 部署vercel
1. 安装 Vercel CLI
```
npm install -g vercel
```
2. 登录
```
vercel login
```

3. 部署
```
vercel deploy -p 项目名（vercel仪表板的项目 slug）
vercel deploy -p qianting-quant-fe --prod
```


## Deploy to Firebase Hosting
```
1. Sign in to Google
firebase login

2. Initiate your project
firebase init

When you're ready, deploy your web app
firebase deploy
```


```
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDh1frsWXawk1k64ais61OU_tFkrt9eNls",
  authDomain: "qianting-66023.firebaseapp.com",
  projectId: "qianting-66023",
  storageBucket: "qianting-66023.firebasestorage.app",
  messagingSenderId: "605272281777",
  appId: "1:605272281777:web:eed07bab716cf8a280c890",
  measurementId: "G-4ZX3NYP4XG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```