
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, orderBy, query, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBD1K31EZXpBKRcwwUO0xRBs6CKj7uY1Jw",
  authDomain: "memorial-site-4f3ff.firebaseapp.com",
  projectId: "memorial-site-4f3ff",
  storageBucket: "memorial-site-4f3ff.firebasestorage.app",
  messagingSenderId: "8129545468",
  appId: "1:8129545468:web:74849b9aaa608231094379"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export default function FuneralWebsite() {
  const ADMIN_PASSWORD = "admin123";
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [biography, setBiography] = useState("");
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    getDoc(doc(db, "content", "biography")).then(s => {
      setBiography(s.exists() ? s.data().text : "Aquí puede colocarse la biografía.");
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("time", "desc"));
    return onSnapshot(q, snap => setMessages(snap.docs.map(d => d.data())));
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "images"), snap => {
      setImages(snap.docs.map(d => d.data().url));
    });
  }, []);

  useEffect(() => {
    if (!images.length) return;
    const i = setInterval(() => setCurrentSlide(p => (p + 1) % images.length), 30000);
    return () => clearInterval(i);
  }, [images]);

  const saveBiography = () => setDoc(doc(db, "content", "biography"), { text: biography });

  const sendMessage = async () => {
    if (!name || !text) return;
    await addDoc(collection(db, "messages"), { name, text, time: new Date() });
    setText("");
  };

  const uploadImage = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const r = ref(storage, `images/${Date.now()}_${file.name}`);
    await uploadBytes(r, file);
    const url = await getDownloadURL(r);
    await addDoc(collection(db, "images"), { url });
  };

  if (!isAdmin) {
    return (
      <div style={{display:'flex',height:'100vh',justifyContent:'center',alignItems:'center'}}>
        <div>
          <h2>Administrador</h2>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button onClick={()=>password===ADMIN_PASSWORD && setIsAdmin(true)}>Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>En Amorosa Memoria</h1>

      <h2>Biografía</h2>
      <textarea value={biography} onChange={e=>setBiography(e.target.value)} />
      <button onClick={saveBiography}>Guardar</button>
      <p>{biography}</p>

      <h2>Condolencias</h2>
      {messages.map((m,i)=><p key={i}><b>{m.name}</b>: {m.text}</p>)}
      <input placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} />
      <textarea placeholder="Mensaje" value={text} onChange={e=>setText(e.target.value)} />
      <button onClick={sendMessage}>Enviar</button>

      <h2>Galería</h2>
      <input type="file" onChange={uploadImage} />
      {images.length>0 && <img src={images[currentSlide]} width="400" />}
    </div>
  );
}
