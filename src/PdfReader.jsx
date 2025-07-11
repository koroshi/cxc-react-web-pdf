import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import axios from 'axios';
import './PdfReader.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const HIGHLIGHT_COLORS = {
  yellow: 'rgba(255, 255, 0, 0.4)',
  green: 'rgba(0, 255, 0, 0.3)',
  blue: 'rgba(0, 0, 255, 0.3)',
};

const PdfReader = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const pdfContainerRef = useRef(null);
  const [annotations, setAnnotations] = useState([]);
  const [pdfUrl, setPdfUrl] = useState('https://koroshi.github.io/cxc-react-web-pdf/test.pdf');

  // 处理PDF文件上传
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPdfFile(URL.createObjectURL(file));
  };

  // 处理PDF来自网页地址
  const handleFileFromUrl = (url) => {
    setPdfFile(url);
  };

  // 保存PDF页数
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // 处理划词
  const handleSelection = (pageIndex) => {
    const selection = window.getSelection();
    if (selection.toString()) {
      setSelectedText(selection.toString());
      translateText(selection.toString());

      const pageDiv = document.querySelectorAll('.pdf-page-wrapper')[pageIndex - 1];
      const pageRect = pageDiv.getBoundingClientRect();

      const rects = [];
      for (let i = 0; i < selection.rangeCount; i++) {
        const range = selection.getRangeAt(i);
        const clientRects = range.getClientRects();
        for (let j = 0; j < clientRects.length; j++) {
          const rect = clientRects[j];
          rects.push({
            left: rect.left - pageRect.left,
            top: rect.top - pageRect.top,
            width: rect.width,
            height: rect.height,
            pageIndex,
          });
        }
      }

      setSelectionRect(rects);
    }
  };

  // 调用翻译API
  const translateText = async (text) => {
    setLoading(true);
    try {
      // 实际项目中替换为真实API
      const response = await axios.post('/api/translate', { text });
      setTranslation(response.data.translation);
    } catch (error) {
      console.error('翻译失败:', error, text);
      setTranslation('翻译服务暂时不可用');
    } finally {
      setLoading(false);
    }
  };

  // 添加高亮标注
  const addHighlight = (color) => {
    if (!selectionRect || selectionRect.length === 0) return;

    const newAnnotations = selectionRect.map((rect) => ({
      id: Date.now() + Math.random(),
      type: 'highlight',
      color,
      text: selectedText,
      ...rect,
    }));
    console.log(newAnnotations)

    setAnnotations((prev) => [...prev, ...newAnnotations]);
  };

  // 渲染标注
  const renderAnnotations = (pageIndex) => {
    return annotations
      .filter((ann) => ann.pageIndex === pageIndex)
      .map((ann) => (
        <div
          key={ann.id}
          style={{
            position: 'absolute',
            left: `${ann.left}px`,
            top: `${ann.top}px`,
            width: `${ann.width}px`,
            height: `${ann.height}px`,
            backgroundColor: ann.color,
            pointerEvents: 'none', // 允许点击穿透到下层 PDF
          }}
        />
      ));
  };

  const colorKey = ['red', 'green', 'blue', 'yellow'];
  const [selectionRect, setSelectionRect] = useState([]);

  return (
    <>
      <div className="pdf-reader-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', overflow: 'scroll' }}>
        <div className="annotation-toolbar">
          {Object.keys(HIGHLIGHT_COLORS).map((color) => (
            <button
              key={color}
              style={{ backgroundColor: color, width: '20px', height: '20px', border: 'none' }}
              onClick={() => addHighlight(HIGHLIGHT_COLORS[color])}
            />
          ))}
          <input
            type="text"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            placeholder="输入PDF地址"
          />
          <button onClick={() => handleFileFromUrl(pdfUrl)}>加载地址</button>
        </div>
        {selectedText && (
          <div className="translation-popup">
            <p>{selectedText}</p>
            <div className="loading-indicator">{loading && '翻译中...'}</div>
            <p className="translation-result">{translation}</p>
          </div>
        )}
      </div>
      <div className="pdf-reader-container">
        <input type="file" accept=".pdf" onChange={handleFileUpload} />
        <div ref={pdfContainerRef}>
          {pdfFile && (
            <Document
              file={pdfFile}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={console.error}
            >
              {Array.from(new Array(numPages), (_, i) => (
                <div key={i} className="pdf-page-wrapper" style={{ position: 'relative', width: 800, zIndex: 1000, border: `1px solid ${colorKey[i]}` }}>
                  <Page key={i} pageNumber={i + 1} width={800} onMouseUp={(e) => handleSelection(i + 1)} />
                  {renderAnnotations(i + 1)}
                </div>
              ))}
            </Document>
          )}
        </div>
      </div>
    </>
  );
};

export default PdfReader;