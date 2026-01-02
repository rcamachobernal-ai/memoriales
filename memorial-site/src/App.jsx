
import React, { useState, useEffect } from "react";

export default function FuneralWebsite() {
  const [themeColor, setThemeColor] = useState("#111827");
  const [fontFamily, setFontFamily] = useState("serif");
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const ADMIN_PASSWORD = "admin123";

  const [biography, setBiography] = useState(
    "Aquí puede colocarse la biografía del ser querido. Un texto que honre su vida, valores y legado."
  );

  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const sendMessage = () => {
    if (!name || !text) return;
    const newMessage = { name, text, time: new Date().toLocaleString() };
    setMessages([newMessage, ...messages]);
    setText("");
  };

  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImages([...images, url]);
  };

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [images]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow">
          <h2>Administrador</h2>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={() => password === ADMIN_PASSWORD && setIsAdmin(true)}
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily, color: themeColor }} className="p-6">
      <h1>En Amorosa Memoria</h1>

      <section>
        <h2>Biografía</h2>
        <textarea
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
          rows={5}
        />
        <p>{biography}</p>
      </section>

      <section>
        <h2>Condolencias</h2>
        {messages.map((m, i) => (
          <p key={i}><strong>{m.name}</strong>: {m.text} ({m.time})</p>
        ))}
        <input placeholder="Nombre" value={name} onChange={(e)=>setName(e.target.value)} />
        <textarea placeholder="Mensaje" value={text} onChange={(e)=>setText(e.target.value)} />
        <button onClick={sendMessage}>Enviar</button>
      </section>

      <section>
        <h2>Galería</h2>
        <input type="file" accept="image/*" onChange={uploadImage} />
        {images.length > 0 && <img src={images[currentSlide]} width="300" />}
      </section>
    </div>
  );
}
