import React, { useRef, useState } from "react";
import styles from "./Canvas.module.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

function Canvas() {
  const [color, setColor] = useState("red");
  const [text, setText] = useState();
  const canvasRef = useRef(null);

  const writeText = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = color;
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const pixelColorData = getPixelColorData(canvasRef.current);
  };

  function downloadCanvasAsPdf(pixelColorData) {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const pixelCanvas = document.createElement("canvas");
    pixelCanvas.width = width;
    pixelCanvas.height = height;
    const pixelContext = pixelCanvas.getContext("2d");

    const imageData = context.getImageData(0, 0, width, height).data;

    const hexCodes = [];

    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];

      const hexColor = rgbToHex(r, g, b);

      hexCodes.push([hexColor]);

      const x = (i / 4) % width;
      const y = Math.floor(i / 4 / width);

      pixelContext.fillStyle = hexColor;
      pixelContext.fillRect(x, y, 1, 1);
    }

    const doc = new jsPDF();
    doc.autoTable({
      head: [["Hex Color Code"]],
      body: hexCodes,
    });

    const pdfBlob = doc.output("blob");

    const link = document.createElement("a");
    link.href = URL.createObjectURL(pdfBlob);
    link.download = "canvas_pixels.pdf";
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }

  function rgbToHex(r, g, b) {
    const componentToHex = (c) => {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  return (
    <div>
      <canvas
        className={styles.can}
        ref={canvasRef}
        width="64"
        height="34"
      ></canvas>

      <div className={styles.text}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <button className={styles.btn} onClick={writeText}>
          Write text
        </button>
        <a href="#" className={styles.down} onClick={downloadCanvasAsPdf}>
          Download
        </a>
      </div>
    </div>
  );
}

const getPixelColorData = (canvas) => {
  const pixelData = [];
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      const color = canvas.getContext("2d").getImageData(x, y, 1, 1).data;
      pixelData.push(color[0] + color[1] + color[2]);
    }
  }

  return pixelData.join("");
};

export default Canvas;
